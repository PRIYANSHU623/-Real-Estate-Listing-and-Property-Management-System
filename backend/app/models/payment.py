from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import PaymentPurpose, PaymentStatus
from app.db.base import Base, TimestampMixin


class Payment(Base, TimestampMixin):
    __tablename__ = "payments"
    __table_args__ = (Index("ix_payments_tenant_status", "tenant_id", "status"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    lease_id: Mapped[Optional[int]] = mapped_column(ForeignKey("leases.id", ondelete="SET NULL"), nullable=True)

    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="INR")
    purpose: Mapped[PaymentPurpose] = mapped_column(
        Enum(PaymentPurpose, name="paymentpurpose"), nullable=False, default=PaymentPurpose.RENT
    )

    razorpay_order_id: Mapped[Optional[str]] = mapped_column(String(100), unique=True, index=True)
    razorpay_payment_id: Mapped[Optional[str]] = mapped_column(String(100), unique=True, index=True)
    razorpay_signature: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, name="paymentstatus"), nullable=False, default=PaymentStatus.CREATED, index=True
    )
    payment_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    failure_reason: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)

    tenant = relationship("User", foreign_keys=[tenant_id])
    property = relationship("Property")
    lease = relationship("Lease", back_populates="payments")
