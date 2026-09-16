from datetime import datetime
from typing import List, Optional

from sqlalchemy import Enum, ForeignKey, Index, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import PropertyStatus, PropertyType
from app.db.base import Base, TimestampMixin


class Property(Base, TimestampMixin):
    __tablename__ = "properties"
    __table_args__ = (
        Index("ix_properties_city_status", "city", "status"),
        Index("ix_properties_owner_status", "owner_id", "status"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    property_type: Mapped[PropertyType] = mapped_column(Enum(PropertyType, name="propertytype"), nullable=False)
    address: Mapped[str] = mapped_column(String(300), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    pincode: Mapped[str] = mapped_column(String(10), nullable=False)
    latitude: Mapped[Optional[float]] = mapped_column(Numeric(9, 6), nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Numeric(9, 6), nullable=True)

    rent: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    bedrooms: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    bathrooms: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    area: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), nullable=True)  # sq. ft.

    status: Mapped[PropertyStatus] = mapped_column(
        Enum(PropertyStatus, name="propertystatus"), nullable=False, default=PropertyStatus.AVAILABLE, index=True
    )

    owner = relationship("User", back_populates="properties", foreign_keys=[owner_id])
    bookings = relationship("Booking", back_populates="property", cascade="all, delete-orphan")
    leases = relationship("Lease", back_populates="property")
    tickets = relationship("MaintenanceTicket", back_populates="property")
