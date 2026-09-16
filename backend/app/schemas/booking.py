from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.core.constants import BookingStatus


class BookingCreate(BaseModel):
    property_id: int
    booking_date: date
    message: Optional[str] = None


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    property_id: int
    tenant_id: int
    status: BookingStatus
    booking_date: date
    message: Optional[str] = None
    created_at: datetime
