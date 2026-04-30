from datetime import datetime
from pydantic import BaseModel, Field


class CommentCreate(BaseModel):
    content: str = Field(min_length=1)
    note_id: int | None = None
    task_id: int | None = None


class CommentResponse(BaseModel):
    id: int
    user_id: int
    note_id: int | None
    task_id: int | None
    content: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }