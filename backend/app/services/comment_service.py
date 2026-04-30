from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.comment import Comment
from app.models.note import Note
from app.models.task import Task
from app.models.user import User
from app.schemas.comment import CommentCreate


async def validate_comment_target(
    db: AsyncSession,
    payload: CommentCreate,
) -> tuple[str, int, int]:
    if payload.note_id and payload.task_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Comment can belong to either note or task, not both",
        )

    if not payload.note_id and not payload.task_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="note_id or task_id is required",
        )

    if payload.note_id:
        result = await db.execute(select(Note).where(Note.id == payload.note_id))
        note = result.scalar_one_or_none()

        if not note:
            raise HTTPException(status_code=404, detail="Note not found")

        return "note", note.id, note.workspace_id

    result = await db.execute(select(Task).where(Task.id == payload.task_id))
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return "task", task.id, task.workspace_id


async def create_comment(
    db: AsyncSession,
    payload: CommentCreate,
    current_user: User,
) -> Comment:
    comment = Comment(
        user_id=current_user.id,
        note_id=payload.note_id,
        task_id=payload.task_id,
        content=payload.content,
    )

    db.add(comment)
    await db.commit()
    await db.refresh(comment)

    return comment