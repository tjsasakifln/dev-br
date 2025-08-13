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
    """Get a user by their email address.
    
    Performs a database query to find a user with the specified email address.
    This function is commonly used for authentication and user lookup operations.
    
    Args:
        db (Session): SQLAlchemy database session for executing the query.
        email (str): The email address to search for in the database.
        
    Returns:
        User | None: The User instance if found, None if no user exists with 
            the given email address.
            
    Example:
        >>> user = get_user_by_email(db, "user@example.com")
        >>> if user:
        ...     print(f"Found user: {user.email}")
    """
    return db.query(User).filter(User.email == email).first()


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    """Authenticate a user using email and password credentials.
    
    Verifies user credentials by first looking up the user by email, then
    comparing the provided password against the stored hashed password using
    secure password verification. This is the primary authentication method
    for user login operations.
    
    Args:
        db (Session): SQLAlchemy database session for user lookup.
        email (str): The user's email address for identification.
        password (str): The plain text password to verify against the stored hash.
        
    Returns:
        User | None: The authenticated User instance if credentials are valid,
            None if the user doesn't exist or password verification fails.
            
    Example:
        >>> user = authenticate_user(db, "user@example.com", "password123")
        >>> if user:
        ...     print(f"Authentication successful for {user.email}")
        ... else:
        ...     print("Invalid credentials")
    """
    user = get_user_by_email(db, email)
    if not user:
        return None
    
    if not verify_password(password, user.hashed_password):
        return None
    
    return user