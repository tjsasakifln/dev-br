"""
Testes para o serviço de jobs de geração.

Este arquivo contém testes para validar a funcionalidade do job_service,
incluindo criação de jobs e integração com a fila de tarefas assíncronas.
"""

import pytest
from unittest.mock import Mock, patch
from sqlalchemy.orm import Session
from fastapi import HTTPException
from kombu.exceptions import OperationalError

from app.services.job_service import create_job_and_dispatch
from app.db.models import GenerationJob


class TestJobService:
    """Testes para o serviço de jobs de geração."""

    @patch('app.tasks.job_tasks.process_generation_job.delay')
    def test_create_job_and_dispatch_calls_celery_task(self, mock_delay):
        """
        Testa se create_job_and_dispatch chama a tarefa Celery.
        
        Este teste verifica se a função create_job_and_dispatch:
        1. Cria o job no banco de dados
        2. Chama a tarefa Celery process_generation_job.delay
        3. Passa o ID do job criado como argumento para a tarefa
        """
        # Arrange
        mock_db = Mock(spec=Session)
        prompt = "Create a FastAPI app with user authentication"
        user_id = 123
        
        # Mock do job que seria criado
        mock_job = Mock(spec=GenerationJob)
        mock_job.id = "test-job-uuid-123"
        mock_job.prompt = prompt
        mock_job.status = "pending"
        mock_job.owner_id = user_id
        
        # Configurar o mock do banco para retornar o job mockado
        mock_db.refresh.side_effect = lambda x: setattr(x, 'id', mock_job.id)
        
        # Act
        job = create_job_and_dispatch(
            db=mock_db,
            prompt=prompt,
            user_id=user_id
        )
        
        # Assert
        # Verifica se os métodos do banco foram chamados
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()
        
        # Verifica se o job foi criado com os dados corretos
        added_job = mock_db.add.call_args[0][0]
        assert isinstance(added_job, GenerationJob)
        assert added_job.prompt == prompt
        assert added_job.status == "pending"
        assert added_job.owner_id == user_id
        
        # Verifica se a tarefa Celery foi chamada com o ID do job
        mock_delay.assert_called_once_with(job.id)

    @patch('app.tasks.job_tasks.process_generation_job.delay')
    def test_create_job_dispatch_fails_rolls_back_and_raises_503(self, mock_delay):
        """
        Testa se create_job_and_dispatch faz rollback e levanta 503 quando o despacho falha.
        
        Este teste verifica se a função create_job_and_dispatch:
        1. Cria o job no banco de dados
        2. Tenta despachar a tarefa Celery
        3. Quando o despacho falha com OperationalError, faz rollback no banco
        4. Levanta HTTPException com status 503
        """
        # Arrange
        mock_db = Mock(spec=Session)
        prompt = "Create a FastAPI app with user authentication"
        user_id = 123
        
        # Mock do job que seria criado
        mock_job = Mock(spec=GenerationJob)
        mock_job.id = "test-job-uuid-123"
        mock_job.prompt = prompt
        mock_job.status = "pending"
        mock_job.owner_id = user_id
        
        # Configurar o mock do banco para retornar o job mockado
        mock_db.refresh.side_effect = lambda x: setattr(x, 'id', mock_job.id)
        
        # Configurar o mock do Celery para falhar com OperationalError
        mock_delay.side_effect = OperationalError("Redis connection failed")
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            create_job_and_dispatch(
                db=mock_db,
                prompt=prompt,
                user_id=user_id
            )
        
        # Verifica se a HTTPException tem status 503
        assert exc_info.value.status_code == 503
        assert "O serviço de processamento assíncrono está indisponível" in exc_info.value.detail
        
        # Verifica se os métodos do banco foram chamados na ordem correta
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()
        
        # Verifica se o rollback foi chamado após a falha do despacho
        mock_db.rollback.assert_called_once()
        
        # Verifica se a tarefa Celery foi tentada
        mock_delay.assert_called_once()