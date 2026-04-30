from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate


async def get_task_or_404(db: AsyncSession, task_id: int) -> Task:
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return task


async def create_task(
    db: AsyncSession,
    workspace_id: int,
    payload: TaskCreate,
    current_user: User,
) -> Task:
    task = Task(
        workspace_id=workspace_id,
        title=payload.title,
        description=payload.description,
        status=payload.status,
        position=payload.position,
        created_by_id=current_user.id,
    )

    db.add(task)
    await db.commit()
    await db.refresh(task)

    return task


async def update_task(
    db: AsyncSession,
    task: Task,
    payload: TaskUpdate,
) -> Task:
    if payload.title is not None:
        task.title = payload.title

    if payload.description is not None:
        task.description = payload.description

    if payload.status is not None:
        task.status = payload.status

    if payload.position is not None:
        task.position = payload.position

    await db.commit()
    await db.refresh(task)

    return task