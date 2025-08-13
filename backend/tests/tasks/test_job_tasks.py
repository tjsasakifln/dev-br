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
    @patch('app.tasks.job_tasks.LangGraphClient')
    @patch('app.tasks.job_tasks.GitHubAPI')
    def test_process_generation_job_success(self, mock_github, mock_langgraph_client, mock_session_local):
        """
        Testa o cenário de sucesso da tarefa process_generation_job.
        
        Este teste simula:
        - Busca bem-sucedida do job no banco de dados
        - Criação de repositório no GitHub
        - Execução bem-sucedida do motor LangGraph
        - Atualização correta do status do job para 'completed'
        - Preenchimento do campo pr_url com a URL retornada
        """
        # Arrange: Setup mocks
        job_id = "550e8400-e29b-41d4-a716-446655440000"
        test_pr_url = "https://github.com/user/repo/pull/1"
        
        # Mock database session and job
        mock_session = Mock()
        mock_session_local.return_value.__enter__.return_value = mock_session
        
        mock_job = Mock(spec=GenerationJob)
        mock_job.id = UUID(job_id)
        mock_job.prompt = "Create a React todo app"
        mock_job.status = "pending"
        mock_job.pr_url = None
        mock_session.query.return_value.filter.return_value.first.return_value = mock_job
        
        # Mock GitHub API
        mock_github_instance = Mock()
        mock_github.return_value = mock_github_instance
        mock_github_instance.create_repository.return_value = "https://github.com/user/repo"
        
        # Mock LangGraph client
        mock_client = Mock()
        mock_langgraph_client.return_value = mock_client
        
        # Mock stream response from LangGraph
        mock_stream_event_1 = {"type": "progress", "data": {"message": "Analyzing prompt..."}}
        mock_stream_event_2 = {"type": "progress", "data": {"message": "Generating code..."}}
        mock_stream_event_3 = {"type": "completion", "data": {"pr_url": test_pr_url}}
        mock_client.stream_execution.return_value = [mock_stream_event_1, mock_stream_event_2, mock_stream_event_3]
        
        # Act: Execute the task
        result = process_generation_job.delay(job_id)
        
        # Assert: Verify behavior
        # Job should be fetched from database
        mock_session.query.assert_called_once_with(GenerationJob)
        mock_session.query.return_value.filter.assert_called_once()
        
        # GitHub repository should be created
        mock_github_instance.create_repository.assert_called_once()
        
        # LangGraph engine should be executed
        mock_client.stream_execution.assert_called_once()
        
        # Job should be updated with final status and PR URL
        assert mock_job.status == "completed"
        assert mock_job.pr_url == test_pr_url
        
        # Session should be committed
        mock_session.commit.assert_called()
        
        # Task should return success message
        assert result.result == f"Processamento concluído para job: {job_id}"

    @patch('app.tasks.job_tasks.SessionLocal')
    @patch('app.tasks.job_tasks.LangGraphClient')
    @patch('app.tasks.job_tasks.GitHubAPI')
    def test_process_generation_job_engine_fails(self, mock_github, mock_langgraph_client, mock_session_local):
        """
        Testa o cenário de falha no motor LangGraph.
        
        Este teste simula:
        - Busca bem-sucedida do job no banco de dados
        - Criação de repositório no GitHub
        - Falha na execução do motor LangGraph (exceção)
        - Atualização correta do status do job para 'failed'
        """
        # Arrange: Setup mocks
        job_id = "550e8400-e29b-41d4-a716-446655440000"
        
        # Mock database session and job
        mock_session = Mock()
        mock_session_local.return_value.__enter__.return_value = mock_session
        
        mock_job = Mock(spec=GenerationJob)
        mock_job.id = UUID(job_id)
        mock_job.prompt = "Create a React todo app"
        mock_job.status = "pending"
        mock_job.pr_url = None
        mock_session.query.return_value.filter.return_value.first.return_value = mock_job
        
        # Mock GitHub API
        mock_github_instance = Mock()
        mock_github.return_value = mock_github_instance
        mock_github_instance.create_repository.return_value = "https://github.com/user/repo"
        
        # Mock LangGraph client to raise exception
        mock_client = Mock()
        mock_langgraph_client.return_value = mock_client
        mock_client.stream_execution.side_effect = Exception("Engine processing failed")
        
        # Act: Execute the task
        result = process_generation_job.delay(job_id)
        
        # Assert: Verify behavior
        # Job should be fetched from database
        mock_session.query.assert_called_once_with(GenerationJob)
        mock_session.query.return_value.filter.assert_called_once()
        
        # GitHub repository should be created
        mock_github_instance.create_repository.assert_called_once()
        
        # LangGraph engine should be attempted
        mock_client.stream_execution.assert_called_once()
        
        # Job should be updated with failed status
        assert mock_job.status == "failed"
        assert mock_job.pr_url is None
        
        # Session should be committed
        mock_session.commit.assert_called()
        
        # Task should return failure message
        assert result.result == f"Processamento falhou para job: {job_id}"

    @patch('app.tasks.job_tasks.SessionLocal')
    def test_process_generation_job_job_not_found(self, mock_session_local):
        """
        Testa o cenário onde o job não é encontrado no banco de dados.
        """
        # Arrange: Setup mocks
        job_id = "550e8400-e29b-41d4-a716-446655440000"
        
        # Mock database session to return None (job not found)
        mock_session = Mock()
        mock_session_local.return_value.__enter__.return_value = mock_session
        mock_session.query.return_value.filter.return_value.first.return_value = None
        
        # Act: Execute the task
        result = process_generation_job.delay(job_id)
        
        # Assert: Verify behavior
        # Job should be searched in database
        mock_session.query.assert_called_once_with(GenerationJob)
        mock_session.query.return_value.filter.assert_called_once()
        
        # Task should return job not found message
        assert result.result == f"Job não encontrado: {job_id}"