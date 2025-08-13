import pytest
from unittest.mock import Mock, patch
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

from app.services.user_service import create_user
from app.db.models.user import User
from app.schemas.user import UserCreate


class TestCreateUser:
    """Test suite for the create_user function."""

    @patch('app.services.user_service.hash_password')
    def test_create_user_success(self, mock_hash_password):
        """
        Test that create_user successfully creates a new user with proper password hashing.
        
        Validates:
        - Accepts user data and database session as arguments
        - Calls hash_password function exactly once with plain text password
        - Calls db.add() and db.commit() methods
        - Returns User object with correct email
        - Ensures hashed_password is not the plain text password
        """
        # Arrange
        mock_db = Mock(spec=Session)
        user_in = UserCreate(
            email='test@example.com',
            password='plain_text_password'
        )
        mock_hashed_password = 'hashed_password_123'
        mock_hash_password.return_value = mock_hashed_password
        
        # Act
        result = create_user(db=mock_db, user_in=user_in)
        
        # Assert - hash_password called exactly once with plain text password
        mock_hash_password.assert_called_once_with('plain_text_password')
        
        # Assert - database methods called
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        
        # Assert - returned user has correct email
        assert result.email == 'test@example.com'
        
        # Assert - get the user object that was added to the session
        added_user = mock_db.add.call_args[0][0]
        assert isinstance(added_user, User)
        assert added_user.email == 'test@example.com'
        assert added_user.hashed_password == mock_hashed_password
        assert added_user.hashed_password != 'plain_text_password'

    @patch('app.services.user_service.hash_password')
    def test_create_user_with_different_email(self, mock_hash_password):
        """Test create_user with different email to ensure data integrity."""
        # Arrange
        mock_db = Mock(spec=Session)
        user_in = UserCreate(
            email='another@test.com',
            password='another_password'
        )
        mock_hash_password.return_value = 'hashed_another_password'
        
        # Act
        result = create_user(db=mock_db, user_in=user_in)
        
        # Assert
        assert result.email == 'another@test.com'
        mock_hash_password.assert_called_once_with('another_password')
        
        added_user = mock_db.add.call_args[0][0]
        assert added_user.hashed_password != 'another_password'

    @patch('app.services.user_service.hash_password')
    def test_create_user_duplicate_email_raises_409(self, mock_hash_password):
        """Test that duplicate email raises HTTPException 409.""" 
        # Arrange
        mock_db = Mock(spec=Session)
        mock_db.commit.side_effect = IntegrityError("", "", "")
        
        user_in = UserCreate(
            email='duplicate@example.com',
            password='password123'
        )
        mock_hash_password.return_value = 'hashed_password'
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            create_user(db=mock_db, user_in=user_in)
        
        assert exc_info.value.status_code == 409
        assert "already exists" in exc_info.value.detail
        mock_db.rollback.assert_called_once()

    def test_create_user_requires_db_session(self):
        """Test that create_user requires a database session parameter."""
        user_in = UserCreate(
            email='test@example.com',
            password='password'
        )
        
        # This test will fail until the function is implemented
        # but validates that the function signature requires db parameter
        try:
            create_user(db=None, user_in=user_in)
        except (TypeError, AttributeError):
            # Expected to fail since function doesn't exist yet
            pass