from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import todos

app = FastAPI(title="Todo API", version="1.0.0")

# Configuração CORS para desenvolvimento
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro das rotas
app.include_router(todos.router, prefix="/api", tags=["todos"])

@app.get("/")
def read_root():
    return {"message": "Todo API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}