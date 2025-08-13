from sqlalchemy.orm import Session

from app.db.models import GenerationJob, User
from app import schemas


def create_job_and_dispatch(
    db: Session, 
    *, 
    prompt: str, 
    user_id: int
) -> GenerationJob:
    """
    Create a new generation job and dispatch it to the async queue.
    
    Args:
        db: Database session
        prompt: The code generation prompt
        user_id: ID of the user creating the job
        
    Returns:
        The created GenerationJob instance
    """
    # Create the job instance
    job = GenerationJob(
        prompt=prompt,
        status="pending",
        owner_id=user_id
    )
    
    # Save to database
    db.add(job)
    db.commit()
    db.refresh(job)
    
    # TODO: Despachar tarefa para a fila assíncrona (Celery)
    
    return job