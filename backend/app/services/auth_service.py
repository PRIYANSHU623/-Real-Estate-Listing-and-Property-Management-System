"""Authentication business logic: register, login, token refresh."""
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import UserRole
from app.core.exceptions import ConflictException, UnauthorizedException
from app.core.security import (
    TOKEN_TYPE_REFRESH,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import RegisterRequest


async def register(db: AsyncSession, data: RegisterRequest) -> User:
    if await User.get_by_email(db, data.email):
        raise ConflictException("A user with this email already exists")
    user = User(
        name=data.name,
        email=data.email,
        phone=data.phone,
        role=data.role,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    await db.flush()
    return user


async def authenticate(db: AsyncSession, email: str, password: str) -> User:
    user = await User.get_by_email(db, email)
    if user is None or not verify_password(password, user.password_hash):
        raise UnauthorizedException("Incorrect email or password")
    if not user.is_active:
        raise UnauthorizedException("Account is deactivated")
    return user


def issue_tokens(user: User) -> dict:
    return {
        "access_token": create_access_token(str(user.id), user.role.value),
        "refresh_token": create_refresh_token(str(user.id)),
        "token_type": "bearer",
    }


async def refresh_access_token(db: AsyncSession, refresh_token: str) -> dict:
    payload = decode_token(refresh_token, TOKEN_TYPE_REFRESH)
    if payload is None or payload.get("sub") is None:
        raise UnauthorizedException("Invalid or expired refresh token")
    user = await User.get_by_id(db, int(payload["sub"]))
    if user is None or not user.is_active:
        raise UnauthorizedException("Invalid refresh token")
    return issue_tokens(user)
