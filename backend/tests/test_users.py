"""User profile and admin user-management tests."""
import pytest

pytestmark = pytest.mark.asyncio


async def test_update_own_profile(client, tenant_headers):
    resp = await client.put("/api/v1/users/me", headers=tenant_headers, json={"name": "New Name", "phone": "9876543210"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "New Name"


async def test_change_password_requires_relogin(client):
    await client.post(
        "/api/v1/auth/register",
        json={"name": "Pw User", "email": "pwchange@example.com", "password": "Password123!", "role": "TENANT"},
    )
    login = await client.post("/api/v1/auth/login", json={"email": "pwchange@example.com", "password": "Password123!"})
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    assert (await client.put("/api/v1/users/me", headers=headers, json={"password": "NewPassword123!"})).status_code == 200
    assert (await client.post("/api/v1/auth/login", json={"email": "pwchange@example.com", "password": "Password123!"})).status_code == 401
    assert (await client.post("/api/v1/auth/login", json={"email": "pwchange@example.com", "password": "NewPassword123!"})).status_code == 200


async def test_deactivate_account_blocks_login(client):
    await client.post(
        "/api/v1/auth/register",
        json={"name": "Deact User", "email": "deact@example.com", "password": "Password123!", "role": "TENANT"},
    )
    login = await client.post("/api/v1/auth/login", json={"email": "deact@example.com", "password": "Password123!"})
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    assert (await client.delete("/api/v1/users/me", headers=headers)).status_code == 200
    assert (await client.post("/api/v1/auth/login", json={"email": "deact@example.com", "password": "Password123!"})).status_code == 401


async def test_admin_list_users(client, admin_headers):
    resp = await client.get("/api/v1/admin/users", headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["total"] >= 1


async def test_admin_toggle_user_active(client, admin_headers, tenant_headers):
    user_id = (await client.get("/api/v1/auth/me", headers=tenant_headers)).json()["id"]
    resp = await client.put(f"/api/v1/admin/users/{user_id}", headers=admin_headers, json={"is_active": False})
    assert resp.status_code == 200
    assert resp.json()["is_active"] is False

    # Deactivated user can no longer authenticate
    assert (await client.get("/api/v1/auth/me", headers=tenant_headers)).status_code == 401
