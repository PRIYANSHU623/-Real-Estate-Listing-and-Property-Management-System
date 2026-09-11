"""Vendor management endpoints (admin and owners)."""
from typing import Optional

from fastapi import APIRouter, Depends, Query, status

from app.core.dependencies import DB, require_owner_or_admin, require_admin
from app.schemas.vendor import VendorCreate, VendorOut, VendorUpdate
from app.services import maintenance_service
from app.utils.helpers import success
from app.utils.pagination import Page, PaginationParams

router = APIRouter(prefix="/vendors", tags=["Vendors"])


@router.post("", response_model=VendorOut, status_code=status.HTTP_201_CREATED)
async def create_vendor(data: VendorCreate, db: DB, _=Depends(require_admin)):
    vendor = await maintenance_service.create_vendor(db, data)
    await db.commit()
    await db.refresh(vendor)
    return vendor


@router.get("", response_model=Page[VendorOut])
async def list_vendors(
    db: DB,
    _=Depends(require_owner_or_admin),
    pagination: PaginationParams = Depends(),
    service_type: Optional[str] = None,
):
    items, total = await maintenance_service.list_vendors(db, service_type, pagination.page_size, pagination.offset)
    return Page[VendorOut].create(items, total, pagination.page, pagination.page_size)


@router.get("/{vendor_id}", response_model=VendorOut)
async def get_vendor(vendor_id: int, db: DB, _=Depends(require_owner_or_admin)):
    return await maintenance_service.get_vendor_or_404(db, vendor_id)


@router.put("/{vendor_id}", response_model=VendorOut)
async def update_vendor(vendor_id: int, data: VendorUpdate, db: DB, _=Depends(require_admin)):
    vendor = await maintenance_service.update_vendor(db, vendor_id, data)
    await db.commit()
    await db.refresh(vendor)
    return vendor


@router.delete("/{vendor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vendor(vendor_id: int, db: DB, _=Depends(require_admin)):
    await maintenance_service.delete_vendor(db, vendor_id)
    await db.commit()
