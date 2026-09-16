from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.core.constants import UserRole
from app.utils.validators import PhoneValidator


class UserUpdate(BaseModel, PhoneValidator):
    name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    phone: Optional[str] = None
    password: Optional[str] = Field(default=None, min_length=8, max_length=128)


class AdminUserUpdate(BaseModel):
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


class AdminUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: UserRole
    is_active: bool
    created_at: datetime
