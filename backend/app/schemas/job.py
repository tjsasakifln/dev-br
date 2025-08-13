import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class JobCreate(BaseModel):
    """Schema for creating a new code generation job.
    
    This schema defines the input structure for creating a generation job,
    validating that the prompt meets minimum requirements for effective
    code generation.
    
    Attributes:
        prompt: The natural language description of the code/application 
               to be generated. Must be at least 10 characters to ensure
               sufficient detail for meaningful code generation.
               
    Example:
        ```python
        job_create = JobCreate(
            prompt="Create a REST API for managing user accounts with CRUD operations"
        )
        ```
    """
    prompt: str = Field(..., min_length=10, description="The prompt for code generation")


class Job(BaseModel):
    """Schema for code generation job response.
    
    This schema represents a complete generation job with all its associated
    metadata, used for API responses and data serialization.
    
    Attributes:
        id: Unique identifier for the generation job (UUID).
        status: Current status of the job (pending, in_progress, completed, failed).
        prompt: The original prompt used to create this job.
        pr_url: Optional URL to the GitHub pull request created for this job.
               Only present when the job has been completed successfully.
        owner_id: UUID of the user who created this generation job.
        created_at: Timestamp when the job was created.
        
    Example:
        ```python
        job = Job(
            id=uuid.uuid4(),
            status="completed",
            prompt="Create a REST API for user management",
            pr_url="https://github.com/user/repo/pull/42",
            owner_id=uuid.uuid4(),
            created_at=datetime.now()
        )
        ```
    """
    id: uuid.UUID
    status: str
    prompt: str
    pr_url: Optional[str] = None
    owner_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True