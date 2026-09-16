"""User profile endpoints."""
from fastapi import APIRouter, status

from app.core.dependencies import CurrentUser, DB
from app.core.security import hash_password
from app.schemas.auth import UserOut
from app.schemas.user import UserUpdate
from app.utils.helpers import success

router = APIRouter(prefix="/users", tags=["Users"])


@router.put("/me", response_model=UserOut)
async def update_profile(data: UserUpdate, user: CurrentUser, db: DB):
    """Update the authenticated user's own profile."""
    updates = data.model_dump(exclude_unset=True)
    if password := updates.pop("password", None):
        user.password_hash = hash_password(password)
    for field, value in updates.items():
        setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/me", status_code=status.HTTP_200_OK)
async def deactivate_account(user: CurrentUser, db: DB):
    """Soft-deactivate the authenticated user's account."""
    user.is_active = False
    await db.commit()
    return success(message="Account deactivated")
