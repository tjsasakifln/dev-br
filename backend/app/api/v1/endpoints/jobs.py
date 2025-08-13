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
    """
    Create a new code generation job.
    
    Creates a new generation job with the provided prompt and dispatches
    it to the async processing queue. Returns immediately with job details.
    """
    job = job_service.create_job_and_dispatch(
        db=db,
        prompt=job_in.prompt,
        user_id=current_user.id
    )
    
    return job