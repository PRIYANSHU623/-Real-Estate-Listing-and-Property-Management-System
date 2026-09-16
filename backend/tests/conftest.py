"""Shared pytest fixtures: async test app/client with a SQLite database.

Razorpay is faked at the integration boundary (order creation) while signature
verification uses a real test secret so the crypto path is genuinely exercised.
"""
import asyncio
import hashlib
import hmac
import os
from typing import AsyncIterator

# Configure environment BEFORE importing the app
os.environ.update(
    {
        "DATABASE_URL": "sqlite+aiosqlite:///:memory:",
        "JWT_SECRET_KEY": "test-secret-key-for-pytest-only",
        "RAZORPAY_KEY_ID": "rzp_test_fakekey",
        "RAZORPAY_KEY_SECRET": "test_razorpay_secret",
        "RAZORPAY_WEBHOOK_SECRET": "test_webhook_secret",
        "CORS_ORIGINS": "http://localhost:3000",
        "APP_ENV": "test",
        "DEBUG": "false",
    }
)

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.db import base  # noqa: F401 - imports all models
from app.db.session import get_db
from app.main import app

TEST_RAZORPAY_SECRET = os.environ["RAZORPAY_KEY_SECRET"]
TEST_WEBHOOK_SECRET = os.environ["RAZORPAY_WEBHOOK_SECRET"]


@pytest.fixture(autouse=True)
async def setup_database():
    """Fresh in-memory SQLite database per test (engine lives on the test's event loop)."""
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:", poolclass=StaticPool, connect_args={"check_same_thread": False}
    )
    async with engine.begin() as conn:
        await conn.run_sync(base.Base.metadata.create_all)

    testing_session = async_sessionmaker(bind=engine, expire_on_commit=False)

    async def override_get_db():
        async with testing_session() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.pop(get_db, None)
    await engine.dispose()


@pytest.fixture
async def client() -> AsyncIterator[AsyncClient]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


# ---------- helpers ----------


async def register_and_login(client: AsyncClient, email: str, role: str, password: str = "Password123!") -> dict:
    """Register a user and return auth headers."""
    resp = await client.post(
        "/api/v1/auth/register", json={"name": f"{role.title()} User", "email": email, "password": password, "role": role}
    )
    assert resp.status_code == 201, resp.text
    resp = await client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, resp.text
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


@pytest.fixture
async def owner_headers(client):
    return await register_and_login(client, "owner@example.com", "OWNER")


@pytest.fixture
async def tenant_headers(client):
    return await register_and_login(client, "tenant@example.com", "TENANT")


@pytest.fixture
async def admin_headers(client):
    return await register_and_login(client, "admin@example.com", "ADMIN")


@pytest.fixture
async def property_id(client, owner_headers) -> int:
    resp = await client.post(
        "/api/v1/properties",
        headers=owner_headers,
        json={
            "title": "2BHK Near Metro",
            "description": "Spacious apartment",
            "property_type": "APARTMENT",
            "address": "12 MG Road",
            "city": "Pune",
            "state": "Maharashtra",
            "pincode": "411001",
            "rent": 25000,
            "bedrooms": 2,
            "bathrooms": 2,
            "area": 900,
        },
    )
    assert resp.status_code == 201, resp.text
    return resp.json()["id"]


def razorpay_signature(order_id: str, payment_id: str) -> str:
    message = f"{order_id}|{payment_id}".encode()
    return hmac.new(TEST_RAZORPAY_SECRET.encode(), message, hashlib.sha256).hexdigest()


def webhook_signature(body: bytes) -> str:
    return hmac.new(TEST_WEBHOOK_SECRET.encode(), body, hashlib.sha256).hexdigest()


@pytest.fixture(autouse=True)
def fake_razorpay_orders(monkeypatch):
    """Fake only order creation; signatures are verified with the real algorithm."""
    counter = {"n": 0}

    def fake_create_order(amount_inr, receipt, currency="INR", notes=None):
        counter["n"] += 1
        return {"id": f"order_test_{counter['n']}", "amount": int(amount_inr * 100), "currency": currency}

    from app.integrations import razorpay

    monkeypatch.setattr(razorpay, "create_order", fake_create_order)
    monkeypatch.setattr(razorpay, "get_razorpay_client", lambda: object())
