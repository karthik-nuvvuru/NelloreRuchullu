"""Order endpoint tests."""
from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_empty_cart(client: AsyncClient):
    resp = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "order@example.com",
            "password": "OrderPass123!",
            "first_name": "Order",
            "last_name": "User",
        }
    )
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = await client.get("/api/v1/cart", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["total"] == 0


@pytest.mark.asyncio
async def test_get_my_orders_empty(client: AsyncClient):
    resp = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "orders2@example.com",
            "password": "OrderPass123!",
            "first_name": "Orders",
            "last_name": "User",
        }
    )
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = await client.get("/api/v1/orders/my", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []


@pytest.mark.asyncio
async def test_create_order_empty_cart_fails(client: AsyncClient):
    resp = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "order3@example.com",
            "password": "OrderPass123!",
            "first_name": "Order3",
            "last_name": "User",
        }
    )
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = await client.post(
        "/api/v1/orders",
        json={
            "address_id": "00000000-0000-0000-0000-000000000001",
            "payment_method": "cod",
        },
        headers=headers,
    )
    assert response.status_code in (400, 422)
