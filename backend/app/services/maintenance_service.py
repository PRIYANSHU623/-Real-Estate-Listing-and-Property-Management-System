"""Maintenance ticket lifecycle and vendor management."""
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import NotificationType, TicketStatus, UserRole
from app.core.exceptions import BadRequestException, ConflictException, ForbiddenException, NotFoundException
from app.models.booking import Booking
from app.models.lease import Lease
from app.models.maintenance import MaintenanceTicket
from app.models.property import Property
from app.models.user import User
from app.models.vendor import Vendor
from app.schemas.maintenance import TicketCreate, TicketUpdate
from app.services import notification_service
from app.services.property_service import get_property_or_404


async def get_ticket_or_404(db: AsyncSession, ticket_id: int) -> MaintenanceTicket:
    ticket = await db.get(MaintenanceTicket, ticket_id)
    if ticket is None:
        raise NotFoundException("Maintenance ticket not found")
    return ticket


async def load_property(db: AsyncSession, ticket: MaintenanceTicket) -> Property:
    await db.refresh(ticket, attribute_names=["property"])
    return ticket.property


def assert_can_view(user: User, ticket: MaintenanceTicket, prop: Property) -> None:
    if user.role == UserRole.ADMIN:
        return
    if user.id not in (ticket.tenant_id, prop.owner_id):
        raise ForbiddenException("You cannot access this maintenance ticket")


async def create_ticket(db: AsyncSession, tenant: User, data: TicketCreate) -> MaintenanceTicket:
    """Tenants can raise tickets only for properties they have a stake in (lease or booking)."""
    prop = await get_property_or_404(db, data.property_id)
    if prop.owner_id == tenant.id:
        raise BadRequestException("Owners cannot raise tenant tickets for their own property")

    stake = await db.execute(
        select(func.count())
        .select_from(Lease)
        .where(Lease.property_id == prop.id, Lease.tenant_id == tenant.id, Lease.status.in_(["PENDING", "ACTIVE"]))
    )
    if stake.scalar_one() == 0:
        booked = await db.execute(
            select(func.count())
            .select_from(Booking)
            .where(Booking.property_id == prop.id, Booking.tenant_id == tenant.id, Booking.status == "CONFIRMED")
        )
        if booked.scalar_one() == 0:
            raise ForbiddenException("You can only raise tickets for properties you lease or have booked")

    ticket = MaintenanceTicket(property_id=data.property_id, tenant_id=tenant.id, **data.model_dump(exclude={"property_id"}))
    db.add(ticket)
    await db.flush()

    await notification_service.create_notification(
        db,
        user_id=prop.owner_id,
        title="New maintenance ticket",
        message=f"{tenant.name} raised a {data.priority.value} priority ticket: {data.title}",
        type_=NotificationType.MAINTENANCE,
    )
    return ticket


async def update_ticket(db: AsyncSession, user: User, ticket_id: int, data: TicketUpdate) -> MaintenanceTicket:
    ticket = await get_ticket_or_404(db, ticket_id)
    prop = await load_property(db, ticket)
    if user.id != ticket.tenant_id and user.role != UserRole.ADMIN and prop.owner_id != user.id:
        raise ForbiddenException("You cannot update this ticket")
    if ticket.status in (TicketStatus.RESOLVED, TicketStatus.CLOSED):
        raise ConflictException("Ticket is already resolved or closed")

    updates = data.model_dump(exclude_unset=True)
    if not updates:
        raise BadRequestException("No fields to update")
    for field, value in updates.items():
        setattr(ticket, field, value)
    await db.flush()
    return ticket


async def update_ticket_status(db: AsyncSession, user: User, ticket_id: int, new_status: TicketStatus) -> MaintenanceTicket:
    ticket = await get_ticket_or_404(db, ticket_id)
    prop = await load_property(db, ticket)
    is_manager = user.role == UserRole.ADMIN or prop.owner_id == user.id
    if not is_manager and user.id != ticket.tenant_id:
        raise ForbiddenException("You cannot update this ticket")

    allowed = {
        TicketStatus.OPEN: {TicketStatus.ASSIGNED, TicketStatus.IN_PROGRESS, TicketStatus.CLOSED},
        TicketStatus.ASSIGNED: {TicketStatus.IN_PROGRESS, TicketStatus.CLOSED},
        TicketStatus.IN_PROGRESS: {TicketStatus.RESOLVED, TicketStatus.CLOSED},
        TicketStatus.RESOLVED: {TicketStatus.CLOSED},
        TicketStatus.CLOSED: set(),
    }
    if new_status not in allowed[ticket.status]:
        raise BadRequestException(f"Cannot move ticket from {ticket.status.value} to {new_status.value}")
    if new_status in (TicketStatus.ASSIGNED, TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CLOSED) and not is_manager:
        raise ForbiddenException("Only the owner or an admin can progress a ticket's status")

    ticket.status = new_status
    if new_status == TicketStatus.RESOLVED:
        ticket.resolved_at = datetime.now(timezone.utc)
    await db.flush()

    recipients = {ticket.tenant_id, prop.owner_id} - {user.id}
    for uid in recipients:
        await notification_service.create_notification(
            db,
            user_id=uid,
            title="Maintenance ticket updated",
            message=f"Ticket #{ticket.id} '{ticket.title}' is now {new_status.value}.",
            type_=NotificationType.MAINTENANCE,
        )
    return ticket


async def assign_ticket(db: AsyncSession, user: User, ticket_id: int, vendor_id: int) -> MaintenanceTicket:
    ticket = await get_ticket_or_404(db, ticket_id)
    prop = await load_property(db, ticket)
    if user.role != UserRole.ADMIN and prop.owner_id != user.id:
        raise ForbiddenException("Only the property owner or an admin can assign a ticket")

    vendor = await db.get(Vendor, vendor_id)
    if vendor is None:
        raise NotFoundException("Vendor not found")
    if not vendor.is_active:
        raise BadRequestException("Vendor is inactive")

    ticket.vendor_id = vendor_id
    if ticket.status == TicketStatus.OPEN:
        ticket.status = TicketStatus.ASSIGNED
    await db.flush()

    await notification_service.create_notification(
        db,
        user_id=ticket.tenant_id,
        title="Maintenance ticket assigned",
        message=f"Ticket #{ticket.id} has been assigned to {vendor.name}.",
        type_=NotificationType.MAINTENANCE,
    )
    return ticket


async def list_tickets(
    db: AsyncSession,
    user: User,
    status: TicketStatus | None,
    priority=None,
    property_id: int | None = None,
    limit: int = 10,
    offset: int = 0,
) -> tuple[list[MaintenanceTicket], int]:
    conditions = []
    if user.role == UserRole.TENANT:
        conditions.append(MaintenanceTicket.tenant_id == user.id)
    elif user.role == UserRole.OWNER:
        conditions.append(
            MaintenanceTicket.property_id.in_(select(Property.id).where(Property.owner_id == user.id))
        )
    if status:
        conditions.append(MaintenanceTicket.status == status)
    if priority:
        conditions.append(MaintenanceTicket.priority == priority)
    if property_id:
        conditions.append(MaintenanceTicket.property_id == property_id)

    count_stmt = select(func.count()).select_from(MaintenanceTicket)
    stmt = select(MaintenanceTicket)
    if conditions:
        count_stmt = count_stmt.where(*conditions)
        stmt = stmt.where(*conditions)
    total = (await db.execute(count_stmt)).scalar_one()
    result = await db.execute(stmt.order_by(MaintenanceTicket.created_at.desc()).limit(limit).offset(offset))
    return list(result.scalars().all()), total


# ---------- Vendors ----------


async def get_vendor_or_404(db: AsyncSession, vendor_id: int) -> Vendor:
    vendor = await db.get(Vendor, vendor_id)
    if vendor is None:
        raise NotFoundException("Vendor not found")
    return vendor


async def create_vendor(db: AsyncSession, data) -> Vendor:
    vendor = Vendor(**data.model_dump())
    db.add(vendor)
    await db.flush()
    return vendor


async def update_vendor(db: AsyncSession, vendor_id: int, data) -> Vendor:
    vendor = await get_vendor_or_404(db, vendor_id)
    updates = data.model_dump(exclude_unset=True)
    if not updates:
        raise BadRequestException("No fields to update")
    for field, value in updates.items():
        setattr(vendor, field, value)
    await db.flush()
    return vendor


async def delete_vendor(db: AsyncSession, vendor_id: int) -> None:
    vendor = await get_vendor_or_404(db, vendor_id)
    await db.delete(vendor)
    await db.flush()


async def list_vendors(db: AsyncSession, service_type: str | None, limit: int, offset: int) -> tuple[list[Vendor], int]:
    conditions = []
    if service_type:
        conditions.append(Vendor.service_type.ilike(f"%{service_type}%"))
    count_stmt = select(func.count()).select_from(Vendor)
    stmt = select(Vendor)
    if conditions:
        count_stmt = count_stmt.where(*conditions)
        stmt = stmt.where(*conditions)
    total = (await db.execute(count_stmt)).scalar_one()
    result = await db.execute(stmt.order_by(Vendor.created_at.desc()).limit(limit).offset(offset))
    return list(result.scalars().all()), total
