"""
Testes para as tarefas de processamento de jobs.

Este arquivo contém testes para validar a lógica de orquestração
da tarefa process_generation_job, incluindo cenários de sucesso
e falha com mocks para dependências externas.
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from uuid import UUID
from app.tasks.job_tasks import process_generation_job
from app.db.models.job import GenerationJob


class TestJobTasks:
    """Testes para tarefas de processamento de jobs."""

    @patch('app.tasks.job_tasks.SessionLocal')
    @patch('app.services.job_service.get_job_by_id')
    @patch('app.services.job_service.update_job_status')
    @patch('app.services.job_service.process_job_orchestration')
    def test_process_generation_job_success(self, mock_orchestration, mock_update_status, mock_get_job, mock_session_local):
        """
        Testa o cenário de sucesso da tarefa process_generation_job com service layer.
        
        Este teste simula:
        - Busca bem-sucedida do job via service layer
        - Atualização de status via service layer
        - Orquestração bem-sucedida via service layer
        - Atualização final do status com PR URL
        """
        # Arrange: Setup mocks
        job_id = "550e8400-e29b-41d4-a716-446655440000"
        test_pr_url = "https://github.com/user/repo/pull/1"
        
        # Mock database session
        mock_session = Mock()
        mock_session_local.return_value.__enter__.return_value = mock_session
        
        # Mock job from service layer
        mock_job = Mock(spec=GenerationJob)
        mock_job.id = UUID(job_id)
        mock_job.prompt = "Create a React todo app"
        mock_job.status = "pending"
        mock_job.pr_url = None
        mock_get_job.return_value = mock_job
        
        # Mock successful orchestration
        mock_orchestration.return_value = ("completed", test_pr_url)
        
        # Act: Execute the task
        result = process_generation_job.delay(job_id)
        
        # Assert: Verify service layer interactions
        # Job should be fetched via service layer
        mock_get_job.assert_called_once_with(mock_session, job_id)
        
        # Status should be updated to processing via service layer
        mock_update_status.assert_any_call(mock_session, mock_job, "processing")
        
        # Orchestration should be called via service layer
        mock_orchestration.assert_called_once_with(mock_session, mock_job)
        
        # Final status should be updated via service layer
        mock_update_status.assert_any_call(mock_session, mock_job, "completed", test_pr_url)
        
        # Task should return success message
        assert result.result == f"Processamento concluído para job: {job_id}"

    @patch('app.tasks.job_tasks.SessionLocal')
    @patch('app.services.job_service.get_job_by_id')
    @patch('app.services.job_service.update_job_status')
    @patch('app.services.job_service.process_job_orchestration')
    def test_process_generation_job_engine_fails(self, mock_orchestration, mock_update_status, mock_get_job, mock_session_local):
        """
        Testa o cenário de falha no motor LangGraph via service layer.
        
        Este teste simula:
        - Busca bem-sucedida do job via service layer
        - Atualização de status para 'processing' via service layer
        - Falha na orquestração (retorna status 'failed')
        - Atualização correta do status do job para 'failed'
        """
        # Arrange: Setup mocks
        job_id = "550e8400-e29b-41d4-a716-446655440000"
        
        # Mock database session
        mock_session = Mock()
        mock_session_local.return_value.__enter__.return_value = mock_session
        
        # Mock job from service layer
        mock_job = Mock(spec=GenerationJob)
        mock_job.id = UUID(job_id)
        mock_job.prompt = "Create a React todo app"
        mock_job.status = "pending"
        mock_job.pr_url = None
        mock_get_job.return_value = mock_job
        
        # Mock failed orchestration
        mock_orchestration.return_value = ("failed", None)
        
        # Act: Execute the task
        result = process_generation_job.delay(job_id)
        
        # Assert: Verify service layer interactions
        # Job should be fetched via service layer
        mock_get_job.assert_called_once_with(mock_session, job_id)
        
        # Status should be updated to processing via service layer
        mock_update_status.assert_any_call(mock_session, mock_job, "processing")
        
        # Orchestration should be called via service layer
        mock_orchestration.assert_called_once_with(mock_session, mock_job)
        
        # Final status should be updated via service layer
        mock_update_status.assert_any_call(mock_session, mock_job, "failed", None)
        
        # Task should return failure message
        assert result.result == f"Processamento falhou para job: {job_id}"

    @patch('app.tasks.job_tasks.SessionLocal')
    @patch('app.services.job_service.get_job_by_id')
    def test_process_generation_job_job_not_found(self, mock_get_job, mock_session_local):
        """
        Testa o cenário onde o job não é encontrado no banco de dados via service layer.
        """
        # Arrange: Setup mocks
        job_id = "550e8400-e29b-41d4-a716-446655440000"
        
        # Mock database session
        mock_session = Mock()
        mock_session_local.return_value.__enter__.return_value = mock_session
        
        # Mock service layer to return None (job not found)
        mock_get_job.return_value = None
        
        # Act: Execute the task
        result = process_generation_job.delay(job_id)
        
        # Assert: Verify service layer interaction
        # Job should be searched via service layer
        mock_get_job.assert_called_once_with(mock_session, job_id)
        
        # Task should return job not found message
        assert result.result == f"Job não encontrado: {job_id}"