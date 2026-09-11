"""Authentication endpoints."""
from fastapi import APIRouter, status

from app.core.dependencies import CurrentUser, DB
from app.schemas.auth import LoginRequest, RefreshRequest, RegisterRequest, TokenResponse, UserOut
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, db: DB):
    """Register a new user (OWNER, TENANT or ADMIN role is chosen at registration)."""
    user = await auth_service.register(db, data)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: DB):
    """OAuth2-compatible login returning access and refresh tokens."""
    user = await auth_service.authenticate(db, data.email, data.password)
    await db.commit()
    return auth_service.issue_tokens(user)


@router.get("/me", response_model=UserOut)
async def me(user: CurrentUser):
    """Return the authenticated user's profile."""
    return user


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshRequest, db: DB):
    """Exchange a valid refresh token for a new token pair."""
    return await auth_service.refresh_access_token(db, data.refresh_token)
