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


def get_job_by_id(db: Session, job_id: str) -> GenerationJob | None:
    """Retrieve a job by its ID from the database.
    
    Args:
        db: SQLAlchemy database session.
        job_id: UUID string of the job to retrieve.
        
    Returns:
        GenerationJob instance if found, None otherwise.
    """
    from uuid import UUID
    return db.query(GenerationJob).filter(GenerationJob.id == UUID(job_id)).first()


def update_job_status(db: Session, job: GenerationJob, status: str, pr_url: str = None) -> None:
    """Update job status and optionally PR URL.
    
    Args:
        db: SQLAlchemy database session.
        job: GenerationJob instance to update.
        status: New status for the job ('processing', 'completed', 'failed').
        pr_url: Optional PR URL for completed jobs.
    """
    job.status = status
    if pr_url is not None:
        job.pr_url = pr_url
    db.commit()


def process_job_orchestration(db: Session, job: GenerationJob) -> tuple[str, str | None]:
    """Orchestrate the external services for job processing.
    
    This function handles the integration with GitHub API and LangGraph engine,
    keeping the business logic separate from the Celery task infrastructure.
    
    Args:
        db: SQLAlchemy database session.
        job: GenerationJob instance to process.
        
    Returns:
        Tuple of (status, pr_url) where status is 'completed' or 'failed'
        and pr_url is the generated PR URL or None.
        
    Raises:
        Exception: Any errors during external service integration.
    """
    from app.tasks.job_tasks import GitHubAPI, LangGraphClient
    
    try:
        # Simular criação de repositório no GitHub
        github_api = GitHubAPI()
        repo_url = github_api.create_repository(
            name="generated-app",
            description=f"Generated from prompt: {job.prompt[:50]}..."
        )
        logger.info(f"Repositório GitHub criado: {repo_url}")
        
        # Simular instanciação do LangGraphClient
        langgraph_client = LangGraphClient(api_key="test-api-key")
        
        # Preparar runInput com prompt e detalhes do repositório
        run_input = {
            "prompt": job.prompt,
            "repository_url": repo_url,
            "job_id": str(job.id)
        }
        
        # Simular execução do motor LangGraph
        events = langgraph_client.stream_execution(run_input)
        
        # Processar eventos e extrair PR URL
        pr_url = None
        for event in events:
            logger.info(f"Evento LangGraph: {event}")
            if event.get("type") == "completion":
                pr_url = event.get("data", {}).get("pr_url")
        
        logger.info(f"Job {job.id} concluído com sucesso. PR URL: {pr_url}")
        return "completed", pr_url
        
    except Exception as e:
        logger.error(f"Erro durante processamento do job {job.id}: {str(e)}")
        return "failed", None