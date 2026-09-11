"""Maintenance ticket lifecycle, vendor assignment, authorization tests."""
import pytest

pytestmark = pytest.mark.asyncio


async def _lease_property(client, owner_headers, tenant_headers, property_id):
    """Create an ACTIVE lease so the tenant has a stake in the property."""
    tenant_me = (await client.get("/api/v1/auth/me", headers=tenant_headers)).json()
    resp = await client.post(
        "/api/v1/leases",
        headers=owner_headers,
        json={
            "property_id": property_id,
            "tenant_id": tenant_me["id"],
            "start_date": "2026-01-01",
            "end_date": "2026-12-31",
            "monthly_rent": 25000,
            "security_deposit": 50000,
        },
    )
    assert resp.status_code == 201, resp.text
    lease = resp.json()
    resp = await client.put(
        f"/api/v1/leases/{lease['id']}", headers=owner_headers, json={"status": "ACTIVE"}
    )
    assert resp.status_code == 200, resp.text
    return resp.json()


async def test_ticket_requires_stake(client, tenant_headers, property_id):
    resp = await client.post(
        "/api/v1/maintenance",
        headers=tenant_headers,
        json={"property_id": property_id, "title": "Leaky tap", "description": "Kitchen tap is leaking badly"},
    )
    assert resp.status_code == 403


async def test_create_ticket_with_lease(client, owner_headers, tenant_headers, property_id):
    await _lease_property(client, owner_headers, tenant_headers, property_id)

    resp = await client.post(
        "/api/v1/maintenance",
        headers=tenant_headers,
        json={"property_id": property_id, "title": "Leaky tap", "description": "Kitchen tap is leaking", "priority": "HIGH"},
    )
    assert resp.status_code == 201, resp.text
    ticket = resp.json()
    assert ticket["status"] == "OPEN"
    assert ticket["priority"] == "HIGH"


async def test_owner_assign_and_resolve(client, admin_headers, owner_headers, tenant_headers, property_id):
    await _lease_property(client, owner_headers, tenant_headers, property_id)
    ticket = (
        await client.post(
            "/api/v1/maintenance",
            headers=tenant_headers,
            json={"property_id": property_id, "title": "AC broken", "description": "Air conditioner is not cooling"},
        )
    ).json()

    vendor = (
        await client.post(
            "/api/v1/vendors", headers=admin_headers, json={"name": "CoolFix", "service_type": "HVAC"}
        )
    ).json
    assert vendor["id"]

    resp = await client.put(
        f"/api/v1/maintenance/{ticket['id']}/assign", headers=owner_headers, json={"vendor_id": vendor["id"]}
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["status"] == "ASSIGNED"
    assert resp.json()["vendor_id"] == vendor["id"]

    resp = await client.put(
        f"/api/v1/maintenance/{ticket['id']}/status", headers=owner_headers, json={"status": "IN_PROGRESS"}
    )
    assert resp.status_code == 200

    resp = await client.put(
        f"/api/v1/maintenance/{ticket['id']}/status", headers=owner_headers, json={"status": "RESOLVED"}
    )
    assert resp.status_code == 200
    assert resp.json()["resolved_at"] is not None

    # Tenant was notified
    notes = (await client.get("/api/v1/notifications", headers=tenant_headers)).json()
    assert any("Ticket" in n["title"] or "Maintenance" in n["title"] for n in notes["items"])


async def test_invalid_status_transition(client, owner_headers, tenant_headers, property_id):
    await _lease_property(client, owner_headers, tenant_headers, property_id)
    ticket = (
        await client.post(
            "/api/v1/maintenance",
            headers=tenant_headers,
            json={"property_id": property_id, "title": "Broken window", "description": "Window glass is cracked"},
        )
    ).json()
    # OPEN cannot jump to RESOLVED
    resp = await client.put(
        f"/api/v1/maintenance/{ticket['id']}/status", headers=owner_headers, json={"status": "RESOLVED"}
    )
    assert resp.status_code == 400


async def test_tenant_cannot_assign_tickets(client, owner_headers, tenant_headers, property_id, admin_headers):
    await _lease_property(client, owner_headers, tenant_headers, property_id)
    ticket = (
        await client.post(
            "/api/v1/maintenance",
            headers=tenant_headers,
            json={"property_id": property_id, "title": "Fan noisy", "description": "Ceiling fan rattles loudly"},
        )
    ).json()
    vendor = (
        await client.post("/api/v1/vendors", headers=admin_headers, json={"name": "CoolFix", "service_type": "HVAC"})
    ).json()
    resp = await client.put(
        f"/api/v1/maintenance/{ticket['id']}/assign", headers=tenant_headers, json={"vendor_id": vendor["id"]}
    )
    assert resp.status_code == 403


async def test_owner_cannot_create_tickets(client, owner_headers, property_id):
    resp = await client.post(
        "/api/v1/maintenance",
        headers=owner_headers,
        json={"property_id": property_id, "title": "Fix door", "description": "Main door hinge is broken"},
    )
    assert resp.status_code == 403  # role gate: only tenants
