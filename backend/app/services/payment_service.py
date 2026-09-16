"""Payment business logic: Razorpay order creation, verification, webhooks, history."""
import logging
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import NotificationType, PaymentStatus, UserRole
from app.core.exceptions import BadRequestException, ForbiddenException, NotFoundException
from app.integrations import razorpay
from app.models.payment import Payment
from app.models.property import Property
from app.models.user import User
from app.schemas.payment import PaymentOrderCreate
from app.services import notification_service
from app.services.property_service import get_property_or_404

logger = logging.getLogger(__name__)


async def get_payment_or_404(db: AsyncSession, payment_id: int) -> Payment:
    payment = await db.get(Payment, payment_id)
    if payment is None:
        raise NotFoundException("Payment not found")
    return payment


async def get_payment_by_order_id(db: AsyncSession, order_id: str) -> Payment | None:
    result = await db.execute(select(Payment).where(Payment.razorpay_order_id == order_id))
    return result.scalar_one_or_none()


async def create_order(db: AsyncSession, tenant: User, data: PaymentOrderCreate) -> Payment:
    prop = await get_property_or_404(db, data.property_id)
    payment = Payment(
        tenant_id=tenant.id,
        property_id=data.property_id,
        lease_id=data.lease_id,
        amount=data.amount,
        purpose=data.purpose,
        status=PaymentStatus.CREATED,
    )
    db.add(payment)
    await db.flush()

    order = razorpay.create_order(
        amount_inr=float(data.amount),
        receipt=f"payment_{payment.id}",
        notes={"payment_id": str(payment.id), "property_id": str(data.property_id)},
    )
    payment.razorpay_order_id = order["id"]
    payment.status = PaymentStatus.PENDING
    await db.flush()
    return payment


async def verify_payment(db: AsyncSession, tenant: User, razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> Payment:
    payment = await get_payment_by_order_id(db, razorpay_order_id)
    if payment is None:
        raise NotFoundException("Payment order not found")
    if payment.tenant_id != tenant.id and tenant.role != UserRole.ADMIN:
        raise ForbiddenException("You cannot verify this payment")

    if not razorpay.verify_payment_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
        payment.status = PaymentStatus.FAILED
        payment.failure_reason = "Signature verification failed"
        await db.flush()
        raise BadRequestException("Invalid payment signature")

    payment.razorpay_payment_id = razorpay_payment_id
    payment.razorpay_signature = razorpay_signature
    payment.status = PaymentStatus.PAID
    payment.payment_date = datetime.now(timezone.utc)
    await db.flush()

    prop = await db.get(Property, payment.property_id)
    await notification_service.create_notification(
        db,
        user_id=payment.tenant_id,
        title="Payment successful",
        message=f"Your payment of ₹{payment.amount} for '{prop.title if prop else 'property'}' was successful.",
        type_=NotificationType.PAYMENT,
    )
    return payment


async def handle_webhook(db: AsyncSession, event: dict) -> None:
    """Process a verified Razorpay webhook event idempotently."""
    event_type = event.get("event", "")
    payload = (event.get("payload") or {})

    if event_type == "payment.captured":
        entity = payload.get("payment", {}).get("entity", {})
        order_id = entity.get("order_id")
        payment = await get_payment_by_order_id(db, order_id) if order_id else None
        if payment and payment.status != PaymentStatus.PAID:
            payment.razorpay_payment_id = entity.get("id")
            payment.status = PaymentStatus.PAID
            payment.payment_date = datetime.now(timezone.utc)
            await db.flush()
            prop = await db.get(Property, payment.property_id)
            await notification_service.create_notification(
                db,
                user_id=payment.tenant_id,
                title="Payment successful",
                message=f"Your payment of ₹{payment.amount} was captured.",
                type_=NotificationType.PAYMENT,
            )
    elif event_type == "payment.failed":
        entity = payload.get("payment", {}).get("entity", {})
        order_id = entity.get("order_id")
        payment = await get_payment_by_order_id(db, order_id) if order_id else None
        if payment and payment.status != PaymentStatus.PAID:
            payment.status = PaymentStatus.FAILED
            payment.failure_reason = (entity.get("error_description") or "Payment failed")[:300]
            await db.flush()
            await notification_service.create_notification(
                db,
                user_id=payment.tenant_id,
                title="Payment failed",
                message=f"Your payment of ₹{payment.amount} failed. Please try again.",
                type_=NotificationType.PAYMENT,
            )
    else:
        logger.info("Webhook event %s acknowledged", event_type)


async def payment_history(
    db: AsyncSession, user: User, status: PaymentStatus | None, limit: int, offset: int
) -> tuple[list[Payment], int]:
    conditions = []
    if user.role == UserRole.TENANT:
        conditions.append(Payment.tenant_id == user.id)
    elif user.role == UserRole.OWNER:
        conditions.append(Payment.property_id.in_(select(Property.id).where(Property.owner_id == user.id)))
    if status:
        conditions.append(Payment.status == status)

    count_stmt = select(func.count()).select_from(Payment)
    stmt = select(Payment)
    if conditions:
        count_stmt = count_stmt.where(*conditions)
        stmt = stmt.where(*conditions)
    total = (await db.execute(count_stmt)).scalar_one()
    result = await db.execute(stmt.order_by(Payment.created_at.desc()).limit(limit).offset(offset))
    return list(result.scalars().all()), total
