"""Booking lifecycle and authorization tests."""
from datetime import date, timedelta

import pytest

pytestmark = pytest.mark.asyncio


async def _book(client, tenant_headers, property_id, **overrides):
    payload = {"property_id": property_id, "booking_date": (date.today() + timedelta(days=3)).isoformat()}
    payload.update(overrides)
    return await client.post("/api/v1/bookings", headers=tenant_headers, json=payload)


async def test_create_booking(client, tenant_headers, property_id):
    resp = await _book(client, tenant_headers, property_id)
    assert resp.status_code == 201
    assert resp.json()["status"] == "PENDING"


async def test_duplicate_booking_rejected(client, tenant_headers, property_id):
    assert (await _book(client, tenant_headers, property_id)).status_code == 201
    assert (await _book(client, tenant_headers, property_id)).status_code == 400


async def test_past_date_booking_rejected(client, tenant_headers, property_id):
    resp = await _book(client, tenant_headers, property_id, booking_date="2020-01-01")
    assert resp.status_code == 400


async def test_booking_missing_property(client, tenant_headers):
    resp = await _book(client, tenant_headers, 99999)
    assert resp.status_code == 404


async def test_owner_cannot_book_as_tenant_flow(client, owner_headers, property_id):
    # Owners use the same endpoint role gate: only TENANT may book
    resp = await client.post(
        "/api/v1/bookings",
        headers=owner_headers,
        json={"property_id": property_id, "booking_date": (date.today() + timedelta(days=1)).isoformat()},
    )
    assert resp.status_code == 403


async def test_booking_status_flow_and_notifications(client, owner_headers, tenant_headers, property_id):
    booking = (await _book(client, tenant_headers, property_id)).json()

    # Owner confirms
    resp = await client.put(
        f"/api/v1/bookings/{booking['id']}/status", headers=owner_headers, json={"status": "CONFIRMED"}
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "CONFIRMED"

    # Property marked BOOKED
    prop = (await client.get(f"/api/v1/properties/{property_id}", headers=owner_headers)).json()
    assert prop["status"] == "BOOKED"

    # Tenant got a notification
    notes = (await client.get("/api/v1/notifications", headers=tenant_headers)).json()
    assert notes["total"] >= 1

    # Tenant cannot confirm bookings
    resp = await client.put(
        f"/api/v1/bookings/{booking['id']}/status", headers=tenant_headers, json={"status": "CONFIRMED"}
    )
    assert resp.status_code == 403


async def test_invalid_status_transition(client, owner_headers, tenant_headers, property_id):
    booking = (await _book(client, tenant_headers, property_id)).json()
    resp = await client.put(
        f"/api/v1/bookings/{booking['id']}/status", headers=owner_headers, json={"status": "REJECTED"}
    )
    assert resp.status_code == 200
    # REJECTED is terminal
    resp = await client.put(
        f"/api/v1/bookings/{booking['id']}/status", headers=owner_headers, json={"status": "CONFIRMED"}
    )
    assert resp.status_code == 400
