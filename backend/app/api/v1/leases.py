"""Lease management endpoints."""
from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.core.constants import LeaseStatus, UserRole
from app.core.dependencies import DB, CurrentUser, require_owner_or_admin
from app.core.exceptions import ForbiddenException
from app.schemas.lease import LeaseCreate, LeaseOut, LeaseUpdate
from app.services import lease_service
from app.utils.pagination import Page, PaginationParams

router = APIRouter(prefix="/leases", tags=["Leases"])


@router.post("", response_model=LeaseOut, status_code=201)
async def create_lease(data: LeaseCreate, db: DB, owner=Depends(require_owner_or_admin)):
    lease = await lease_service.create_lease(db, owner, data)
    await db.commit()
    await db.refresh(lease)
    return lease


@router.get("", response_model=Page[LeaseOut])
async def list_leases(
    db: DB,
    user: CurrentUser,
    pagination: PaginationParams = Depends(),
    status_filter: Optional[LeaseStatus] = Query(None, alias="status"),
):
    items, total = await lease_service.list_leases(db, user, status_filter, pagination.page_size, pagination.offset)
    return Page[LeaseOut].create(items, total, pagination.page, pagination.page_size)


@router.get("/my", response_model=Page[LeaseOut])
async def my_leases(db: DB, user: CurrentUser, pagination: PaginationParams = Depends()):
    """Leases visible to the current user (tenant's own / owner's properties)."""
    items, total = await lease_service.list_leases(db, user, None, pagination.page_size, pagination.offset)
    return Page[LeaseOut].create(items, total, pagination.page, pagination.page_size)


@router.get("/{lease_id}", response_model=LeaseOut)
async def get_lease(lease_id: int, db: DB, user: CurrentUser):
    lease = await lease_service.get_lease_or_404(db, lease_id)
    lease_service.assert_can_access(user, lease)
    return lease


@router.put("/{lease_id}", response_model=LeaseOut)
async def update_lease(lease_id: int, data: LeaseUpdate, db: DB, user: CurrentUser):
    lease = await lease_service.update_lease(db, user, lease_id, data)
    await db.commit()
    await db.refresh(lease)
    return lease


@router.put("/{lease_id}/status", response_model=LeaseOut)
async def update_lease_status(lease_id: int, data: LeaseUpdate, db: DB, user: CurrentUser):
    """Update lease status (pass only `status` in the body)."""
    lease = await lease_service.get_lease_or_404(db, lease_id)
    lease_service.assert_can_access(user, lease)
    if user.role == UserRole.TENANT:
        raise ForbiddenException("Tenants cannot change lease status")
    lease = await lease_service.update_lease(db, user, lease_id, data)
    await db.commit()
    await db.refresh(lease)
    return lease
