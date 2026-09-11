from pydantic import BaseModel


class OwnerAnalytics(BaseModel):
    total_properties: int
    occupied_properties: int
    vacant_properties: int
    occupancy_rate: float  # percentage 0-100
    total_revenue: float
    pending_payments: int
    open_maintenance_tickets: int
    active_tenants: int


class AdminAnalytics(BaseModel):
    total_users: int
    total_owners: int
    total_tenants: int
    total_properties: int
    occupied_properties: int
    vacant_properties: int
    occupancy_rate: float
    total_revenue: float
    pending_payments: int
    open_maintenance_tickets: int
    active_leases: int
