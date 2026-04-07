"""WebSocket routes for real-time order tracking."""
from __future__ import annotations

import json
import logging

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.core.websocket_manager import ConnectionManager
from app.database import async_session_factory
from app.dependencies import get_connection_manager
from app.models.order import Order

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws", tags=["WebSocket"])


@router.websocket("/ws/orders/{order_id}")
async def order_tracking_ws(
    websocket: WebSocket,
    order_id: str,
    manager: ConnectionManager = Depends(get_connection_manager),
):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001, reason="Missing auth token")
        return

    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
    except Exception:
        await websocket.close(code=4001, reason="Invalid token")
        return

    await manager.connect(websocket, f"order:{order_id}")
    logger.info(f"WS: User {user_id} tracking order {order_id}")

    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                if message.get("type") == "ping":
                    await manager.send_personal(websocket, {"type": "pong"})
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket, f"order:{order_id}")
        logger.info(f"WS: User disconnected from order {order_id}")


@router.websocket("/ws/admin/orders")
async def admin_order_monitoring_ws(
    websocket: WebSocket,
    manager: ConnectionManager = Depends(get_connection_manager),
):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001, reason="Missing auth token")
        return

    try:
        payload = decode_token(token)
        if payload.get("role") not in ("admin", "vendor"):
            await websocket.close(code=4003, reason="Insufficient permissions")
            return
    except Exception:
        await websocket.close(code=4001, reason="Invalid token")
        return

    await manager.connect(websocket, "kitchen:orders")
    logger.info("WS: Admin connected to kitchen monitoring")

    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                if message.get("type") == "ping":
                    await manager.send_personal(websocket, {"type": "pong"})
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket, "kitchen:orders")
        logger.info("WS: Admin disconnected from kitchen monitoring")
