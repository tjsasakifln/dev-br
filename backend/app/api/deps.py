from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from app.db.session import SessionLocal
from app.db.models.user import User
from app.services import user_service
from app.core.config import SECRET_KEY, ALGORITHM
from app.schemas.token import TokenPayload


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Global exception for credential validation failures
CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_db() -> Generator:
    """
    Dependency that creates and manages database sessions.
    
    Yields:
        Database session that is automatically closed after use
    """
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """
    FastAPI dependency that validates Bearer token and returns authenticated user.
    
    This dependency function is designed to be used with FastAPI's dependency
    injection system. It automatically extracts the Bearer token from the
    Authorization header, validates it, and returns the corresponding user
    object from the database.
    
    The function performs the following validation steps:
    1. Decodes the JWT token using the application's secret key
    2. Validates the token payload structure using Pydantic schema
    3. Extracts the user email from the 'sub' claim
    4. Retrieves the user from the database
    5. Returns the user object if all validations pass
    
    Args:
        token (str): JWT access token extracted from Authorization: Bearer header.
                    Automatically injected by FastAPI using OAuth2PasswordBearer.
        db (Session): Database session for user lookup. Automatically injected
                     by FastAPI using the get_db dependency.
    
    Returns:
        User: The authenticated user object containing id, email, and other
              user attributes from the database.
    
    Raises:
        HTTPException: 401 Unauthorized with "Could not validate credentials"
                      detail if the token is invalid, expired, malformed, or
                      has an invalid payload structure.
        HTTPException: 404 Not Found with "User not found" detail if the
                      token is valid but the user no longer exists in the
                      database (e.g., user was deleted after token issuance).
    
    Example:
        Use this dependency in any FastAPI endpoint that requires authentication:
        
        ```python
        @app.get("/protected")
        async def protected_endpoint(current_user: User = Depends(get_current_user)):
            return {"message": f"Hello {current_user.email}"}
        ```
    
    Note:
        This dependency requires the request to include a valid Authorization
        header in the format: "Authorization: Bearer <jwt_token>"
    """
    try:
        # Decode JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Validate payload structure using Pydantic
        token_data = TokenPayload(**payload)
        email = token_data.sub
    except (JWTError, ValueError):
        raise CREDENTIALS_EXCEPTION
    
    # Get user from database
    user = user_service.get_user_by_email(email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user