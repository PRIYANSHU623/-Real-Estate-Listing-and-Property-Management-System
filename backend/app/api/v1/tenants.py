"""Tenant management endpoints."""
from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.core.dependencies import DB, CurrentUser
from app.schemas.auth import UserOut
from app.services import tenant_service
from app.utils.pagination import Page, PaginationParams

router = APIRouter(prefix="/tenants", tags=["Tenant Management"])


@router.get("", response_model=Page[UserOut])
async def list_tenants(
    db: DB,
    user: CurrentUser,
    pagination: PaginationParams = Depends(),
    owner_id: Optional[int] = Query(None, description="Admins may filter tenants by owner"),
):
    items, total = await tenant_service.list_tenants(db, user, owner_id, pagination.page_size, pagination.offset)
    return Page[UserOut].create(items, total, pagination.page, pagination.page_size)


@router.get("/{tenant_id}", response_model=UserOut)
async def get_tenant(tenant_id: int, db: DB, user: CurrentUser):
    return await tenant_service.get_tenant_detail(db, user, tenant_id)
