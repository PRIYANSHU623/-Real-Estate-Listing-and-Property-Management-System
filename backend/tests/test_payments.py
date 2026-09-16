"""Razorpay payment flow tests: order creation, verification, webhook."""
import json

import pytest

from tests.conftest import razorpay_signature, webhook_signature

pytestmark = pytest.mark.asyncio


async def _create_order(client, tenant_headers, property_id):
    resp = await client.post(
        "/api/v1/payments/create-order",
        headers=tenant_headers,
        json={"property_id": property_id, "amount": 25000},
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


async def test_create_order(client, tenant_headers, property_id):
    order = await _create_order(client, tenant_headers, property_id)
    assert order["razorpay_order_id"].startswith("order_test_")
    assert order["razorpay_key_id"]


async def test_only_tenant_can_create_order(client, owner_headers, property_id):
    resp = await client.post(
        "/api/v1/payments/create-order", headers=owner_headers, json={"property_id": property_id, "amount": 100}
    )
    assert resp.status_code == 403


async def test_verify_payment_success(client, tenant_headers, property_id):
    order = await _create_order(client, tenant_headers, property_id)
    payment_id = "pay_test_123"
    resp = await client.post(
        "/api/v1/payments/verify",
        headers=tenant_headers,
        json={
            "razorpay_order_id": order["razorpay_order_id"],
            "razorpay_payment_id": payment_id,
            "razorpay_signature": razorpay_signature(order["razorpay_order_id"], payment_id),
        },
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["status"] == "PAID"


async def test_verify_payment_invalid_signature(client, tenant_headers, property_id):
    order = await _create_order(client, tenant_headers, property_id)
    resp = await client.post(
        "/api/v1/payments/verify",
        headers=tenant_headers,
        json={
            "razorpay_order_id": order["razorpay_order_id"],
            "razorpay_payment_id": "pay_test_456",
            "razorpay_signature": "deadbeef",
        },
    )
    assert resp.status_code == 400

    history = (await client.get("/api/v1/payments/history", headers=tenant_headers)).json()
    assert history["items"][0]["status"] == "FAILED"


async def test_webhook_payment_captured(client, tenant_headers, property_id):
    order = await _create_order(client, tenant_headers, property_id)
    event = {
        "event": "payment.captured",
        "payload": {"payment": {"entity": {"id": "pay_hook_1", "order_id": order["razorpay_order_id"]}}},
    }
    body = json.dumps(event).encode()
    resp = await client.post(
        "/api/v1/payments/webhook", content=body, headers={"X-Razorpay-Signature": webhook_signature(body)}
    )
    assert resp.status_code == 200

    history = (await client.get("/api/v1/payments/history", headers=tenant_headers)).json()
    assert history["items"][0]["status"] == "PAID"
    assert history["items"][0]["razorpay_payment_id"] == "pay_hook_1"


async def test_webhook_invalid_signature_rejected(client):
    resp = await client.post(
        "/api/v1/payments/webhook", content=b"{}", headers={"X-Razorpay-Signature": "bogus"}
    )
    assert resp.status_code == 400


async def test_payment_history_scoped_to_tenant(client, tenant_headers, property_id):
    await _create_order(client, tenant_headers, property_id)
    resp = await client.get("/api/v1/payments/history", headers=tenant_headers)
    assert resp.status_code == 200
    assert resp.json()["total"] == 1
