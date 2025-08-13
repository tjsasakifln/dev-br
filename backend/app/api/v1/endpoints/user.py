from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api import deps
from app import schemas
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