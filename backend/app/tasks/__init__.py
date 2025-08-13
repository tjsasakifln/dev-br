"""
Pacote de tarefas Celery.

Este pacote contém todas as tarefas assíncronas do sistema.
"""

from .debug_tasks import health_check_task
from .job_tasks import process_generation_job