from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.core.constants import UserRole
from app.utils.validators import PhoneValidator


class RegisterRequest(BaseModel, PhoneValidator):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: Optional[str] = None
    password: str = Field(min_length=8, max_length=128)
    role: UserRole = UserRole.TENANT


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: UserRole
    is_active: bool
