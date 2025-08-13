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
        
        Com o modo eager ativo (configurado em conftest.py), a tarefa
        é executada de forma síncrona, eliminando a necessidade de
        aguardar resultados assíncronos ou depender de um broker externo.
        """
        # Executa a tarefa (modo eager: execução síncrona)
        result = health_check_task.delay()
        
        # No modo eager, o resultado já está disponível imediatamente
        assert result.result == "Task completed successfully!"
        assert result.successful() is True

    def test_celery_eager_mode_is_active(self):
        """
        Verifica se o modo eager do Celery está ativo durante os testes.
        
        Este teste garante que a configuração de teste está funcionando
        corretamente e que as tarefas são executadas de forma síncrona.
        """
        from app.celery_app import celery_app
        
        # Verifica se o modo eager está ativo
        assert celery_app.conf.task_always_eager is True
        assert celery_app.conf.task_eager_propagates is True