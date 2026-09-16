"""Reusable authentication / RBAC dependencies."""
from typing import Annotated

from fastapi import Depends, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import UserRole
from app.core.exceptions import ForbiddenException, UnauthorizedException
from app.core.security import TOKEN_TYPE_ACCESS, decode_token
from app.db.session import get_db
from app.models.user import User

# tokenUrl is the OAuth2 password-flow login endpoint for Swagger's "Authorize" button
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

DB = Annotated[AsyncSession, Depends(get_db)]


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: DB,
) -> User:
    """Resolve the JWT bearer token to the active User row."""
    credentials_error = UnauthorizedException("Could not validate credentials")
    try:
        payload = decode_token(token, TOKEN_TYPE_ACCESS)
    except JWTError:
        raise credentials_error
    if payload is None or payload.get("sub") is None:
        raise credentials_error
    user = await User.get_by_id(db, int(payload["sub"]))
    if user is None or not user.is_active:
        raise credentials_error
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


async def require_owner(user: CurrentUser) -> User:
    if user.role != UserRole.OWNER:
        raise ForbiddenException("This endpoint requires role: OWNER")
    return user


async def require_tenant(user: CurrentUser) -> User:
    if user.role != UserRole.TENANT:
        raise ForbiddenException("This endpoint requires role: TENANT")
    return user


async def require_admin(user: CurrentUser) -> User:
    if user.role != UserRole.ADMIN:
        raise ForbiddenException("This endpoint requires role: ADMIN")
    return user


async def require_owner_or_admin(user: CurrentUser) -> User:
    if user.role not in (UserRole.OWNER, UserRole.ADMIN):
        raise ForbiddenException("This endpoint requires role: OWNER or ADMIN")
    return user
