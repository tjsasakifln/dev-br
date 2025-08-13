from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app import schemas
from app.api import deps
from app.db.models.user import User
from app.services import job_service

router = APIRouter()


@router.post("/", response_model=schemas.Job, status_code=status.HTTP_202_ACCEPTED)
def create_job(
    job_in: schemas.JobCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> schemas.Job:
    """Create a new code generation job for the authenticated user.
    
    This endpoint accepts a natural language prompt and creates a new generation
    job that will be processed asynchronously. The job is immediately persisted
    to the database and queued for background processing. The client receives
    an HTTP 202 (Accepted) status indicating the request has been accepted for
    processing.
    
    Args:
        job_in: JobCreate schema containing the generation prompt. The prompt
               must be at least 10 characters long to ensure sufficient detail.
        db: Database session dependency, automatically injected by FastAPI.
        current_user: Authenticated user making the request, automatically
                     resolved from JWT token via dependency injection.
    
    Returns:
        schemas.Job: Complete job information including UUID, status, timestamps,
                    and user association. The initial status will be 'pending'.
    
    Raises:
        HTTPException 400: If the prompt validation fails (too short, empty, etc.).
        HTTPException 401: If the user is not authenticated or token is invalid.
        HTTPException 422: If the request body doesn't match the expected schema.
        HTTPException 500: If database operations fail or other server errors occur.
        
    Response Status:
        202 Accepted: Job creation request has been accepted and queued for processing.
        
    Example Request:
        ```bash
        POST /api/v1/jobs/
        Content-Type: application/json
        Authorization: Bearer <jwt_token>
        
        {
            "prompt": "Create a React dashboard with charts and user management"
        }
        ```
        
    Example Response:
        ```json
        {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "status": "pending",
            "prompt": "Create a React dashboard with charts and user management",
            "pr_url": null,
            "owner_id": "987fcdeb-51a2-43d7-8f6e-123456789abc",
            "created_at": "2024-01-15T10:30:00Z"
        }
        ```
        
    Note:
        This endpoint returns immediately without waiting for job completion.
        Clients should poll the job status endpoint or use WebSocket connections
        to monitor job progress and completion.
    """
    job = job_service.create_job_and_dispatch(
        db=db,
        prompt=job_in.prompt,
        user_id=current_user.id
    )
    
    return job