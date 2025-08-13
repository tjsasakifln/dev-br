import pytest
import uuid
from unittest.mock import patch, Mock
from fastapi.testclient import TestClient
from datetime import datetime

from app.db.models.user import User


class TestAuthAPI:
    """Test suite for Authentication API endpoints."""

    @pytest.fixture
    def client(self):
        """Create test client for FastAPI app."""
        from app.main import app
        return TestClient(app)

    @pytest.fixture
    def mock_user(self):
        """Mock user object for testing."""
        user = Mock(spec=User)
        user.id = uuid.UUID("12345678-1234-5678-9012-123456789abc")
        user.email = "test@example.com"
        user.created_at = datetime(2023, 1, 1, 12, 0, 0)
        return user

    @patch('app.api.v1.endpoints.auth.create_access_token')
    @patch('app.api.v1.endpoints.auth.user_service.authenticate_user')
    def test_login_for_access_token_success(self, mock_authenticate_user, mock_create_access_token, client, mock_user):
        """
        Test successful login returns 200 OK with access token.
        
        Validates:
        - POST /api/v1/auth/token with valid credentials returns 200
        - Response contains access_token and token_type fields
        - authenticate_user service is called with correct parameters
        - create_access_token is called with user data
        """
        # Arrange
        mock_authenticate_user.return_value = mock_user
        mock_create_access_token.return_value = "fake-access-token"
        
        form_data = {
            "username": "test@example.com",
            "password": "correctpassword123"
        }
        
        # Act
        response = client.post("/api/v1/auth/token", data=form_data)
        
        # Assert
        assert response.status_code == 200
        
        response_data = response.json()
        assert response_data["access_token"] == "fake-access-token"
        assert response_data["token_type"] == "bearer"
        
        # Verify services were called correctly  
        mock_authenticate_user.assert_called_once()
        mock_create_access_token.assert_called_once_with(data={"sub": mock_user.email})

    @patch('app.api.v1.endpoints.auth.user_service.authenticate_user')
    def test_login_for_access_token_failure(self, mock_authenticate_user, client):
        """
        Test failed login returns 401 Unauthorized.
        
        Validates:
        - POST /api/v1/auth/token with invalid credentials returns 401
        - Response contains WWW-Authenticate header with Bearer value
        - authenticate_user service returns None for invalid credentials
        """
        # Arrange
        mock_authenticate_user.return_value = None
        
        form_data = {
            "username": "test@example.com",
            "password": "wrongpassword"
        }
        
        # Act
        response = client.post("/api/v1/auth/token", data=form_data)
        
        # Assert
        assert response.status_code == 401
        assert response.headers["WWW-Authenticate"] == "Bearer"
        
        # Verify service was called
        mock_authenticate_user.assert_called_once()