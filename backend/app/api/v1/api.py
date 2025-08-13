from fastapi import APIRouter

from app.api.v1.endpoints import user, auth, jobs

api_router = APIRouter()
api_router.include_router(user.router, prefix="/users", tags=["users"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])