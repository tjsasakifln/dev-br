from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.db.models.user import User
from app.core.security import hash_password, verify_password
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


def get_user_by_email(db: Session, email: str) -> User | None:
    """
    Get a user by email address.
    
    Args:
        db: SQLAlchemy database session
        email: The email address to search for
        
    Returns:
        The User instance if found, None otherwise
    """
    return db.query(User).filter(User.email == email).first()


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    """
    Authenticate a user with email and password.
    
    Args:
        db: SQLAlchemy database session
        email: The user's email address
        password: The plain text password to verify
        
    Returns:
        The User instance if authentication succeeds, None otherwise
    """
    user = get_user_by_email(db, email)
    if not user:
        return None
    
    if not verify_password(password, user.hashed_password):
        return None
    
    return user