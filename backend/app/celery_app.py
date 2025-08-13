"""Configuração da aplicação Celery.

Este módulo configura a instância principal do Celery usando configurações
centralizadas do sistema para máxima flexibilidade e segurança.

Example:
    from app.celery_app import celery_app
    
    @celery_app.task
    def my_task():
        return "Success"

Attributes:
    celery_app (Celery): Instância configurada do Celery com Redis como
        broker e backend, carregando configurações de app.core.config.
"""

from celery import Celery
from app.core.config import settings

# Configuração da aplicação Celery
celery_app = Celery(
    "open-swe",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
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