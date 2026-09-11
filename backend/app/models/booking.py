from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, Enum, ForeignKey, Integer, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import BookingStatus
from app.db.base import Base, TimestampMixin


class Booking(Base, TimestampMixin):
    __tablename__ = "bookings"
    __table_args__ = (UniqueConstraint("property_id", "tenant_id", "booking_date", name="uq_booking_once_per_day"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus, name="bookingstatus"), nullable=False, default=BookingStatus.PENDING, index=True
    )
    booking_date: Mapped[date] = mapped_column(Date, nullable=False)
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    property = relationship("Property", back_populates="bookings")
    tenant = relationship("User", foreign_keys=[tenant_id])
