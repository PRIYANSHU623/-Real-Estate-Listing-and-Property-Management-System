"""Booking request lifecycle."""
from datetime import date

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import BookingStatus, NotificationType, PropertyStatus, UserRole
from app.core.exceptions import BadRequestException, ForbiddenException, NotFoundException
from app.models.booking import Booking
from app.models.property import Property
from app.models.user import User
from app.schemas.booking import BookingCreate
from app.services import notification_service
from app.services.property_service import get_property_or_404


async def get_booking_or_404(db: AsyncSession, booking_id: int) -> Booking:
    booking = await db.get(Booking, booking_id)
    if booking is None:
        raise NotFoundException("Booking not found")
    return booking


def assert_can_view(user: User, booking: Booking) -> None:
    allowed = user.role == UserRole.ADMIN or user.id in (booking.tenant_id, booking.property.owner_id)
    if not allowed:
        raise ForbiddenException("You cannot access this booking")


async def create_booking(db: AsyncSession, tenant: User, data: BookingCreate) -> Booking:
    prop = await get_property_or_404(db, data.property_id)
    if prop.status != PropertyStatus.AVAILABLE:
        raise BadRequestException(f"Property is not available for booking (status: {prop.status.value})")
    if data.booking_date < date.today():
        raise BadRequestException("booking_date cannot be in the past")

    duplicate = await db.execute(
        select(Booking).where(
            Booking.property_id == data.property_id,
            Booking.tenant_id == tenant.id,
            Booking.booking_date == data.booking_date,
            Booking.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED]),
        )
    )
    if duplicate.scalar_one_or_none():
        raise BadRequestException("You already have an active booking request for this property on this date")

    booking = Booking(property_id=data.property_id, tenant_id=tenant.id, booking_date=data.booking_date, message=data.message)
    db.add(booking)
    await db.flush()

    await notification_service.create_notification(
        db,
        user_id=prop.owner_id,
        title="New booking request",
        message=f"{tenant.name} requested to book '{prop.title}' for {data.booking_date}.",
        type_=NotificationType.BOOKING,
    )
    return booking


async def list_bookings(
    db: AsyncSession, user: User, status: BookingStatus | None, limit: int, offset: int
) -> tuple[list[Booking], int]:
    conditions = []
    if user.role == UserRole.TENANT:
        conditions.append(Booking.tenant_id == user.id)
    elif user.role == UserRole.OWNER:
        conditions.append(Booking.property_id.in_(select(Property.id).where(Property.owner_id == user.id)))
    if status:
        conditions.append(Booking.status == status)

    count_stmt = select(func.count()).select_from(Booking)
    stmt = select(Booking)
    if conditions:
        count_stmt = count_stmt.where(*conditions)
        stmt = stmt.where(*conditions)
    total = (await db.execute(count_stmt)).scalar_one()
    result = await db.execute(stmt.order_by(Booking.created_at.desc()).limit(limit).offset(offset))
    return list(result.scalars().all()), total


async def update_booking_status(db: AsyncSession, user: User, booking_id: int, new_status: BookingStatus) -> Booking:
    booking = await get_booking_or_404(db, booking_id)
    await db.refresh(booking, attribute_names=["property"])
    assert_can_view(user, booking)

    if user.role == UserRole.TENANT:
        # Tenants may only cancel their own pending bookings
        if new_status != BookingStatus.CANCELLED or booking.status != BookingStatus.PENDING:
            raise ForbiddenException("Tenants can only cancel their own pending bookings")
    elif user.role == UserRole.OWNER and booking.property.owner_id != user.id:
        raise ForbiddenException("You do not own this property")

    allowed_transitions = {
        BookingStatus.PENDING: {BookingStatus.CONFIRMED, BookingStatus.REJECTED, BookingStatus.CANCELLED},
        BookingStatus.CONFIRMED: {BookingStatus.CANCELLED},
        BookingStatus.REJECTED: set(),
        BookingStatus.CANCELLED: set(),
    }
    if new_status not in allowed_transitions[booking.status]:
        raise BadRequestException(f"Cannot change booking status from {booking.status.value} to {new_status.value}")

    booking.status = new_status
    if new_status == BookingStatus.CONFIRMED:
        booking.property.status = PropertyStatus.BOOKED
    elif new_status in (BookingStatus.REJECTED, BookingStatus.CANCELLED) and booking.property.status == PropertyStatus.BOOKED:
        booking.property.status = PropertyStatus.AVAILABLE
    await db.flush()

    await notification_service.create_notification(
        db,
        user_id=booking.tenant_id,
        title="Booking status updated",
        message=f"Your booking #{booking.id} for '{booking.property.title}' is now {new_status.value}.",
        type_=NotificationType.BOOKING,
    )
    return booking
