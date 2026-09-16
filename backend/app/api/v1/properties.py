"""Property CRUD, search and filtering endpoints."""
from typing import Optional

from fastapi import APIRouter, Depends, Query, status

from app.core.constants import PropertyStatus, PropertyType
from app.core.dependencies import DB, CurrentUser, require_owner_or_admin
from app.schemas.property import PropertyCreate, PropertyOut, PropertyUpdate
from app.services import property_service
from app.utils.helpers import success
from app.utils.pagination import Page, PaginationParams

router = APIRouter(prefix="/properties", tags=["Properties"])


@router.post("", response_model=PropertyOut, status_code=status.HTTP_201_CREATED)
async def create_property(data: PropertyCreate, db: DB, owner=Depends(require_owner_or_admin)):
    prop = await property_service.create_property(db, owner, data)
    await db.commit()
    await db.refresh(prop)
    return prop


@router.get("", response_model=Page[PropertyOut])
async def list_properties(
    db: DB,
    user: CurrentUser,
    pagination: PaginationParams = Depends(),
    search: Optional[str] = Query(None, description="Free-text search in title/description"),
    city: Optional[str] = None,
    property_type: Optional[PropertyType] = None,
    min_rent: Optional[float] = Query(None, ge=0),
    max_rent: Optional[float] = Query(None, ge=0),
    bedrooms: Optional[int] = Query(None, ge=0),
    status_filter: Optional[PropertyStatus] = Query(None, alias="status"),
    owner_id: Optional[int] = Query(None, description="Admins/tenants may filter by owner"),
    sort_by: str = Query("created_at", pattern="^(created_at|rent|bedrooms|city|title)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
):
    items, total = await property_service.list_properties(
        db,
        current_user=user,
        search=search,
        city=city,
        property_type=property_type.value if property_type else None,
        min_rent=min_rent,
        max_rent=max_rent,
        bedrooms=bedrooms,
        status=status_filter,
        owner_id=owner_id,
        sort_by=sort_by,
        sort_order=sort_order,
        limit=pagination.page_size,
        offset=pagination.offset,
    )
    return Page[PropertyOut].create(items, total, pagination.page, pagination.page_size)


@router.get("/{property_id}", response_model=PropertyOut)
async def get_property(property_id: int, db: DB, user: CurrentUser):
    return await property_service.get_property_or_404(db, property_id)


@router.put("/{property_id}", response_model=PropertyOut)
async def update_property(property_id: int, data: PropertyUpdate, db: DB, user=Depends(require_owner_or_admin)):
    prop = await property_service.update_property(db, user, property_id, data)
    await db.commit()
    await db.refresh(prop)
    return prop


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property(property_id: int, db: DB, user=Depends(require_owner_or_admin)):
    await property_service.delete_property(db, user, property_id)
    await db.commit()
