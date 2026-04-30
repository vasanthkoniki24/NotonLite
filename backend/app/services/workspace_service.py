from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember, WorkspaceRole

from app.services.notification_service import create_notification


async def create_workspace(
    db: AsyncSession,
    name: str,
    owner: User,
) -> Workspace:
    workspace = Workspace(name=name, owner_id=owner.id)
    db.add(workspace)
    await db.flush()

    member = WorkspaceMember(
        workspace_id=workspace.id,
        user_id=owner.id,
        role=WorkspaceRole.OWNER,
    )
    db.add(member)

    await db.commit()
    await db.refresh(workspace)

    return workspace


async def invite_member(
    db: AsyncSession,
    workspace_id: int,
    email: str,
    role: WorkspaceRole,
):
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User with this email does not exist",
        )

    existing = await db.execute(
        select(WorkspaceMember).where(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == user.id,
        )
    )
    existing_member = existing.scalar_one_or_none()

    if existing_member:
        existing_member.role = role
        await db.commit()
        await db.refresh(existing_member)

        await create_notification(
            db=db,
            user_id=user.id,
            title="Workspace Invitation Updated",
            message=f"Your workspace role was updated to {role.value}",
        )

        return existing_member
    


    member = WorkspaceMember(
        workspace_id=workspace_id,
        user_id=user.id,
        role=role,
    )

    db.add(member)
    await db.commit()
    await db.refresh(member)

    await create_notification(
        db=db,
        user_id=user.id,
        title="Workspace Invitation",
        message=f"You were added to workspace ID {workspace_id} as {role.value}",
    )

    return member