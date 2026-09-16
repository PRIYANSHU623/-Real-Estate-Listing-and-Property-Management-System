"""Authentication, JWT and RBAC tests."""
import pytest

pytestmark = pytest.mark.asyncio


async def test_register_success(client):
    resp = await client.post(
        "/api/v1/auth/register",
        json={"name": "John", "email": "john@example.com", "password": "Password123!", "role": "TENANT"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "john@example.com"
    assert data["role"] == "TENANT"
    assert "password_hash" not in data


async def test_register_duplicate_email(client):
    payload = {"name": "John", "email": "dup@example.com", "password": "Password123!", "role": "TENANT"}
    assert (await client.post("/api/v1/auth/register", json=payload)).status_code == 201
    resp = await client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 409


async def test_register_short_password(client):
    resp = await client.post(
        "/api/v1/auth/register", json={"name": "John", "email": "x@example.com", "password": "short", "role": "TENANT"}
    )
    assert resp.status_code == 422


async def test_login_success(client):
    await client.post(
        "/api/v1/auth/register",
        json={"name": "Jane", "email": "jane@example.com", "password": "Password123!", "role": "OWNER"},
    )
    resp = await client.post("/api/v1/auth/login", json={"email": "jane@example.com", "password": "Password123!"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"] and body["refresh_token"]


async def test_login_invalid_credentials(client):
    await client.post(
        "/api/v1/auth/register",
        json={"name": "Jane", "email": "jane2@example.com", "password": "Password123!", "role": "OWNER"},
    )
    resp = await client.post("/api/v1/auth/login", json={"email": "jane2@example.com", "password": "WrongPass123!"})
    assert resp.status_code == 401


async def test_me_requires_auth(client):
    assert (await client.get("/api/v1/auth/me")).status_code == 401


async def test_me(client, tenant_headers):
    resp = await client.get("/api/v1/auth/me", headers=tenant_headers)
    assert resp.status_code == 200
    assert resp.json()["role"] == "TENANT"


async def test_refresh_token_flow(client):
    await client.post(
        "/api/v1/auth/register",
        json={"name": "Refresh User", "email": "refresh@example.com", "password": "Password123!", "role": "TENANT"},
    )
    login = (await client.post("/api/v1/auth/login", json={"email": "refresh@example.com", "password": "Password123!"})).json()
    resp = await client.post("/api/v1/auth/refresh", json={"refresh_token": login["refresh_token"]})
    assert resp.status_code == 200
    assert resp.json()["access_token"]

    # Access token must NOT be accepted as a refresh token
    bad = await client.post("/api/v1/auth/refresh", json={"refresh_token": login["access_token"]})
    assert bad.status_code == 401


async def test_invalid_token_rejected(client):
    resp = await client.get("/api/v1/auth/me", headers={"Authorization": "Bearer not.a.jwt"})
    assert resp.status_code == 401


async def test_rbac_tenant_cannot_access_admin(client, tenant_headers):
    resp = await client.get("/api/v1/admin/users", headers=tenant_headers)
    assert resp.status_code == 403


async def test_rbac_tenant_cannot_create_property(client, tenant_headers):
    resp = await client.post(
        "/api/v1/properties",
        headers=tenant_headers,
        json={
            "title": "X",
            "property_type": "HOUSE",
            "address": "addr",
            "city": "c",
            "state": "s",
            "pincode": "411001",
            "rent": 1000,
        },
    )
    assert resp.status_code == 403
