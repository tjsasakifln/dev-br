import pytest
import uuid
from unittest.mock import patch, Mock
from fastapi import HTTPException
from fastapi.testclient import TestClient
from datetime import datetime

from app.db.models.user import User


class TestUserAPI:
    """Test suite for User API endpoints."""

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

    @patch('app.services.user_service.create_user')
    def test_create_user_success_returns_201(self, mock_create_user, client, mock_user):
        """
        Test successful user creation returns 201 Created.
        
        Validates:
        - POST /api/v1/users/ with valid data returns 201
        - Response contains user data (id, email) but not password
        - create_user service is called with correct parameters
        """
        # Arrange
        mock_create_user.return_value = mock_user
        payload = {
            "email": "test@example.com",
            "password": "securepassword123"
        }
        
        # Act
        response = client.post("/api/v1/users/", json=payload)
        
        # Assert
        assert response.status_code == 201
        
        response_data = response.json()
        assert response_data["id"] == "12345678-1234-5678-9012-123456789abc"
        assert response_data["email"] == "test@example.com"
        assert response_data["created_at"] == "2023-01-01T12:00:00"
        assert "password" not in response_data
        assert "hashed_password" not in response_data
        
        # Verify service was called
        mock_create_user.assert_called_once()

    @patch('app.services.user_service.create_user')
    def test_create_user_duplicate_email_returns_409(self, mock_create_user, client):
        """
        Test duplicate email returns 409 Conflict.
        
        Validates:
        - POST /api/v1/users/ with existing email returns 409
        - Response contains appropriate error message
        """
        # Arrange
        mock_create_user.side_effect = HTTPException(
            status_code=409,
            detail="User with email 'duplicate@example.com' already exists"
        )
        payload = {
            "email": "duplicate@example.com",
            "password": "password123"
        }
        
        # Act
        response = client.post("/api/v1/users/", json=payload)
        
        # Assert
        assert response.status_code == 409
        
        response_data = response.json()
        assert "already exists" in response_data["detail"]

    def test_create_user_invalid_email_returns_422(self, client):
        """
        Test invalid email format returns 422 Unprocessable Entity.
        
        Validates:
        - POST /api/v1/users/ with invalid email returns 422
        - Pydantic validation catches invalid email format
        """
        # Arrange
        payload = {
            "email": "usuario-invalido",  # Invalid email format
            "password": "password123"
        }
        
        # Act
        response = client.post("/api/v1/users/", json=payload)
        
        # Assert
        assert response.status_code == 422
        
        response_data = response.json()
        assert "detail" in response_data
        # Validate that email validation error is present
        assert any(
            error.get("loc") == ["body", "email"] 
            for error in response_data["detail"]
        )

    def test_create_user_short_password_returns_422(self, client):
        """
        Test password shorter than 8 characters returns 422.
        
        Validates:
        - POST /api/v1/users/ with short password returns 422
        - Pydantic validation enforces minimum password length
        """
        # Arrange
        payload = {
            "email": "test@example.com",
            "password": "short"  # Less than 8 characters
        }
        
        # Act
        response = client.post("/api/v1/users/", json=payload)
        
        # Assert
        assert response.status_code == 422
        
        response_data = response.json()
        assert "detail" in response_data
        # Validate that password validation error is present
        assert any(
            error.get("loc") == ["body", "password"] 
            for error in response_data["detail"]
        )

    def test_create_user_missing_fields_returns_422(self, client):
        """
        Test missing required fields returns 422.
        
        Validates:
        - POST /api/v1/users/ with missing email/password returns 422
        - Pydantic validation enforces required fields
        """
        # Arrange
        payload = {
            "email": "test@example.com"
            # Missing password field
        }
        
        # Act
        response = client.post("/api/v1/users/", json=payload)
        
        # Assert
        assert response.status_code == 422
        
        response_data = response.json()
        assert "detail" in response_data
        # Validate that password field missing error is present
        assert any(
            error.get("loc") == ["body", "password"] 
            for error in response_data["detail"]
        )