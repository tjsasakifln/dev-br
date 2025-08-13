from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class JobCreate(BaseModel):
    """Schema for job creation request."""
    prompt: str = Field(..., min_length=10, description="The prompt for code generation")


class Job(BaseModel):
    """Schema for job response."""
    id: int
    status: str
    prompt: str
    pr_url: Optional[str] = None
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True