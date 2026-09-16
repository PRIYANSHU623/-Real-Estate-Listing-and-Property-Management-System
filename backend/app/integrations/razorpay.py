"""Razorpay integration.

Isolates all Razorpay SDK usage behind this module. Requires env vars:
    RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET

If credentials are not configured, a client is not created and the payment
service raises a clear error instead of failing at import time.
"""
import hashlib
import hmac
import logging
from typing import Any, Dict, Optional

from app.core.config import settings
from app.core.exceptions import BadRequestException

logger = logging.getLogger(__name__)

_client: Optional[Any] = None
_client_initialized = False


def get_razorpay_client() -> Any:
    """Return a configured Razorpay client, raising a clear error if creds are missing."""
    global _client, _client_initialized
    if not _client_initialized:
        if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
            import razorpay  # imported lazily so the app runs without the package config

            _client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        else:
            _client = None
        _client_initialized = True
    if _client is None:
        raise BadRequestException(
            "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables."
        )
    return _client


def create_order(amount_inr: float, receipt: str, currency: str = "INR", notes: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Create a Razorpay order. `amount_inr` is converted to paise."""
    client = get_razorpay_client()
    return client.order.create(
        {
            "amount": int(round(amount_inr * 100)),
            "currency": currency,
            "receipt": receipt,
            "notes": notes or {},
        }
    )


def verify_payment_signature(razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
    """Verify the client-side checkout signature: HMAC-SHA256(order_id|payment_id, key_secret)."""
    if not settings.RAZORPAY_KEY_SECRET:
        logger.error("RAZORPAY_KEY_SECRET not configured; cannot verify payment signature")
        return False
    message = f"{razorpay_order_id}|{razorpay_payment_id}".encode()
    expected = hmac.new(settings.RAZORPAY_KEY_SECRET.encode(), message, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, razorpay_signature)


def verify_webhook_signature(request_body: bytes, x_razorpay_signature: str) -> bool:
    """Verify a webhook payload signature using RAZORPAY_WEBHOOK_SECRET."""
    if not settings.RAZORPAY_WEBHOOK_SECRET:
        logger.error("RAZORPAY_WEBHOOK_SECRET not configured; cannot verify webhook signature")
        return False
    expected = hmac.new(settings.RAZORPAY_WEBHOOK_SECRET.encode(), request_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, x_razorpay_signature)
