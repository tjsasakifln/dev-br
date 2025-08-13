import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, Text, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from .user import Base

class GenerationJob(Base):
    __tablename__ = "generation_jobs"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending")
    thread_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    run_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    pr_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    owner_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    
    # Relacionamento
    owner: Mapped["User"] = relationship("User", back_populates="generation_jobs")