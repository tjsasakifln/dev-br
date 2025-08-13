from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api import deps
from app import schemas
from app.db.models.user import User
from app.services import user_service

router = APIRouter()


@router.post("/", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_in: schemas.UserCreate,
    db: Session = Depends(deps.get_db)
) -> schemas.UserResponse:
    """
    Register a new user in the system.
    
    Creates a new user account with the provided email and password.
    The password is automatically hashed before storage for security.
    
    Args:
        user_in: User registration data containing email and password
        db: Database session dependency for data persistence
        
    Returns:
        UserResponse: Created user data including id, email, and creation timestamp
        
    Raises:
        HTTPException: 409 if email already exists
        HTTPException: 422 if input validation fails
    """
    user = user_service.create_user(db=db, user_in=user_in)
    return user


@router.get("/me", response_model=schemas.UserResponse)
async def read_current_user(
    current_user: User = Depends(deps.get_current_user)
) -> schemas.UserResponse:
    """
    Retrieve authenticated user profile information.
    
    This protected endpoint returns the complete profile information for the
    currently authenticated user. Authentication is performed via Bearer token
    in the Authorization header using JWT (JSON Web Token) validation.
    
    The endpoint automatically validates the provided JWT token, extracts the
    user identity, and returns the corresponding user data from the database.
    No additional permissions or roles are required beyond valid authentication.
    
    Args:
        current_user (User): The authenticated user object obtained from JWT token
                           validation. This parameter is automatically injected by
                           the get_current_user dependency and should not be
                           provided manually in API requests.
    
    Returns:
        UserResponse: A JSON object containing the authenticated user's profile data:
                     - id (UUID): Unique user identifier
                     - email (str): User's registered email address  
                     - created_at (datetime): Account creation timestamp
    
    Raises:
        HTTPException: 401 Unauthorized - Raised when:
                      - No Authorization header is provided
                      - Authorization header format is invalid (not 'Bearer <token>')
                      - JWT token is expired, malformed, or has invalid signature
                      - Token payload structure is invalid or missing required claims
        HTTPException: 404 Not Found - Raised when:
                      - JWT token is valid but the user no longer exists in database
                      - User account was deleted after token was issued
    
    Example:
        ```bash
        curl -X GET "http://localhost:8000/api/v1/users/me" \\
             -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
        ```
        
        Response (200 OK):
        ```json
        {
            "id": "12345678-1234-5678-9012-123456789abc",
            "email": "user@example.com", 
            "created_at": "2023-01-01T12:00:00"
        }
        ```
    
    Note:
        This endpoint requires a valid JWT token obtained through the login
        endpoint (/api/v1/auth/login). The token must be included in the
        Authorization header using the Bearer authentication scheme.
    """
    return current_user