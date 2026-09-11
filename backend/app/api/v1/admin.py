"""Admin management endpoints: user management and oversight."""
from typing import Optional

from fastapi import APIRouter, Depends, status

from app.core.constants import UserRole
from app.core.dependencies import DB, require_admin
from app.core.exceptions import BadRequestException, NotFoundException
from app.models.user import User
from app.schemas.user import AdminUserOut, AdminUserUpdate
from app.utils.helpers import success
from app.utils.pagination import Page, PaginationParams

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=Page[AdminUserOut])
async def list_users(
    db: DB,
    _=Depends(require_admin),
    pagination: PaginationParams = Depends(),
    role: Optional[UserRole] = None,
):
    items, total = await User.list_users(db, role, pagination.page_size, pagination.offset)
    return Page[AdminUserOut].create(items, total, pagination.page, pagination.page_size)


@router.get("/users/{user_id}", response_model=AdminUserOut)
async def get_user(user_id: int, db: DB, _=Depends(require_admin)):
    user = await User.get_by_id(db, user_id)
    if user is None:
        raise NotFoundException("User not found")
    return user


@router.put("/users/{user_id}", response_model=AdminUserOut)
async def update_user(user_id: int, data: AdminUserUpdate, db: DB, admin=Depends(require_admin)):
    user = await User.get_by_id(db, user_id)
    if user is None:
        raise NotFoundException("User not found")
    updates = data.model_dump(exclude_unset=True)
    if not updates:
        raise BadRequestException("No fields to update")
    if user.id == admin.id and updates.get("is_active") is False:
        raise BadRequestException("Admins cannot deactivate their own account")
    for field, value in updates.items():
        setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
async def deactivate_user(user_id: int, db: DB, admin=Depends(require_admin)):
    user = await User.get_by_id(db, user_id)
    if user is None:
        raise NotFoundException("User not found")
    if user.id == admin.id:
        raise BadRequestException("Admins cannot deactivate their own account")
    user.is_active = False
    await db.commit()
    return success(message=f"User {user.email} deactivated")
