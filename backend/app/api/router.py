"""Aggregates all v1 routers under /api/v1."""
from fastapi import APIRouter

from app.api.v1 import (
    admin,
    analytics,
    auth,
    bookings,
    leases,
    maintenance,
    notifications,
    payments,
    properties,
    tenants,
    users,
    vendors,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(properties.router)
api_router.include_router(bookings.router)
api_router.include_router(tenants.router)
api_router.include_router(leases.router)
api_router.include_router(payments.router)
api_router.include_router(maintenance.router)
api_router.include_router(vendors.router)
api_router.include_router(notifications.router)
api_router.include_router(analytics.router)
api_router.include_router(admin.router)
