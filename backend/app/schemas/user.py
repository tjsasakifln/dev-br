import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Schema for user creation input validation."""
    email: EmailStr
    password: str = Field(min_length=8)
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123"
            }
        }
    }


class UserResponse(BaseModel):
    """Schema for user response data."""
    id: uuid.UUID
    email: str
    created_at: datetime
    
    model_config = {
        "from_attributes": True
    }