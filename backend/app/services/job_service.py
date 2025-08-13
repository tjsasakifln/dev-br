from sqlalchemy.orm import Session

from app.db.models import GenerationJob, User
from app import schemas


def create_job_and_dispatch(
    db: Session, 
    *, 
    prompt: str, 
    user_id: int
) -> GenerationJob:
    """Create a new generation job and dispatch it for async processing.
    
    This function handles the complete lifecycle of job creation, including
    database persistence and dispatching to the asynchronous processing queue.
    The job is created with a 'pending' status and will be processed by
    background workers.
    
    Args:
        db: SQLAlchemy database session for data persistence.
        prompt: Natural language description of the code/application to generate.
               Must be a non-empty string with meaningful content.
        user_id: Unique identifier of the authenticated user creating the job.
                Must correspond to an existing user in the database.
    
    Returns:
        GenerationJob: The newly created job instance with all fields populated,
                      including the auto-generated UUID and creation timestamp.
                      
    Raises:
        IntegrityError: If the user_id doesn't exist or database constraints fail.
        SQLAlchemyError: If database operations fail due to connection issues.
        
    Example:
        ```python
        with get_db_session() as db:
            job = create_job_and_dispatch(
                db=db,
                prompt="Create a FastAPI app with user authentication",
                user_id=123
            )
            print(f"Created job {job.id} with status {job.status}")
        ```
        
    Note:
        The function currently contains a TODO for implementing the actual
        dispatch mechanism to the async queue (Celery). Currently, jobs are
        only persisted to the database.
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