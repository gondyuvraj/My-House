from typing import Dict, List, Set
from fastapi import WebSocket
import json
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Maps user_id -> Set of active WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
        logger.info(f"User {user_id} connected. Active connections for user: {len(self.active_connections[user_id])}")
        # Broadcast online status to relevant users or notify
        await self.broadcast_status(user_id, is_online=True)

    async def disconnect(self, user_id: str, websocket: WebSocket):
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                logger.info(f"User {user_id} went offline.")
                await self.broadcast_status(user_id, is_online=False)

    def is_online(self, user_id: str) -> bool:
        return user_id in self.active_connections and len(self.active_connections[user_id]) > 0

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            dead_sockets = set()
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    logger.warning(f"Failed to send to user {user_id}: {e}")
                    dead_sockets.add(connection)
            for dead in dead_sockets:
                self.active_connections[user_id].discard(dead)

    async def broadcast_status(self, user_id: str, is_online: bool):
        payload = {
            "type": "status_update",
            "user_id": user_id,
            "is_online": is_online
        }
        # Send to all connected sockets
        for u_id, sockets in list(self.active_connections.items()):
            if u_id != user_id:
                for s in list(sockets):
                    try:
                        await s.send_text(json.dumps(payload))
                    except Exception:
                        pass

manager = ConnectionManager()

