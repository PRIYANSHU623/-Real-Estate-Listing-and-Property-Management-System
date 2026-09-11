from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.core.constants import PaymentPurpose, PaymentStatus


class PaymentOrderCreate(BaseModel):
    property_id: int
    lease_id: Optional[int] = None
    amount: float = Field(gt=0, description="Amount in INR")
    purpose: PaymentPurpose = PaymentPurpose.RENT


class PaymentOrderResponse(BaseModel):
    payment_id: int
    razorpay_order_id: str
    amount: float  # in paise on the Razorpay side
    currency: str
    razorpay_key_id: str


class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    property_id: int
    lease_id: Optional[int] = None
    amount: float
    currency: str
    purpose: PaymentPurpose
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    status: PaymentStatus
    payment_date: Optional[datetime] = None
    failure_reason: Optional[str] = None
    created_at: datetime
