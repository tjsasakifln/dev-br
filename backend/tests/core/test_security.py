"""
Testes para funcionalidades de segurança (autenticação e autorização).

CONFIGURAÇÕES NECESSÁRIAS PARA IMPLEMENTAÇÃO:
Para que a criação e decodificação de tokens JWT funcionem, será necessário criar
o arquivo backend/app/core/config.py com as seguintes variáveis:

- SECRET_KEY: Uma string secreta e longa para assinar os tokens
- ALGORITHM: O algoritmo a ser usado (ex: "HS256")
- ACCESS_TOKEN_EXPIRE_MINUTES: O tempo de vida do token em minutos
"""

import pytest
from datetime import datetime, timedelta
from jose import jwt

from app.core.security import create_access_token


class TestJWTTokens:
    """Testes para geração e validação de tokens JWT."""

    def test_create_access_token(self):
        """
        Testa a criação de um token de acesso JWT.
        
        Este teste validará:
        - Se a função retorna uma string (token codificado)
        - Se o payload decodificado contém o campo 'sub' correto
        - Se o payload contém um campo 'exp' com timestamp futuro
        """
        # Dados para incluir no token
        data = {"sub": "user@example.com"}
        
        # Chama a função que ainda não existe (deve falhar)
        token = create_access_token(data)
        
        # Verifica se retorna uma string
        assert isinstance(token, str)
        assert len(token) > 0
        
        # Decodifica o token para validar o payload
        # Nota: Na implementação real, precisaremos importar SECRET_KEY e ALGORITHM
        from app.core.config import SECRET_KEY, ALGORITHM
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Verifica se o campo 'sub' está correto
        assert payload["sub"] == "user@example.com"
        
        # Verifica se há campo de expiração e se é futuro
        assert "exp" in payload
        exp_timestamp = payload["exp"]
        current_time = datetime.utcnow()
        exp_datetime = datetime.utcfromtimestamp(exp_timestamp)
        assert exp_datetime > current_time

    def test_create_access_token_with_custom_expiration(self):
        """
        Testa a criação de token com tempo de expiração customizado.
        """
        data = {"sub": "user@example.com"}
        expires_delta = timedelta(minutes=30)
        
        # Chama a função com parâmetro de expiração customizado
        token = create_access_token(data, expires_delta=expires_delta)
        
        assert isinstance(token, str)
        
        # Decodifica e valida a expiração
        from app.core.config import SECRET_KEY, ALGORITHM
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Calcula o tempo esperado de expiração
        actual_exp = datetime.utcfromtimestamp(payload["exp"])
        current_time = datetime.utcnow()
        
        # Verifica se a expiração está no futuro
        assert actual_exp > current_time
        
        # Verifica se a diferença está aproximadamente correta (dentro de 1 minuto de tolerância)
        expected_duration = expires_delta.total_seconds()
        actual_duration = (actual_exp - current_time).total_seconds()
        time_diff = abs(expected_duration - actual_duration)
        assert time_diff < 60  # Menos de 1 minuto de diferença

    def test_create_access_token_with_additional_claims(self):
        """
        Testa a criação de token com claims adicionais.
        """
        data = {
            "sub": "user@example.com",
            "user_id": 123,
            "role": "admin"
        }
        
        token = create_access_token(data)
        
        from app.core.config import SECRET_KEY, ALGORITHM
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        assert payload["sub"] == "user@example.com"
        assert payload["user_id"] == 123
        assert payload["role"] == "admin"