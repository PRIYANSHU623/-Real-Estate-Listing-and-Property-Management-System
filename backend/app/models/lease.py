from datetime import date
from typing import Optional

from sqlalchemy import Date, Enum, ForeignKey, Integer, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import LeaseStatus
from app.db.base import Base, TimestampMixin


class Lease(Base, TimestampMixin):
    __tablename__ = "leases"
    __table_args__ = (UniqueConstraint("property_id", "status", name="uq_one_active_lease_per_property_status"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    monthly_rent: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    security_deposit: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[LeaseStatus] = mapped_column(
        Enum(LeaseStatus, name="leasestatus"), nullable=False, default=LeaseStatus.PENDING, index=True
    )
    agreement_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    property = relationship("Property", back_populates="leases")
    tenant = relationship("User", foreign_keys=[tenant_id])
    owner = relationship("User", foreign_keys=[owner_id])
    payments = relationship("Payment", back_populates="lease")
