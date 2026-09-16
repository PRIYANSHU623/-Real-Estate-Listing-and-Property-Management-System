from datetime import datetime
from typing import List, Optional

from sqlalchemy import Boolean, Enum, Integer, String, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import UserRole
from app.db.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, name="userrole"), nullable=False, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    properties = relationship("Property", back_populates="owner", foreign_keys="Property.owner_id")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

    @classmethod
    async def get_by_email(cls, db: AsyncSession, email: str) -> Optional["User"]:
        result = await db.execute(select(cls).where(cls.email == email))
        return result.scalar_one_or_none()

    @classmethod
    async def get_by_id(cls, db: AsyncSession, user_id: int) -> Optional["User"]:
        return await db.get(cls, user_id)

    @classmethod
    async def list_users(
        cls, db: AsyncSession, role: Optional["UserRole"], limit: int, offset: int
    ) -> tuple[List["User"], int]:
        query = select(cls)
        if role is not None:
            query = query.where(cls.role == role)
        total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar_one()
        result = await db.execute(query.order_by(cls.created_at.desc()).limit(limit).offset(offset))
        return list(result.scalars().all()), total
