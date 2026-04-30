from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy import select

from app.core.security import decode_token
from app.database import AsyncSessionLocal
from app.models.user import User
from app.models.workspace import WorkspaceMember
from app.websockets.manager import connection_manager


router = APIRouter()


@router.websocket("/ws/workspaces/{workspace_id}")
async def workspace_socket(
    websocket: WebSocket,
    workspace_id: int,
):
    token = websocket.query_params.get("token")

    if not token:
        await websocket.close(code=1008)
        return

    user_id = decode_token(token)

    if not user_id:
        await websocket.close(code=1008)
        return

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.id == int(user_id)))
        user = result.scalar_one_or_none()

        if not user:
            await websocket.close(code=1008)
            return

        member_result = await db.execute(
            select(WorkspaceMember).where(
                WorkspaceMember.workspace_id == workspace_id,
                WorkspaceMember.user_id == user.id,
            )
        )
        member = member_result.scalar_one_or_none()

        if not member:
            await websocket.close(code=1008)
            return

    await connection_manager.connect(workspace_id, user.name, websocket)

    try:
        while True:
            data = await websocket.receive_json()

            await connection_manager.broadcast_workspace(
                workspace_id,
                {
                    "type": data.get("type", "message"),
                    "payload": data.get("payload", {}),
                    "sent_by": user.name,
                },
            )

    except WebSocketDisconnect:
        connection_manager.disconnect(workspace_id, user.name, websocket)
        await connection_manager.broadcast_presence(workspace_id)