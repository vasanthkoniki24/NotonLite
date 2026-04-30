from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.database import get_db
from app.models.user import User
from app.models.workspace import WorkspaceMember, WorkspaceRole


bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials
    user_id = decode_token(token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


async def get_workspace_member(
    db: AsyncSession,
    workspace_id: int,
    user_id: int,
) -> WorkspaceMember | None:
    result = await db.execute(
        select(WorkspaceMember).where(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == user_id,
        )
    )
    return result.scalar_one_or_none()


async def require_workspace_access(
    db: AsyncSession,
    workspace_id: int,
    user_id: int,
):
    member = await get_workspace_member(db, workspace_id, user_id)

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this workspace",
        )

    return member


async def require_editor_or_owner(
    db: AsyncSession,
    workspace_id: int,
    user_id: int,
):
    member = await require_workspace_access(db, workspace_id, user_id)

    if member.role not in [WorkspaceRole.OWNER, WorkspaceRole.EDITOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Editor or owner permission required",
        )

    return member


async def require_owner(
    db: AsyncSession,
    workspace_id: int,
    user_id: int,
):
    member = await require_workspace_access(db, workspace_id, user_id)

    if member.role != WorkspaceRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Owner permission required",
        )

    return member