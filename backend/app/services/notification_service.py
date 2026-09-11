"""In-app notification creation and retrieval."""
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import NotificationType
from app.models.notification import Notification


async def create_notification(
    db: AsyncSession,
    user_id: int,
    title: str,
    message: str,
    type_: NotificationType = NotificationType.SYSTEM,
) -> Notification:
    notification = Notification(user_id=user_id, title=title, message=message, type=type_)
    db.add(notification)
    await db.flush()
    return notification


async def list_notifications(db: AsyncSession, user_id: int, unread_only: bool, limit: int, offset: int) -> tuple[list[Notification], int]:
    conditions = [Notification.user_id == user_id]
    if unread_only:
        conditions.append(Notification.is_read.is_(False))
    total = (await db.execute(select(func.count()).select_from(Notification).where(*conditions))).scalar_one()
    result = await db.execute(
        select(Notification).where(*conditions).order_by(Notification.created_at.desc()).limit(limit).offset(offset)
    )
    return list(result.scalars().all()), total


async def mark_read(db: AsyncSession, user_id: int, notification_id: int) -> Notification | None:
    notification = await db.get(Notification, notification_id)
    if notification is None or notification.user_id != user_id:
        return None
    notification.is_read = True
    await db.flush()
    return notification


async def mark_all_read(db: AsyncSession, user_id: int) -> int:
    result = await db.execute(
        update(Notification).where(Notification.user_id == user_id, Notification.is_read.is_(False)).values(is_read=True)
    )
    return result.rowcount


async def unread_count(db: AsyncSession, user_id: int) -> int:
    return (
        await db.execute(
            select(func.count()).select_from(Notification).where(Notification.user_id == user_id, Notification.is_read.is_(False))
        )
    ).scalar_one()
