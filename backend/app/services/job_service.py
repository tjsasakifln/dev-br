from sqlalchemy.orm import Session
from fastapi import HTTPException
from kombu.exceptions import OperationalError
from celery.exceptions import Retry
import logging

from app.db.models import GenerationJob, User
from app import schemas
from app.tasks.job_tasks import process_generation_job

logger = logging.getLogger(__name__)


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
        HTTPException: 503 if the async processing service is unavailable.
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
    
    try:
        # Despachar tarefa para a fila assíncrona (Celery)
        process_generation_job.delay(job.id)
        logger.info(f"Successfully dispatched job {job.id} to async queue")
    except (OperationalError, Retry, ConnectionError) as e:
        # Rollback database transaction to remove orphaned job
        db.rollback()
        logger.error(f"Failed to dispatch job {job.id} to async queue: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail="O serviço de processamento assíncrono está indisponível. Tente novamente em alguns minutos."
        )
    except Exception as e:
        # Rollback database transaction for any other dispatch error
        db.rollback()
        logger.error(f"Unexpected error dispatching job {job.id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor ao processar a solicitação."
        )
    
    return job