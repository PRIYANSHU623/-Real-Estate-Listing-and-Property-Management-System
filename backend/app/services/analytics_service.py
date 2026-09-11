"""Analytics aggregation for owners (own properties) and admins (system-wide)."""
from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import LeaseStatus, PaymentStatus, PropertyStatus, TicketStatus, UserRole
from app.models.lease import Lease
from app.models.maintenance import MaintenanceTicket
from app.models.payment import Payment
from app.models.property import Property
from app.models.user import User
from app.schemas.analytics import AdminAnalytics, OwnerAnalytics


def _rate(occupied: int, total: int) -> float:
    return round((occupied / total) * 100, 2) if total else 0.0


async def owner_analytics(db: AsyncSession, owner: User) -> OwnerAnalytics:
    owned = [Property.owner_id == owner.id]

    total_props, occupied = (
        await db.execute(
            select(
                func.count(Property.id),
                func.sum(case((Property.status == PropertyStatus.OCCUPIED, 1), else_=0)),
            ).where(*owned)
        )
    ).one()
    total_props = total_props or 0
    occupied = occupied or 0

    revenue = (
        await db.execute(
            select(func.coalesce(func.sum(Payment.amount), 0)).where(
                Payment.property_id.in_(select(Property.id).where(*owned)),
                Payment.status == PaymentStatus.PAID,
            )
        )
    ).scalar_one()

    pending = (
        await db.execute(
            select(func.count())
            .select_from(Payment)
            .where(
                Payment.property_id.in_(select(Property.id).where(*owned)),
                Payment.status.in_([PaymentStatus.PENDING, PaymentStatus.CREATED]),
            )
        )
    ).scalar_one()

    open_tickets = (
        await db.execute(
            select(func.count())
            .select_from(MaintenanceTicket)
            .where(
                MaintenanceTicket.property_id.in_(select(Property.id).where(*owned)),
                MaintenanceTicket.status.in_([TicketStatus.OPEN, TicketStatus.ASSIGNED, TicketStatus.IN_PROGRESS]),
            )
        )
    ).scalar_one()

    active_tenants = (
        await db.execute(
            select(func.count(func.distinct(Lease.tenant_id))).where(
                Lease.owner_id == owner.id, Lease.status == LeaseStatus.ACTIVE
            )
        )
    ).scalar_one()

    return OwnerAnalytics(
        total_properties=total_props,
        occupied_properties=occupied,
        vacant_properties=total_props - occupied,
        occupancy_rate=_rate(occupied, total_props),
        total_revenue=float(revenue or 0),
        pending_payments=pending,
        open_maintenance_tickets=open_tickets,
        active_tenants=active_tenants,
    )


async def admin_analytics(db: AsyncSession) -> AdminAnalytics:
    total_users, owners, tenants = (
        await db.execute(
            select(
                func.count(User.id),
                func.sum(case((User.role == UserRole.OWNER, 1), else_=0)),
                func.sum(case((User.role == UserRole.TENANT, 1), else_=0)),
            )
        )
    ).one()

    total_props, occupied = (
        await db.execute(
            select(
                func.count(Property.id),
                func.sum(case((Property.status == PropertyStatus.OCCUPIED, 1), else_=0)),
            )
        )
    ).one()
    total_props = total_props or 0
    occupied = occupied or 0

    revenue = (
        await db.execute(select(func.coalesce(func.sum(Payment.amount), 0)).where(Payment.status == PaymentStatus.PAID))
    ).scalar_one()

    pending = (
        await db.execute(
            select(func.count())
            .select_from(Payment)
            .where(Payment.status.in_([PaymentStatus.PENDING, PaymentStatus.CREATED]))
        )
    ).scalar_one()

    open_tickets = (
        await db.execute(
            select(func.count())
            .select_from(MaintenanceTicket)
            .where(MaintenanceTicket.status.in_([TicketStatus.OPEN, TicketStatus.ASSIGNED, TicketStatus.IN_PROGRESS]))
        )
    ).scalar_one()

    active_leases = (
        await db.execute(select(func.count()).select_from(Lease).where(Lease.status == LeaseStatus.ACTIVE))
    ).scalar_one()

    return AdminAnalytics(
        total_users=total_users,
        total_owners=owners or 0,
        total_tenants=tenants or 0,
        total_properties=total_props,
        occupied_properties=occupied or 0,
        vacant_properties=total_props - (occupied or 0),
        occupancy_rate=_rate(occupied or 0, total_props),
        total_revenue=float(revenue or 0),
        pending_payments=pending,
        open_maintenance_tickets=open_tickets,
        active_leases=active_leases,
    )
