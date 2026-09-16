from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.core.constants import NotificationType


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    message: str
    type: NotificationType
    is_read: bool
    created_at: datetime


class UnreadCount(BaseModel):
    unread: int
