from datetime import datetime
from pydantic import BaseModel, Field

from app.models.task import TaskStatus


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    status: TaskStatus = TaskStatus.TODO
    position: int = 0


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=200)
    description: str | None = None
    status: TaskStatus | None = None
    position: int | None = None


class TaskResponse(BaseModel):
    id: int
    workspace_id: int
    title: str
    description: str | None
    status: TaskStatus
    position: int
    created_by_id: int | None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }