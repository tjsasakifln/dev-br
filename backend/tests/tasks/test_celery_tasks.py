"""
Testes para as tarefas Celery.

Este arquivo contém testes para validar a infraestrutura Celery
e as tarefas assíncronas do sistema.
"""

import pytest
from app.tasks.debug_tasks import health_check_task


class TestCeleryTasks:
    """Testes para tarefas Celery."""

    def test_health_check_task(self):
        """
        Testa a tarefa de verificação de saúde.
        
        Esta tarefa deve retornar uma mensagem de sucesso
        para validar que a infraestrutura Celery está funcionando.
        """
        # Executa a tarefa de forma assíncrona
        result = health_check_task.delay()
        
        # Aguarda a conclusão da tarefa e obtém o resultado
        output = result.get(timeout=10)
        
        # Verifica se o resultado é o esperado
        assert output == "Task completed successfully!"