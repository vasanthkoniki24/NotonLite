from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.note import Note
from app.models.note_version import NoteVersion
from app.models.user import User
from app.schemas.note import NoteCreate, NoteUpdate


async def get_note_or_404(db: AsyncSession, note_id: int) -> Note:
    result = await db.execute(select(Note).where(Note.id == note_id))
    note = result.scalar_one_or_none()

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found",
        )

    return note


async def create_note(
    db: AsyncSession,
    workspace_id: int,
    payload: NoteCreate,
    current_user: User,
) -> Note:
    note = Note(
        workspace_id=workspace_id,
        title=payload.title,
        content=payload.content,
        created_by_id=current_user.id,
    )

    db.add(note)
    await db.commit()
    await db.refresh(note)

    return note


async def update_note(
    db: AsyncSession,
    note: Note,
    payload: NoteUpdate,
    current_user: User,
) -> Note:
    version = NoteVersion(
        note_id=note.id,
        title=note.title,
        content=note.content,
        edited_by_id=current_user.id,
    )
    db.add(version)

    if payload.title is not None:
        note.title = payload.title

    if payload.content is not None:
        note.content = payload.content

    await db.commit()
    await db.refresh(note)

    return note