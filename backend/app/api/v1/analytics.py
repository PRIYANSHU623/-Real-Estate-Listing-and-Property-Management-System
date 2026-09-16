"""Analytics endpoints (owner-scoped and system-wide)."""
from fastapi import APIRouter, Depends

from app.core.dependencies import DB, require_admin, require_owner
from app.schemas.analytics import AdminAnalytics, OwnerAnalytics
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/owner", response_model=OwnerAnalytics)
async def owner_analytics(db: DB, owner=Depends(require_owner)):
    """Analytics for the authenticated owner's own properties only."""
    return await analytics_service.owner_analytics(db, owner)


@router.get("/admin", response_model=AdminAnalytics)
async def admin_analytics(db: DB, _=Depends(require_admin)):
    """System-wide analytics (admin only)."""
    return await analytics_service.admin_analytics(db)
