"""Property CRUD, search, filtering, sorting and pagination."""
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import PropertyStatus, UserRole
from app.core.exceptions import BadRequestException, ConflictException, ForbiddenException, NotFoundException
from app.models.property import Property
from app.models.user import User
from app.schemas.property import PropertyCreate, PropertyUpdate

SORTABLE_COLUMNS = {
    "created_at": Property.created_at,
    "rent": Property.rent,
    "bedrooms": Property.bedrooms,
    "city": Property.city,
    "title": Property.title,
}


async def get_property_or_404(db: AsyncSession, property_id: int) -> Property:
    prop = await db.get(Property, property_id)
    if prop is None:
        raise NotFoundException("Property not found")
    return prop


def assert_can_manage(user: User, prop: Property) -> None:
    if user.role != UserRole.ADMIN and prop.owner_id != user.id:
        raise ForbiddenException("You do not own this property")


async def create_property(db: AsyncSession, owner: User, data: PropertyCreate) -> Property:
    prop = Property(**data.model_dump(), owner_id=owner.id)
    db.add(prop)
    await db.flush()
    return prop


async def update_property(db: AsyncSession, user: User, property_id: int, data: PropertyUpdate) -> Property:
    prop = await get_property_or_404(db, property_id)
    assert_can_manage(user, prop)
    updates = data.model_dump(exclude_unset=True)
    if not updates:
        raise BadRequestException("No fields to update")
    for field, value in updates.items():
        setattr(prop, field, value)
    await db.flush()
    return prop


async def delete_property(db: AsyncSession, user: User, property_id: int) -> None:
    prop = await get_property_or_404(db, property_id)
    assert_can_manage(user, prop)
    if prop.status == PropertyStatus.OCCUPIED:
        raise ConflictException("Cannot delete a property with an active occupant; terminate the lease first")
    await db.delete(prop)
    await db.flush()


async def list_properties(
    db: AsyncSession,
    *,
    current_user: User,
    search: Optional[str] = None,
    city: Optional[str] = None,
    property_type: Optional[str] = None,
    min_rent: Optional[float] = None,
    max_rent: Optional[float] = None,
    bedrooms: Optional[int] = None,
    status: Optional[PropertyStatus] = None,
    owner_id: Optional[int] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    limit: int = 10,
    offset: int = 0,
) -> tuple[list[Property], int]:
    """Search/filter properties. Owners see only their own; tenants see all non-inactive ones."""
    query = select(Property)
    conditions = []

    if current_user.role == UserRole.OWNER and owner_id is None:
        conditions.append(Property.owner_id == current_user.id)
    elif owner_id is not None:
        conditions.append(Property.owner_id == owner_id)

    if current_user.role == UserRole.TENANT and status is None:
        conditions.append(Property.status != PropertyStatus.INACTIVE)

    if search:
        conditions.append((Property.title.ilike(f"%{search}%")) | (Property.description.ilike(f"%{search}%")))
    if city:
        conditions.append(Property.city.ilike(f"%{city}%"))
    if property_type:
        conditions.append(Property.property_type == property_type)
    if min_rent is not None:
        conditions.append(Property.rent >= min_rent)
    if max_rent is not None:
        conditions.append(Property.rent <= max_rent)
    if bedrooms is not None:
        conditions.append(Property.bedrooms >= bedrooms)
    if status is not None:
        conditions.append(Property.status == status)

    count_stmt = select(func.count()).select_from(Property)
    if conditions:
        count_stmt = count_stmt.where(*conditions)
    total = (await db.execute(count_stmt)).scalar_one()

    column = SORTABLE_COLUMNS.get(sort_by)
    if column is None:
        raise BadRequestException(f"Cannot sort by '{sort_by}'. Allowed: {', '.join(SORTABLE_COLUMNS)}")
    order = column.desc() if sort_order.lower() == "desc" else column.asc()

    stmt = select(Property)
    if conditions:
        stmt = stmt.where(*conditions)
    stmt = stmt.order_by(order).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return list(result.scalars().all()), total
