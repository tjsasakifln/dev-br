from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api import deps
from app import schemas
from app.services import user_service
from app.core.security import create_access_token

router = APIRouter()


@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(deps.get_db)
) -> schemas.Token:
    """
    Obtain Bearer access token for API authentication.

    This endpoint implements the OAuth2 password flow to authenticate users and issue
    JWT access tokens. Client applications should send credentials using the
    application/x-www-form-urlencoded format.

    The returned Bearer token must be included in the Authorization header for
    protected API endpoints: 'Authorization: Bearer <access_token>'

    Args:
        form_data (OAuth2PasswordRequestForm): User credentials containing:
            - username (str): User's email address
            - password (str): User's plain text password
        db (Session): Database session for user authentication queries

    Returns:
        Token: Authentication response containing:
            - access_token (str): JWT bearer token for API access
            - token_type (str): Always "bearer" for JWT tokens

    Raises:
        HTTPException: 401 Unauthorized with WWW-Authenticate header when:
            - Email address is not found in the system
            - Password does not match the stored hash
            - User account is inactive or suspended

    Example:
        curl -X POST "/api/v1/auth/token" \\
             -H "Content-Type: application/x-www-form-urlencoded" \\
             -d "username=user@example.com&password=securepass123"
    """
    user = user_service.authenticate_user(
        db=db, 
        email=form_data.username, 
        password=form_data.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }