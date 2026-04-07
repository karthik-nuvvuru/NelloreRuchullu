"""WebSocket connection manager for real-time order tracking."""

from __future__ import annotations

import asyncio
import json
import logging
from collections import defaultdict

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self) -> None:
        # order_id -> list of active connections
        self._active_connections: defaultdict[str, list[WebSocket]] = defaultdict(list)
        # room (channel) -> list of active connections
        self._rooms: defaultdict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, websocket: WebSocket, room: str) -> None:
        await websocket.accept()
        self._rooms[room].append(websocket)
        logger.info(
            "WebSocket connected", extra={"room": room, "total": len(self._rooms[room])}
        )

    def disconnect(self, websocket: WebSocket, room: str) -> None:
        connections = self._rooms[room]
        if websocket in connections:
            connections.remove(websocket)
        if not connections:
            del self._rooms[room]
        logger.info(f"WebSocket disconnected from {room}")

    async def send_personal(self, websocket: WebSocket, data: dict) -> None:
        try:
            await websocket.send_json(data)
        except RuntimeError:
            pass

    async def broadcast(self, room: str, data: dict) -> None:
        """Send message to all connections in a room."""
        dead = []
        for connection in self._rooms[room]:
            try:
                await connection.send_json(data)
            except RuntimeError:
                dead.append(connection)
        for conn in dead:
            self._rooms[room].remove(conn)
        logger.info(f"Broadcasted to room {room}: {data.get('type', 'unknown')}")

    async def broadcast_order_update(self, order_id: str, payload: dict) -> None:
        """Broadcast order status update to all watchers of this order."""
        await self.broadcast(f"order:{order_id}", {"type": "order_update", **payload})

    async def broadcast_kitchen(self, payload: dict) -> None:
        """Broadcast to kitchen/admin monitoring room."""
        await self.broadcast("kitchen:orders", {"type": "kitchen_update", **payload})
