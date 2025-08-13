from sqlalchemy.orm import Session

from app.db.models.user import User
from app.core.security import hash_password


def create_user(user_data: dict, db: Session) -> User:
    """
    Create a new user with hashed password.
    
    Args:
        user_data: Dictionary containing 'email' and 'password'
        db: SQLAlchemy database session
        
    Returns:
        The created User instance
    """
    hashed_password = hash_password(user_data['password'])
    
    user = User(
        email=user_data['email'],
        hashed_password=hashed_password
    )
    
    db.add(user)
    db.commit()
    
    return user