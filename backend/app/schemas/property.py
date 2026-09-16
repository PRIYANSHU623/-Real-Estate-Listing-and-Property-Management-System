from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.core.constants import PropertyStatus, PropertyType
from app.utils.validators import PincodeValidator


class PropertyCreate(BaseModel, PincodeValidator):
    title: str = Field(min_length=3, max_length=200)
    description: Optional[str] = None
    property_type: PropertyType
    address: str = Field(min_length=5, max_length=300)
    city: str = Field(min_length=2, max_length=100)
    state: str = Field(min_length=2, max_length=100)
    pincode: str
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)
    rent: float = Field(gt=0)
    bedrooms: int = Field(default=1, ge=0, le=20)
    bathrooms: int = Field(default=1, ge=0, le=20)
    area: Optional[float] = Field(default=None, gt=0)
    status: PropertyStatus = PropertyStatus.AVAILABLE


class PropertyUpdate(BaseModel, PincodeValidator):
    title: Optional[str] = Field(default=None, min_length=3, max_length=200)
    description: Optional[str] = None
    property_type: Optional[PropertyType] = None
    address: Optional[str] = Field(default=None, min_length=5, max_length=300)
    city: Optional[str] = Field(default=None, min_length=2, max_length=100)
    state: Optional[str] = Field(default=None, min_length=2, max_length=100)
    pincode: Optional[str] = None
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)
    rent: Optional[float] = Field(default=None, gt=0)
    bedrooms: Optional[int] = Field(default=None, ge=0, le=20)
    bathrooms: Optional[int] = Field(default=None, ge=0, le=20)
    area: Optional[float] = Field(default=None, gt=0)
    status: Optional[PropertyStatus] = None


class PropertyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
    title: str
    description: Optional[str] = None
    property_type: PropertyType
    address: str
    city: str
    state: str
    pincode: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    rent: float
    bedrooms: int
    bathrooms: int
    area: Optional[float] = None
    status: PropertyStatus
    created_at: datetime
    updated_at: datetime
