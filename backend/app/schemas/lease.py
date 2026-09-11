from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.core.constants import LeaseStatus


class LeaseCreate(BaseModel):
    property_id: int
    tenant_id: int
    start_date: date
    end_date: date
    monthly_rent: float = Field(gt=0)
    security_deposit: float = Field(ge=0)
    agreement_url: Optional[str] = None

    @model_validator(mode="after")
    def check_dates(self) -> "LeaseCreate":
        if self.end_date <= self.start_date:
            raise ValueError("end_date must be after start_date")
        return self


class LeaseUpdate(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    monthly_rent: Optional[float] = Field(default=None, gt=0)
    security_deposit: Optional[float] = Field(default=None, ge=0)
    status: Optional[LeaseStatus] = None
    agreement_url: Optional[str] = None


class LeaseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    property_id: int
    tenant_id: int
    owner_id: int
    start_date: date
    end_date: date
    monthly_rent: float
    security_deposit: float
    status: LeaseStatus
    agreement_url: Optional[str] = None
    created_at: datetime
