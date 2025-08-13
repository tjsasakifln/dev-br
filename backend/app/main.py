from fastapi import FastAPI

from app.api.v1.api import api_router

app = FastAPI(
    title="Open SWE Platform API",
    description="AI-powered full-stack application generation platform",
    version="1.0.0"
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def health_check():
    """Health check endpoint."""
    return {"status": "ok"}