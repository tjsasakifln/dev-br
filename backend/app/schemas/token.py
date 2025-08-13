from pydantic import BaseModel, Field


class Token(BaseModel):
    """Schema for authentication token response."""
    access_token: str = Field(..., description="JWT access token for API authentication")
    token_type: str = Field(..., description="Token type, always 'bearer' for JWT tokens")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer"
            }
        }
    }