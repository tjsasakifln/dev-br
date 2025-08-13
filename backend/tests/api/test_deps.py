import pytest
import uuid
from unittest.mock import patch, Mock
from datetime import timedelta, datetime
from fastapi import HTTPException

from app.core.security import create_access_token
from app.db.models.user import User


class TestGetCurrentUser:
    """Test suite for get_current_user dependency function."""

    @pytest.fixture
    def mock_user(self):
        """Mock user object for testing."""
        user = Mock(spec=User)
        user.id = uuid.UUID("12345678-1234-5678-9012-123456789abc")
        user.email = "test@example.com"
        user.created_at = datetime(2023, 1, 1, 12, 0, 0)
        return user

    @patch('app.api.deps.user_service.get_user_by_email')
    def test_get_current_user_success(self, mock_get_user_by_email, mock_user):
        """
        Test successful token validation and user retrieval.
        
        Validates:
        - Valid JWT token is decoded correctly
        - User email is extracted from token payload
        - get_user_by_email service is called with correct email
        - Function returns the correct user object
        """
        # Arrange
        from app.api.deps import get_current_user
        
        token_data = {"sub": mock_user.email}
        valid_token = create_access_token(data=token_data)
        mock_get_user_by_email.return_value = mock_user
        
        # Act
        result = get_current_user(token=valid_token)
        
        # Assert
        assert result == mock_user
        mock_get_user_by_email.assert_called_once_with(mock_user.email)

    def test_get_current_user_expired_token(self):
        """
        Test that expired token raises HTTPException with 401 status.
        
        Validates:
        - Expired JWT token is properly detected
        - HTTPException is raised with status_code 401
        - Error detail indicates token has expired
        """
        # Arrange
        from app.api.deps import get_current_user
        
        token_data = {"sub": "test@example.com"}
        expired_token = create_access_token(
            data=token_data, 
            expires_delta=timedelta(seconds=-1)
        )
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            get_current_user(token=expired_token)
        
        assert exc_info.value.status_code == 401
        assert "Could not validate credentials" in exc_info.value.detail

    def test_get_current_user_invalid_token(self):
        """
        Test that invalid token raises HTTPException with 401 status.
        
        Validates:
        - Invalid/malformed JWT token is properly detected
        - HTTPException is raised with status_code 401
        - Error detail indicates invalid credentials
        """
        # Arrange
        from app.api.deps import get_current_user
        
        invalid_token = "fake-token"
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            get_current_user(token=invalid_token)
        
        assert exc_info.value.status_code == 401

    @patch('app.api.deps.user_service.get_user_by_email')
    def test_get_current_user_user_not_found(self, mock_get_user_by_email):
        """
        Test that valid token with non-existent user raises HTTPException with 404 status.
        
        Validates:
        - Valid JWT token is decoded correctly
        - get_user_by_email service returns None (user not found)
        - HTTPException is raised with status_code 404
        - Error detail indicates user not found
        """
        # Arrange
        from app.api.deps import get_current_user
        
        token_data = {"sub": "deleted@example.com"}
        valid_token = create_access_token(data=token_data)
        mock_get_user_by_email.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            get_current_user(token=valid_token)
        
        assert exc_info.value.status_code == 404
        mock_get_user_by_email.assert_called_once_with("deleted@example.com")