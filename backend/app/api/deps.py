from typing import Generator

from app.db.session import SessionLocal


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