from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_owner
from app.database import get_db
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember
from app.schemas.workspace import (
    WorkspaceCreate,
    WorkspaceResponse,
    InviteMemberRequest,
    WorkspaceMemberResponse,
)
from app.services.workspace_service import create_workspace, invite_member


router = APIRouter()


@router.post("/", response_model=WorkspaceResponse)
async def create_new_workspace(
    payload: WorkspaceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await create_workspace(db, payload.name, current_user)


@router.get("/", response_model=list[WorkspaceResponse])
async def list_my_workspaces(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Workspace)
        .join(WorkspaceMember)
        .where(WorkspaceMember.user_id == current_user.id)
    )

    return result.scalars().all()


@router.post("/{workspace_id}/invite", response_model=WorkspaceMemberResponse)
async def invite_user_to_workspace(
    workspace_id: int,
    payload: InviteMemberRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await require_owner(db, workspace_id, current_user.id)
    return await invite_member(db, workspace_id, payload.email, payload.role)


@router.get("/{workspace_id}/members", response_model=list[WorkspaceMemberResponse])
async def list_workspace_members(
    workspace_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await require_owner(db, workspace_id, current_user.id)

    result = await db.execute(
        select(WorkspaceMember).where(
            WorkspaceMember.workspace_id == workspace_id
        )
    )

    return result.scalars().all()