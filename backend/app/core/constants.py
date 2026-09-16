"""Shared enums and constants used across models, schemas and services."""
import enum


class UserRole(str, enum.Enum):
    OWNER = "OWNER"
    TENANT = "TENANT"
    ADMIN = "ADMIN"


class PropertyType(str, enum.Enum):
    APARTMENT = "APARTMENT"
    HOUSE = "HOUSE"
    VILLA = "VILLA"
    STUDIO = "STUDIO"
    PLOT = "PLOT"
    COMMERCIAL = "COMMERCIAL"


class PropertyStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    BOOKED = "BOOKED"
    OCCUPIED = "OCCUPIED"
    INACTIVE = "INACTIVE"


class BookingStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"


class LeaseStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    PENDING = "PENDING"
    EXPIRED = "EXPIRED"
    TERMINATED = "TERMINATED"


class PaymentStatus(str, enum.Enum):
    CREATED = "CREATED"
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


class PaymentPurpose(str, enum.Enum):
    RENT = "RENT"
    SECURITY_DEPOSIT = "SECURITY_DEPOSIT"
    BOOKING_FEE = "BOOKING_FEE"


class TicketPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"


class TicketStatus(str, enum.Enum):
    OPEN = "OPEN"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


class NotificationType(str, enum.Enum):
    PAYMENT = "PAYMENT"
    BOOKING = "BOOKING"
    MAINTENANCE = "MAINTENANCE"
    LEASE = "LEASE"
    SYSTEM = "SYSTEM"
