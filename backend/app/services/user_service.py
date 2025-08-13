from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.db.models.user import User
from app.core.security import hash_password
from app.schemas.user import UserCreate


def create_user(db: Session, *, user_in: UserCreate) -> User:
    """
    Create a new user with hashed password.
    
    Args:
        db: SQLAlchemy database session
        user_in: Validated user data using UserCreate schema
        
    Returns:
        The created User instance
        
    Raises:
        HTTPException: 409 Conflict if email already exists
    """
    hashed_password = hash_password(user_in.password)
    
    user = User(
        email=user_in.email,
        hashed_password=hashed_password
    )
    
    try:
        db.add(user)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User with email '{user_in.email}' already exists"
        )
    
    return user