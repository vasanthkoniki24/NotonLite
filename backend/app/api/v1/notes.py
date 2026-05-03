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
from app.models.note import Note
from app.models.note_version import NoteVersion
from app.models.user import User
from app.models.workspace import WorkspaceMember
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse, NoteVersionResponse
from app.services.note_service import create_note, get_note_or_404, update_note
from app.services.notification_service import create_notification
from app.websockets.manager import connection_manager


router = APIRouter()


@router.post("/workspaces/{workspace_id}", response_model=NoteResponse)
async def create_workspace_note(
    workspace_id: int,
    payload: NoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await require_editor_or_owner(db, workspace_id, current_user.id)
    note = await create_note(db, workspace_id, payload, current_user)

    await connection_manager.broadcast_workspace(
        workspace_id,
        {
            "type": "note_created",
            "note_id": note.id,
            "title": note.title,
        },
    )

    return note


@router.get("/workspaces/{workspace_id}", response_model=list[NoteResponse])
async def list_workspace_notes(
    workspace_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await require_workspace_access(db, workspace_id, current_user.id)

    result = await db.execute(
        select(Note).where(Note.workspace_id == workspace_id).order_by(Note.id.desc())
    )

    return result.scalars().all()


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = await get_note_or_404(db, note_id)
    await require_workspace_access(db, note.workspace_id, current_user.id)
    return note


@router.patch("/{note_id}", response_model=NoteResponse)
async def update_existing_note(
    note_id: int,
    payload: NoteUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = await get_note_or_404(db, note_id)
    await require_editor_or_owner(db, note.workspace_id, current_user.id)

    updated_note = await update_note(db, note, payload, current_user)

    members = await db.execute(
    select(WorkspaceMember).where(
        WorkspaceMember.workspace_id == updated_note.workspace_id
    )
)

    for member in members.scalars():
        if member.user_id != current_user.id:
            await create_notification(
                db=db,
                user_id=member.user_id,
                title="Note Updated",
                message=f"{current_user.name} updated note: {updated_note.title}",
            )

    await connection_manager.broadcast_workspace(
        updated_note.workspace_id,
        {
            "type": "note_updated",
            "note_id": updated_note.id,
            "title": updated_note.title,
            "content": updated_note.content,
            "edited_by": current_user.name,
        },
    )

    return updated_note


@router.delete("/{note_id}")
async def delete_existing_note(
    note_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = await get_note_or_404(db, note_id)

    # Only workspace owner can delete note
    await require_owner(db, note.workspace_id, current_user.id)

    workspace_id = note.workspace_id

    await db.delete(note)
    await db.commit()

    await connection_manager.broadcast_workspace(
        workspace_id,
        {
            "type": "note_deleted",
            "note_id": note_id,
        },
    )

    return {"message": "Note deleted successfully"}


@router.get("/{note_id}/versions", response_model=list[NoteVersionResponse])
async def list_note_versions(
    note_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = await get_note_or_404(db, note_id)
    await require_workspace_access(db, note.workspace_id, current_user.id)

    result = await db.execute(
        select(NoteVersion)
        .where(NoteVersion.note_id == note_id)
        .order_by(NoteVersion.id.desc())
        .limit(10)
    )

    return result.scalars().all()