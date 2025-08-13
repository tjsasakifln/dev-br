"""
Configuração da aplicação Celery.

Este módulo configura a instância principal do Celery com Redis
como broker e backend para processamento de tarefas assíncronas.
"""

from celery import Celery

# Configuração da aplicação Celery
celery_app = Celery(
    "open-swe",
    broker="redis://redis:6379/0",
    backend="redis://redis:6379/0",
    include=["app.tasks"]
)

# Configurações adicionais
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    result_expires=3600,  # Resultados expiram em 1 hora
)

# Auto-descoberta de tarefas
celery_app.autodiscover_tasks(["app.tasks"])

# Importação explícita das tarefas após definir celery_app para evitar importação circular
from app.tasks import debug_tasks