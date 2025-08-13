"""
Testes para as tarefas Celery.

Este arquivo contém testes para validar a infraestrutura Celery
e as tarefas assíncronas do sistema.
"""

import pytest
from app.tasks.debug_tasks import debug_task


class TestCeleryTasks:
    """Testes para tarefas Celery."""

    def test_debug_task(self):
        """
        Testa a tarefa de debug básica.
        
        Esta tarefa deve retornar uma mensagem de sucesso
        para validar que a infraestrutura Celery está funcionando.
        """
        # Executa a tarefa de forma assíncrona
        result = debug_task.delay()
        
        # Aguarda a conclusão da tarefa e obtém o resultado
        output = result.get(timeout=10)
        
        # Verifica se o resultado é o esperado
        assert output == "Task completed successfully!"