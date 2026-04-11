"""Tests for menu endpoints."""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_menu_items(client: AsyncClient):
    """Menu listing should return items."""
    response = await client.get("/api/v1/menu")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "pagination" in data
    assert data["pagination"]["total"] >= 0


@pytest.mark.asyncio
async def test_list_menu_categories(client: AsyncClient):
    """Menu categories endpoint should return a list."""
    response = await client.get("/api/v1/menu/categories")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_get_menu_item_not_found(client: AsyncClient):
    """Getting a non-existent menu item should return 404 or 422."""
    response = await client.get("/api/v1/menu/999999")
    # 404 if not found, 422 if validation rejects the ID
    assert response.status_code in (404, 422)
