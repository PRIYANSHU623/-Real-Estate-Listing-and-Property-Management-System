from typing import List, Optional

from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class Vendor(Base, TimestampMixin):
    __tablename__ = "vendors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    service_type: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g. PLUMBING, ELECTRICAL
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    tickets = relationship("MaintenanceTicket", back_populates="vendor")
