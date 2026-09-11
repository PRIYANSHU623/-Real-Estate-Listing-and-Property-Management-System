"""Tenant management: tenant records tied to owner properties, and tenant profiles."""
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import UserRole
from app.core.exceptions import ForbiddenException, NotFoundException
from app.models.lease import Lease
from app.models.user import User


async def get_tenant_or_404(db: AsyncSession, tenant_id: int) -> User:
    tenant = await User.get_by_id(db, tenant_id)
    if tenant is None or tenant.role != UserRole.TENANT:
        raise NotFoundException("Tenant not found")
    return tenant


async def list_tenants(
    db: AsyncSession, requester: User, owner_id: int | None, limit: int, offset: int
) -> tuple[list[User], int]:
    """List tenants. Owners see tenants of their own properties; admins see all."""
    conditions = [User.role == UserRole.TENANT]
    effective_owner = owner_id
    if requester.role == UserRole.OWNER:
        effective_owner = requester.id
    elif requester.role == UserRole.TENANT:
        effective_owner = None
        conditions.append(User.id == requester.id)

    if effective_owner is not None:
        conditions.append(User.id.in_(select(Lease.tenant_id).where(Lease.owner_id == effective_owner)))

    count_stmt = select(func.count()).select_from(User)
    stmt = select(User)
    if conditions:
        count_stmt = count_stmt.where(*conditions)
        stmt = stmt.where(*conditions)
    total = (await db.execute(count_stmt)).scalar_one()
    result = await db.execute(stmt.order_by(User.created_at.desc()).limit(limit).offset(offset))
    return list(result.scalars().all()), total


async def get_tenant_detail(db: AsyncSession, requester: User, tenant_id: int) -> User:
    """Return a tenant profile with access control applied."""
    tenant = await get_tenant_or_404(db, tenant_id)
    if requester.role == UserRole.ADMIN or requester.id == tenant.id:
        return tenant
    if requester.role == UserRole.OWNER:
        linked = await db.execute(
            select(func.count())
            .select_from(Lease)
            .where(Lease.tenant_id == tenant.id, Lease.owner_id == requester.id)
        )
        if linked.scalar_one() > 0:
            return tenant
    raise ForbiddenException("You cannot view this tenant")
