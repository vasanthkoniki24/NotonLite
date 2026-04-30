from datetime import datetime
from pydantic import BaseModel, Field


class NoteCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    content: str = ""


class NoteUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=200)
    content: str | None = None


class NoteResponse(BaseModel):
    id: int
    workspace_id: int
    title: str
    content: str
    created_by_id: int | None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


class NoteVersionResponse(BaseModel):
    id: int
    note_id: int
    title: str
    content: str
    edited_by_id: int | None
    created_at: datetime

    model_config = {
        "from_attributes": True
    }