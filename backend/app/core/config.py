"""
Configurações da aplicação.

Este módulo contém as configurações centrais da aplicação usando Pydantic Settings
para validação e carregamento seguro de variáveis de ambiente.
"""

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Configurações da aplicação carregadas de variáveis de ambiente.
    
    Esta classe usa Pydantic Settings para validar e carregar configurações
    de forma segura, suportando arquivos .env e variáveis de ambiente do sistema.
    
    Attributes:
        secret_key: Chave secreta para assinatura de tokens JWT. DEVE ser uma
                   string aleatória e segura em produção.
        algorithm: Algoritmo usado para codificação/decodificação de tokens JWT.
        access_token_expire_minutes: Tempo de vida dos tokens de acesso em minutos.
    
    Environment Variables:
        SECRET_KEY: Chave secreta JWT (obrigatório em produção)
        ALGORITHM: Algoritmo JWT (padrão: "HS256")
        ACCESS_TOKEN_EXPIRE_MINUTES: Expiração do token em minutos (padrão: 30)
    """
    
    secret_key: str = Field(
        default="09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7",
        description="Chave secreta para JWT. Deve ser alterada em produção."
    )
    
    algorithm: str = Field(
        default="HS256",
        description="Algoritmo para codificação/decodificação JWT"
    )
    
    access_token_expire_minutes: int = Field(
        default=30,
        gt=0,
        description="Tempo de vida dos tokens de acesso em minutos"
    )
    
    celery_broker_url: str = Field(
        default="redis://redis:6379/0",
        description="URL do broker Redis para Celery"
    )
    
    celery_result_backend: str = Field(
        default="redis://redis:6379/0", 
        description="URL do backend Redis para resultados Celery"
    )
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Instância global das configurações
settings = Settings()

# Backwards compatibility - manter exports atuais para não quebrar imports existentes  
SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes