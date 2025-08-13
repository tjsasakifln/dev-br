"""
Configurações compartilhadas para testes pytest.

Este módulo contém fixtures e configurações que são aplicadas automaticamente
a todos os testes do projeto, incluindo configurações específicas para
testes com Celery em modo síncrono.
"""

import pytest
from app.celery_app import celery_app


@pytest.fixture(autouse=True)
def celery_eager_mode():
    """
    Configura o Celery para executar tarefas de forma síncrona durante os testes.
    
    Esta fixture é aplicada automaticamente a todos os testes (autouse=True)
    e garante que as tarefas Celery sejam executadas no mesmo processo,
    eliminando a dependência de um broker Redis em execução.
    
    O modo 'eager' faz com que:
    - task.delay() execute a tarefa imediatamente no mesmo processo
    - Não seja necessário aguardar resultados assíncronos
    - Os testes sejam mais rápidos e confiáveis
    - Não haja dependências externas (Redis/broker)
    
    Yields:
        None: A fixture não retorna valor, apenas configura o ambiente.
    """
    # Salva a configuração original
    original_task_always_eager = celery_app.conf.task_always_eager
    original_task_eager_propagates = celery_app.conf.task_eager_propagates
    
    # Configura modo síncrono para testes
    celery_app.conf.task_always_eager = True
    celery_app.conf.task_eager_propagates = True
    
    yield  # Executa os testes
    
    # Restaura a configuração original após os testes
    celery_app.conf.task_always_eager = original_task_always_eager
    celery_app.conf.task_eager_propagates = original_task_eager_propagates