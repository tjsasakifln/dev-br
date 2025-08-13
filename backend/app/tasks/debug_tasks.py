"""
Tarefas de depuração e teste para Celery.

Este módulo contém tarefas simples para validar o funcionamento
da infraestrutura Celery e conexão com Redis.
"""

from app.celery_app import celery_app


@celery_app.task
def debug_task():
    """
    Tarefa de depuração básica.
    
    Esta tarefa serve para validar que a infraestrutura Celery
    está funcionando corretamente e consegue executar tarefas.
    
    Returns:
        str: Mensagem de sucesso da tarefa
    """
    return "Task completed successfully!"