"""Analytics endpoint tests (owner scope + admin scope + RBAC)."""
import pytest

pytestmark = pytest.mark.asyncio


async def _paid_order(client, tenant_headers, property_id, order_suffix):
    from tests.conftest import razorpay_signature

    order = (
        await client.post(
            "/api/v1/payments/create-order", headers=tenant_headers, json={"property_id": property_id, "amount": 25000}
        )
    ).json()
    payment_id = f"pay_{order_suffix}"
    resp = await client.post(
        "/api/v1/payments/verify",
        headers=tenant_headers,
        json={
            "razorpay_order_id": order["razorpay_order_id"],
            "razorpay_payment_id": payment_id,
            "razorpay_signature": razorpay_signature(order["razorpay_order_id"], payment_id),
        },
    )
    assert resp.status_code == 200


async def test_owner_analytics(client, owner_headers, tenant_headers, property_id):
    await _paid_order(client, tenant_headers, property_id, "a1")
    resp = await client.get("/api/v1/analytics/owner", headers=owner_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_properties"] == 1
    assert data["total_revenue"] == 25000
    assert data["occupancy_rate"] == 0.0


async def test_owner_analytics_scoping(client, owner_headers, tenant_headers, property_id):
    # A different owner must see zero properties
    await client.post(
        "/api/v1/auth/register",
        json={"name": "Owner Two", "email": "owner-analytics@example.com", "password": "Password123!", "role": "OWNER"},
    )
    login = await client.post(
        "/api/v1/auth/login", json={"email": "owner-analytics@example.com", "password": "Password123!"}
    )
    headers2 = {"Authorization": f"Bearer {login.json()['access_token']}"}
    data = (await client.get("/api/v1/analytics/owner", headers=headers2)).json()
    assert data["total_properties"] == 0
    assert data["total_revenue"] == 0


async def test_admin_analytics(client, admin_headers, owner_headers, tenant_headers, property_id):
    await _paid_order(client, tenant_headers, property_id, "a2")
    data = (await client.get("/api/v1/analytics/admin", headers=admin_headers)).json()
    assert data["total_properties"] >= 1
    assert data["total_revenue"] == 25000
    assert data["total_users"] >= 3  # admin + owner + tenant


async def test_tenant_cannot_access_analytics(client, tenant_headers):
    assert (await client.get("/api/v1/analytics/owner", headers=tenant_headers)).status_code == 403
    assert (await client.get("/api/v1/analytics/admin", headers=tenant_headers)).status_code == 403


async def test_health(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
