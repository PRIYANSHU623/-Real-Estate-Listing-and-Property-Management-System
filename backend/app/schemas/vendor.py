from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.utils.validators import PhoneValidator


class VendorCreate(BaseModel, PhoneValidator):
    name: str = Field(min_length=2, max_length=150)
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    service_type: str = Field(min_length=2, max_length=100)
    is_active: bool = True


class VendorUpdate(BaseModel, PhoneValidator):
    name: Optional[str] = Field(default=None, min_length=2, max_length=150)
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    service_type: Optional[str] = Field(default=None, min_length=2, max_length=100)
    is_active: Optional[bool] = None


class VendorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    service_type: str
    is_active: bool
    created_at: datetime
