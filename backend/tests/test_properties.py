"""Property CRUD, search/filter, and authorization tests."""
import pytest

pytestmark = pytest.mark.asyncio

PROPERTY_PAYLOAD = {
    "title": "Sea Facing Villa",
    "description": "Beautiful villa",
    "property_type": "VILLA",
    "address": "1 Beach Rd",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "rent": 90000,
    "bedrooms": 4,
    "bathrooms": 3,
    "area": 2200,
}


async def test_create_and_get_property(client, owner_headers):
    resp = await client.post("/api/v1/properties", headers=owner_headers, json=PROPERTY_PAYLOAD)
    assert resp.status_code == 201
    prop = resp.json()
    assert prop["city"] == "Mumbai"

    got = await client.get(f"/api/v1/properties/{prop['id']}", headers=owner_headers)
    assert got.status_code == 200
    assert got.json()["title"] == "Sea Facing Villa"


async def test_update_property(client, owner_headers, property_id):
    resp = await client.put(f"/api/v1/properties/{property_id}", headers=owner_headers, json={"rent": 27000})
    assert resp.status_code == 200
    assert float(resp.json()["rent"]) == 27000


async def test_delete_property(client, owner_headers, property_id):
    assert (await client.delete(f"/api/v1/properties/{property_id}", headers=owner_headers)).status_code == 204
    assert (await client.get(f"/api/v1/properties/{property_id}", headers=owner_headers)).status_code == 404


async def test_owner_cannot_modify_others_property(client, owner_headers, property_id, tenant_headers):
    # Second owner must not modify the first owner's property
    await client.post(
        "/api/v1/auth/register",
        json={"name": "Other", "email": "other-owner@example.com", "password": "Password123!", "role": "OWNER"},
    )
    login = await client.post("/api/v1/auth/login", json={"email": "other-owner@example.com", "password": "Password123!"})
    other_headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    resp = await client.put(f"/api/v1/properties/{property_id}", headers=other_headers, json={"rent": 1})
    assert resp.status_code == 403

    resp = await client.delete(f"/api/v1/properties/{property_id}", headers=other_headers)
    assert resp.status_code == 403


async def test_search_and_filters(client, owner_headers, property_id):
    await client.post("/api/v1/properties", headers=owner_headers, json=PROPERTY_PAYLOAD)

    resp = await client.get("/api/v1/properties", headers=owner_headers, params={"city": "pune"})
    assert resp.status_code == 200
    assert all(p["city"] == "Pune" for p in resp.json()["items"])

    resp = await client.get(
        "/api/v1/properties", headers=owner_headers, params={"min_rent": 50000, "max_rent": 100000}
    )
    items = resp.json()["items"]
    assert items and all(50000 <= float(p["rent"]) <= 100000 for p in items)

    resp = await client.get("/api/v1/properties", headers=owner_headers, params={"bedrooms": 4, "property_type": "VILLA"})
    assert resp.json()["total"] == 1

    resp = await client.get("/api/v1/properties", headers=owner_headers, params={"search": "sea facing"})
    assert resp.json()["total"] == 1

    resp = await client.get(
        "/api/v1/properties", headers=owner_headers, params={"sort_by": "rent", "sort_order": "asc"}
    )
    rents = [float(p["rent"]) for p in resp.json()["items"]]
    assert rents == sorted(rents)


async def test_invalid_sort_field(client, owner_headers):
    resp = await client.get("/api/v1/properties", headers=owner_headers, params={"sort_by": "hacked"})
    assert resp.status_code == 422  # constrained by regex pattern


async def test_owner_listing_scoped_to_own_properties(client, owner_headers, property_id, tenant_headers):
    # Tenant sees publicly listed properties (both), new owner sees none
    await client.post(
        "/api/v1/auth/register",
        json={"name": "Other", "email": "owner2@example.com", "password": "Password123!", "role": "OWNER"},
    )
    login = await client.post("/api/v1/auth/login", json={"email": "owner2@example.com", "password": "Password123!"})
    headers2 = {"Authorization": f"Bearer {login.json()['access_token']}"}
    resp = await client.get("/api/v1/properties", headers=headers2)
    assert resp.json()["total"] == 0
