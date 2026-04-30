from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_workspace_access
from app.database import get_db
from app.models.note import Note
from app.models.task import Task
from app.models.user import User


router = APIRouter()


@router.get("/workspaces/{workspace_id}")
async def global_search(
    workspace_id: int,
    q: str = Query(min_length=1),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await require_workspace_access(db, workspace_id, current_user.id)

    note_result = await db.execute(
        select(Note).where(
            Note.workspace_id == workspace_id,
            or_(
                Note.title.ilike(f"%{q}%"),
                Note.content.ilike(f"%{q}%"),
            ),
        )
    )

    task_result = await db.execute(
        select(Task).where(
            Task.workspace_id == workspace_id,
            or_(
                Task.title.ilike(f"%{q}%"),
                Task.description.ilike(f"%{q}%"),
            ),
        )
    )

    notes = note_result.scalars().all()
    tasks = task_result.scalars().all()

    return {
        "query": q,
        "notes": [
            {
                "id": note.id,
                "title": note.title,
                "content": note.content,
                "type": "note",
            }
            for note in notes
        ],
        "tasks": [
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "status": task.status.value,
                "type": "task",
            }
            for task in tasks
        ],
    }