from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.core.constants import TicketPriority, TicketStatus


class TicketCreate(BaseModel):
    property_id: int
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10)
    priority: TicketPriority = TicketPriority.MEDIUM


class TicketUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=3, max_length=200)
    description: Optional[str] = Field(default=None, min_length=10)
    priority: Optional[TicketPriority] = None


class TicketStatusUpdate(BaseModel):
    status: TicketStatus


class TicketAssign(BaseModel):
    vendor_id: int


class TicketOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    property_id: int
    tenant_id: int
    vendor_id: Optional[int] = None
    title: str
    description: str
    priority: TicketPriority
    status: TicketStatus
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
