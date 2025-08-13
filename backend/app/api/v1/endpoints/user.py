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
):
    """
    Create new user.
    """
    user = user_service.create_user(db=db, user_in=user_in)
    return user