from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, list[WebSocket]] = {}
        self.presence: dict[int, set[str]] = {}

    async def connect(
        self,
        workspace_id: int,
        user_name: str,
        websocket: WebSocket,
    ):
        await websocket.accept()

        if workspace_id not in self.active_connections:
            self.active_connections[workspace_id] = []

        if workspace_id not in self.presence:
            self.presence[workspace_id] = set()

        self.active_connections[workspace_id].append(websocket)
        self.presence[workspace_id].add(user_name)

        await self.broadcast_presence(workspace_id)

    def disconnect(
        self,
        workspace_id: int,
        user_name: str,
        websocket: WebSocket,
    ):
        if workspace_id in self.active_connections:
            if websocket in self.active_connections[workspace_id]:
                self.active_connections[workspace_id].remove(websocket)

        if workspace_id in self.presence:
            self.presence[workspace_id].discard(user_name)

    async def broadcast_workspace(self, workspace_id: int, message: dict):
        connections = self.active_connections.get(workspace_id, [])

        dead_connections = []

        for connection in connections:
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.append(connection)

        for dead in dead_connections:
            connections.remove(dead)

    async def broadcast_presence(self, workspace_id: int):
        users = list(self.presence.get(workspace_id, set()))

        await self.broadcast_workspace(
            workspace_id,
            {
                "type": "presence",
                "active_users": users,
            },
        )


connection_manager = ConnectionManager()