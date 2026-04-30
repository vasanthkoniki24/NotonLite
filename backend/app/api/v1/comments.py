from fastapi import APIRouter, Depends
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import (
    get_current_user,
    require_workspace_access,
    require_editor_or_owner,
)
from app.database import get_db
from app.models.comment import Comment
from app.models.user import User
from app.models.workspace import WorkspaceMember
from app.services.notification_service import create_notification
from app.schemas.comment import CommentCreate, CommentResponse
from app.services.comment_service import create_comment, validate_comment_target
from app.websockets.manager import connection_manager


router = APIRouter()


@router.post("/", response_model=CommentResponse)
async def create_new_comment(
    payload: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    target_type, target_id, workspace_id = await validate_comment_target(db, payload)

    await require_editor_or_owner(db, workspace_id, current_user.id)

    comment = await create_comment(db, payload, current_user)

    members = await db.execute(
    select(WorkspaceMember).where(
        WorkspaceMember.workspace_id == workspace_id
    )
)

    for member in members.scalars():
        if member.user_id != current_user.id:
            await create_notification(
                db=db,
                user_id=member.user_id,
                title="New Comment",
                message=f"{current_user.name} commented: {comment.content}",
            )

    await connection_manager.broadcast_workspace(
        workspace_id,
        {
            "type": "comment_created",
            "target_type": target_type,
            "target_id": target_id,
            "comment_id": comment.id,
            "content": comment.content,
            "created_by": current_user.name,
        },
    )

    return comment


@router.get("/notes/{note_id}", response_model=list[CommentResponse])
async def list_note_comments(
    note_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.note import Note

    note_result = await db.execute(select(Note).where(Note.id == note_id))
    note = note_result.scalar_one_or_none()

    if not note:
        return []

    await require_workspace_access(db, note.workspace_id, current_user.id)

    result = await db.execute(
        select(Comment)
        .where(Comment.note_id == note_id)
        .order_by(Comment.id.desc())
    )

    return result.scalars().all()


@router.get("/tasks/{task_id}", response_model=list[CommentResponse])
async def list_task_comments(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.task import Task

    task_result = await db.execute(select(Task).where(Task.id == task_id))
    task = task_result.scalar_one_or_none()

    if not task:
        return []

    await require_workspace_access(db, task.workspace_id, current_user.id)

    result = await db.execute(
        select(Comment)
        .where(Comment.task_id == task_id)
        .order_by(Comment.id.desc())
    )

    return result.scalars().all()