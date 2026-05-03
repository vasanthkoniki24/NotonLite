from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import (
    get_current_user,
    require_workspace_access,
    require_editor_or_owner,
    require_owner,
)
from app.database import get_db
from app.models.task import Task
from app.models.user import User
from app.models.workspace import WorkspaceMember
from app.services.notification_service import create_notification
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.services.task_service import create_task, get_task_or_404, update_task
from app.websockets.manager import connection_manager


router = APIRouter()


@router.post("/workspaces/{workspace_id}", response_model=TaskResponse)
async def create_workspace_task(
    workspace_id: int,
    payload: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await require_editor_or_owner(db, workspace_id, current_user.id)

    task = await create_task(db, workspace_id, payload, current_user)

    await connection_manager.broadcast_workspace(
        workspace_id,
        {
            "type": "task_created",
            "task_id": task.id,
            "title": task.title,
            "status": task.status.value,
        },
    )

    return task


@router.get("/workspaces/{workspace_id}", response_model=list[TaskResponse])
async def list_workspace_tasks(
    workspace_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await require_workspace_access(db, workspace_id, current_user.id)

    result = await db.execute(
        select(Task)
        .where(Task.workspace_id == workspace_id)
        .order_by(Task.status, Task.position, Task.id)
    )

    return result.scalars().all()


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = await get_task_or_404(db, task_id)
    await require_workspace_access(db, task.workspace_id, current_user.id)

    return task


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_existing_task(
    task_id: int,
    payload: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = await get_task_or_404(db, task_id)
    await require_editor_or_owner(db, task.workspace_id, current_user.id)

    updated_task = await update_task(db, task, payload)

    members = await db.execute(
    select(WorkspaceMember).where(
        WorkspaceMember.workspace_id == updated_task.workspace_id
    )
)

    for member in members.scalars():
        if member.user_id != current_user.id:
            await create_notification(
                db=db,
                user_id=member.user_id,
                title="Task Updated",
                message=f"{current_user.name} updated task: {updated_task.title}",
            )

    await connection_manager.broadcast_workspace(
        updated_task.workspace_id,
        {
            "type": "task_updated",
            "task_id": updated_task.id,
            "title": updated_task.title,
            "description": updated_task.description,
            "status": updated_task.status.value,
            "position": updated_task.position,
            "edited_by": current_user.name,
        },
    )

    return updated_task


@router.delete("/{task_id}")
async def delete_existing_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = await get_task_or_404(db, task_id)

    # Only workspace owner can delete task
    await require_owner(db, task.workspace_id, current_user.id)

    workspace_id = task.workspace_id

    await db.delete(task)
    await db.commit()

    await connection_manager.broadcast_workspace(
        workspace_id,
        {
            "type": "task_deleted",
            "task_id": task_id,
        },
    )

    return {"message": "Task deleted successfully"}