"""
Configurações da aplicação.

Este módulo contém as configurações centrais da aplicação,
incluindo configurações de segurança para JWT.
"""

# Chave secreta para assinatura de tokens JWT
# IMPORTANTE: Em produção, esta chave DEVE ser carregada de uma variável de ambiente
# e NUNCA deve ser hardcoded no código. Use algo como: os.getenv("SECRET_KEY")
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"

# Algoritmo usado para codificação/decodificação de tokens JWT
ALGORITHM = "HS256"

# Tempo de vida padrão dos tokens de acesso em minutos
ACCESS_TOKEN_EXPIRE_MINUTES = 30