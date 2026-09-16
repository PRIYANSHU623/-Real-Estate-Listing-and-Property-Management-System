"""Payment endpoints (Razorpay order creation, verification, webhook, history)."""
import logging
from typing import Optional

from fastapi import APIRouter, Depends, Header, Query, Request, status

from app.core.config import settings
from app.core.constants import PaymentStatus, UserRole
from app.core.dependencies import DB, CurrentUser, require_tenant
from app.core.exceptions import BadRequestException, ForbiddenException
from app.integrations import razorpay
from app.models.property import Property
from app.schemas.payment import PaymentOrderCreate, PaymentOrderResponse, PaymentOut, PaymentVerifyRequest
from app.services import payment_service
from app.utils.helpers import success
from app.utils.pagination import Page, PaginationParams

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/create-order", response_model=PaymentOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(data: PaymentOrderCreate, db: DB, tenant=Depends(require_tenant)):
    payment = await payment_service.create_order(db, tenant, data)
    await db.commit()
    return PaymentOrderResponse(
        payment_id=payment.id,
        razorpay_order_id=payment.razorpay_order_id,
        amount=float(payment.amount),
        currency=payment.currency,
        razorpay_key_id=settings.RAZORPAY_KEY_ID,
    )


@router.post("/verify", response_model=PaymentOut)
async def verify_payment(data: PaymentVerifyRequest, db: DB, user: CurrentUser):
    payment = await payment_service.verify_payment(
        db, user, data.razorpay_order_id, data.razorpay_payment_id, data.razorpay_signature
    )
    await db.commit()
    await db.refresh(payment)
    return payment


@router.post("/webhook", include_in_schema=True)
async def webhook(
    request: Request,
    db: DB,
    x_razorpay_signature: str = Header(..., alias="X-Razorpay-Signature"),
):
    """Razorpay webhook receiver. Signature is mandatory and verified against RAZORPAY_WEBHOOK_SECRET."""
    body = await request.body()
    if not razorpay.verify_webhook_signature(body, x_razorpay_signature):
        raise BadRequestException("Invalid webhook signature")
    event = await request.json()
    await payment_service.handle_webhook(db, event)
    await db.commit()
    return success(message="Webhook processed")


@router.get("/history", response_model=Page[PaymentOut])
async def payment_history(
    db: DB,
    user: CurrentUser,
    pagination: PaginationParams = Depends(),
    status_filter: Optional[PaymentStatus] = Query(None, alias="status"),
):
    items, total = await payment_service.payment_history(db, user, status_filter, pagination.page_size, pagination.offset)
    return Page[PaymentOut].create(items, total, pagination.page, pagination.page_size)


@router.get("/{payment_id}", response_model=PaymentOut)
async def get_payment(payment_id: int, db: DB, user: CurrentUser):
    payment = await payment_service.get_payment_or_404(db, payment_id)
    if user.id != payment.tenant_id and user.role != UserRole.ADMIN:
        prop = await db.get(Property, payment.property_id)
        if prop is None or prop.owner_id != user.id:
            raise ForbiddenException("You cannot view this payment")
    return payment
