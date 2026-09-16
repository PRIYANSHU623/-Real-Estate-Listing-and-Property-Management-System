"""External notification channels (email/SMS) placeholder.

In-app notifications are persisted by notification_service. This module is the
seam where email (SMTP/SES/SendGrid) or SMS providers would be plugged in.
Configure via environment variables when a provider is chosen; until then we
log only, and no sensitive data is logged.
"""
import logging
from typing import Optional

logger = logging.getLogger(__name__)


async def send_email(to_email: Optional[str], subject: str, body: str) -> None:
    """Send a transactional email via the configured provider.

    Requires (when a provider is enabled): SMTP_HOST, SMTP_PORT, SMTP_USER,
    SMTP_PASSWORD, EMAIL_FROM. Currently logs only — no provider is wired.
    """
    logger.info("Email notification queued (subject=%s)", subject)


async def send_sms(phone: Optional[str], message: str) -> None:
    """Send an SMS via the configured provider. Currently logs only."""
    logger.info("SMS notification queued")
