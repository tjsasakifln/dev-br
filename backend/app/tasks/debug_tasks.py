"""
Tarefas de depuração e teste para Celery.

Este módulo contém tarefas simples para validar o funcionamento
da infraestrutura Celery e conexão com Redis.
"""

from app.celery_app import celery_app


@celery_app.task
def health_check_task():
    """Executa verificação de saúde da infraestrutura Celery.
    
    Esta tarefa valida que a infraestrutura Celery está funcionando
    corretamente, incluindo conectividade com Redis e capacidade
    de processar tarefas assíncronas.
    
    Returns:
        str: Mensagem confirmando sucesso da verificação de saúde.
        
    Example:
        >>> result = health_check_task.delay()
        >>> result.get()
        'Task completed successfully!'
    """
    return "Task completed successfully!"