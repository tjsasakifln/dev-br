import pytest
import uuid
from unittest.mock import patch, Mock
from fastapi.testclient import TestClient
from datetime import datetime

from app.db.models.job import GenerationJob


class TestJobsAPI:
    """Test suite for Jobs API endpoints."""

    @pytest.fixture
    def client(self):
        """Create test client for FastAPI app."""
        from app.main import app
        return TestClient(app)

    @pytest.fixture
    def mock_job(self):
        """Mock job object for testing."""
        job = Mock(spec=GenerationJob)
        job.id = uuid.UUID("123e4567-e89b-12d3-a456-426614174000")
        job.status = "pending"
        job.prompt = "Create a todo app with React and FastAPI"
        job.pr_url = None
        job.owner_id = uuid.UUID("987fcdeb-51a2-43d7-8f6e-123456789abc")
        job.created_at = datetime(2023, 1, 1, 12, 0, 0)
        return job

    @patch('app.services.job_service.create_job_and_dispatch')
    def test_create_job_success(self, mock_create_job_and_dispatch, client, mock_job):
        """
        Test successful job creation returns 202 Accepted.
        
        Validates:
        - POST /api/v1/jobs/ with valid data returns 202 Accepted
        - Response contains job data (id, status, prompt, etc.)
        - create_job_and_dispatch service is called with correct parameters
        - User must be authenticated to create a job
        """
        from app.main import app
        from app.api import deps
        from app.db.models.user import User
        
        # Arrange - Create mock user for authentication
        mock_user = Mock(spec=User)
        mock_user.id = 1
        mock_user.email = "test@example.com"
        
        # Override dependency to simulate authenticated user
        def override_get_current_user():
            return mock_user
            
        app.dependency_overrides[deps.get_current_user] = override_get_current_user
        
        # Mock the service function
        mock_create_job_and_dispatch.return_value = mock_job
        
        payload = {
            "prompt": "Create a todo app with React and FastAPI"
        }
        
        try:
            # Act
            response = client.post("/api/v1/jobs/", json=payload)
            
            # Assert
            assert response.status_code == 202
            
            response_data = response.json()
            assert response_data["id"] == "123e4567-e89b-12d3-a456-426614174000"
            assert response_data["status"] == "pending"
            assert response_data["prompt"] == "Create a todo app with React and FastAPI"
            assert response_data["pr_url"] is None
            assert response_data["owner_id"] == "987fcdeb-51a2-43d7-8f6e-123456789abc"
            assert response_data["created_at"] == "2023-01-01T12:00:00"
            
            # Verify service was called with correct parameters
            mock_create_job_and_dispatch.assert_called_once()
            call_kwargs = mock_create_job_and_dispatch.call_args.kwargs
            assert call_kwargs["prompt"] == "Create a todo app with React and FastAPI"
            assert call_kwargs["user_id"] == 1
            
        finally:
            # Clean up - Remove dependency override
            app.dependency_overrides.clear()

    def test_create_job_unauthenticated(self, client):
        """
        Test unauthenticated request returns 401 Unauthorized.
        
        Validates:
        - POST /api/v1/jobs/ without authentication returns 401
        - No dependency override means normal authentication flow applies
        """
        # Arrange
        payload = {
            "prompt": "Create a todo app with React and FastAPI"
        }
        
        # Act - Make request without authentication
        response = client.post("/api/v1/jobs/", json=payload)
        
        # Assert
        assert response.status_code == 401

    def test_create_job_empty_prompt(self, client):
        """
        Test empty prompt returns 422 Unprocessable Entity.
        
        Validates:
        - POST /api/v1/jobs/ with empty prompt returns 422
        - Pydantic validation enforces non-empty prompt
        """
        from app.main import app
        from app.api import deps
        from app.db.models.user import User
        
        # Arrange - Create mock user for authentication
        mock_user = Mock(spec=User)
        mock_user.id = 1
        mock_user.email = "test@example.com"
        
        # Override dependency to simulate authenticated user
        def override_get_current_user():
            return mock_user
            
        app.dependency_overrides[deps.get_current_user] = override_get_current_user
        
        payload = {
            "prompt": ""  # Empty prompt should fail validation
        }
        
        try:
            # Act
            response = client.post("/api/v1/jobs/", json=payload)
            
            # Assert
            assert response.status_code == 422
            
            response_data = response.json()
            assert "detail" in response_data
            # Validate that prompt validation error is present
            assert any(
                error.get("loc") == ["body", "prompt"] 
                for error in response_data["detail"]
            )
            
        finally:
            # Clean up - Remove dependency override
            app.dependency_overrides.clear()