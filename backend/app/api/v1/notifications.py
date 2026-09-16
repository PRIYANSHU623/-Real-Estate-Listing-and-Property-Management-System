"""Notification endpoints."""
from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.core.dependencies import DB, CurrentUser
from app.core.exceptions import NotFoundException
from app.schemas.notification import NotificationOut, UnreadCount
from app.services import notification_service
from app.utils.helpers import success
from app.utils.pagination import Page, PaginationParams

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=Page[NotificationOut])
async def list_notifications(
    db: DB,
    user: CurrentUser,
    pagination: PaginationParams = Depends(),
    unread_only: Optional[bool] = Query(False, alias="unread_only"),
):
    items, total = await notification_service.list_notifications(
        db, user.id, unread_only, pagination.page_size, pagination.offset
    )
    return Page[NotificationOut].create(items, total, pagination.page, pagination.page_size)


@router.get("/unread-count", response_model=UnreadCount)
async def unread_count(db: DB, user: CurrentUser):
    return UnreadCount(unread=await notification_service.unread_count(db, user.id))


@router.put("/{notification_id}/read", response_model=NotificationOut)
async def mark_read(notification_id: int, db: DB, user: CurrentUser):
    notification = await notification_service.mark_read(db, user.id, notification_id)
    if notification is None:
        raise NotFoundException("Notification not found")
    await db.commit()
    await db.refresh(notification)
    return notification


@router.put("/read-all")
async def mark_all_read(db: DB, user: CurrentUser):
    count = await notification_service.mark_all_read(db, user.id)
    await db.commit()
    return success(data={"marked_read": count}, message="All notifications marked as read")
