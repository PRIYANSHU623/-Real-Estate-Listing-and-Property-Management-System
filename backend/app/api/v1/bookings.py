"""Booking endpoints."""
from typing import Optional

from fastapi import APIRouter, Depends, Query, status

from app.core.constants import BookingStatus
from app.core.dependencies import DB, CurrentUser, require_tenant
from app.schemas.booking import BookingCreate, BookingOut, BookingStatusUpdate
from app.services import booking_service
from app.utils.pagination import Page, PaginationParams

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
async def create_booking(data: BookingCreate, db: DB, tenant=Depends(require_tenant)):
    booking = await booking_service.create_booking(db, tenant, data)
    await db.commit()
    await db.refresh(booking)
    return booking


@router.get("", response_model=Page[BookingOut])
async def list_bookings(
    db: DB,
    user: CurrentUser,
    pagination: PaginationParams = Depends(),
    status_filter: Optional[BookingStatus] = Query(None, alias="status"),
):
    items, total = await booking_service.list_bookings(db, user, status_filter, pagination.page_size, pagination.offset)
    return Page[BookingOut].create(items, total, pagination.page, pagination.page_size)


@router.get("/{booking_id}", response_model=BookingOut)
async def get_booking(booking_id: int, db: DB, user: CurrentUser):
    booking = await booking_service.get_booking_or_404(db, booking_id)
    await db.refresh(booking, attribute_names=["property"])
    booking_service.assert_can_view(user, booking)
    return booking


@router.put("/{booking_id}/status", response_model=BookingOut)
async def update_booking_status(booking_id: int, data: BookingStatusUpdate, db: DB, user: CurrentUser):
    booking = await booking_service.update_booking_status(db, user, booking_id, data.status)
    await db.commit()
    await db.refresh(booking)
    return booking
