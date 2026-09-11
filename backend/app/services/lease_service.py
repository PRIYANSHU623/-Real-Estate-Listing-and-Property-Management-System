"""Lease lifecycle: creation (from confirmed bookings or directly), updates, status."""
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import LeaseStatus, NotificationType, PropertyStatus, UserRole
from app.core.exceptions import BadRequestException, ConflictException, ForbiddenException, NotFoundException
from app.models.lease import Lease
from app.models.property import Property
from app.models.user import User
from app.schemas.lease import LeaseCreate, LeaseUpdate
from app.services import notification_service
from app.services.property_service import get_property_or_404


async def get_lease_or_404(db: AsyncSession, lease_id: int) -> Lease:
    lease = await db.get(Lease, lease_id)
    if lease is None:
        raise NotFoundException("Lease not found")
    return lease


def assert_can_access(user: User, lease: Lease) -> None:
    if user.role == UserRole.ADMIN:
        return
    if user.id not in (lease.tenant_id, lease.owner_id):
        raise ForbiddenException("You cannot access this lease")


async def create_lease(db: AsyncSession, owner_or_admin: User, data: LeaseCreate) -> Lease:
    prop = await get_property_or_404(db, data.property_id)
    if owner_or_admin.role == UserRole.OWNER and prop.owner_id != owner_or_admin.id:
        raise ForbiddenException("You do not own this property")
    if prop.status in (PropertyStatus.OCCUPIED, PropertyStatus.INACTIVE):
        raise ConflictException(f"Property cannot be leased (status: {prop.status.value})")

    tenant = await User.get_by_id(db, data.tenant_id)
    if tenant is None or tenant.role != UserRole.TENANT or not tenant.is_active:
        raise BadRequestException("Invalid tenant")

    active = await db.execute(
        select(Lease).where(Lease.property_id == prop.id, Lease.status.in_([LeaseStatus.PENDING, LeaseStatus.ACTIVE]))
    )
    if active.scalar_one_or_none():
        raise ConflictException("Property already has an active or pending lease")

    lease = Lease(**data.model_dump(), owner_id=prop.owner_id, status=LeaseStatus.PENDING)
    db.add(lease)
    await db.flush()

    await notification_service.create_notification(
        db,
        user_id=tenant.id,
        title="New lease created",
        message=f"A lease for '{prop.title}' ({data.start_date} to {data.end_date}) has been created for you.",
        type_=NotificationType.LEASE,
    )
    return lease


async def update_lease(db: AsyncSession, user: User, lease_id: int, data: LeaseUpdate) -> Lease:
    lease = await get_lease_or_404(db, lease_id)
    if user.role != UserRole.ADMIN and lease.owner_id != user.id:
        raise ForbiddenException("Only the property owner or an admin can update a lease")

    updates = data.model_dump(exclude_unset=True)
    if not updates:
        raise BadRequestException("No fields to update")

    new_status = updates.pop("status", None)
    for field, value in updates.items():
        setattr(lease, field, value)
    if lease.end_date <= lease.start_date:
        raise BadRequestException("end_date must be after start_date")

    if new_status is not None:
        await set_lease_status(db, lease, new_status, notify=False)
    await db.flush()
    return lease


async def set_lease_status(db: AsyncSession, lease: Lease, new_status: LeaseStatus, notify: bool = True) -> None:
    if new_status == lease.status:
        return
    if lease.status == LeaseStatus.TERMINATED and new_status != LeaseStatus.TERMINATED:
        raise BadRequestException("A terminated lease cannot be reactivated")

    lease.status = new_status
    await db.flush()

    # Keep property status consistent with the lease lifecycle
    await db.refresh(lease, attribute_names=["property"])
    if new_status == LeaseStatus.ACTIVE:
        lease.property.status = PropertyStatus.OCCUPIED
    elif new_status in (LeaseStatus.TERMINATED, LeaseStatus.EXPIRED) and lease.property.status == PropertyStatus.OCCUPIED:
        lease.property.status = PropertyStatus.AVAILABLE
    await db.flush()

    if notify:
        await notification_service.create_notification(
            db,
            user_id=lease.tenant_id,
            title="Lease status updated",
            message=f"Your lease #{lease.id} is now {new_status.value}.",
            type_=NotificationType.LEASE,
        )


async def list_leases(
    db: AsyncSession, user: User, status: LeaseStatus | None, limit: int, offset: int
) -> tuple[list[Lease], int]:
    conditions = []
    if user.role == UserRole.TENANT:
        conditions.append(Lease.tenant_id == user.id)
    elif user.role == UserRole.OWNER:
        conditions.append(Lease.owner_id == user.id)
    if status:
        conditions.append(Lease.status == status)

    count_stmt = select(func.count()).select_from(Lease)
    stmt = select(Lease)
    if conditions:
        count_stmt = count_stmt.where(*conditions)
        stmt = stmt.where(*conditions)
    total = (await db.execute(count_stmt)).scalar_one()
    result = await db.execute(stmt.order_by(Lease.created_at.desc()).limit(limit).offset(offset))
    return list(result.scalars().all()), total
