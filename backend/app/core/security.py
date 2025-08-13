import bcrypt
from datetime import datetime, timedelta
from jose import jwt
from .config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    Args:
        password: The plain text password to hash
        
    Returns:
        The hashed password as a string
    """
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.
    
    Args:
        plain_password: The plain text password to verify
        hashed_password: The hashed password to check against
        
    Returns:
        True if the password matches, False otherwise
    """
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Create a JWT access token with payload data and expiration.
    
    This function generates a JSON Web Token (JWT) containing the provided
    payload data and a calculated expiration time. The token is signed using
    the application's secret key and can be used for user authentication.
    
    Args:
        data (dict): Dictionary containing the payload data to encode in the token.
                    Typically includes user identification information like user_id
                    or email. The original dictionary is not modified.
        expires_delta (timedelta, optional): Custom expiration time delta from now.
                                           If not provided, defaults to 
                                           ACCESS_TOKEN_EXPIRE_MINUTES from configuration.
        
    Returns:
        str: The encoded JWT token ready for use in Authorization headers.
        
    Example:
        >>> token_data = {"sub": "user@example.com", "user_id": 123}
        >>> token = create_access_token(token_data)
        >>> # Use token in Authorization: Bearer <token>
        
        >>> # Custom expiration
        >>> custom_expire = timedelta(hours=24)
        >>> long_token = create_access_token(token_data, custom_expire)
        
    Note:
        The function automatically adds an 'exp' (expiration) claim to the payload
        before encoding. This claim is used by JWT libraries to validate token
        expiration automatically.
    """
    # Create a copy of the input data to avoid modifying the original
    to_encode = data.copy()
    
    # Calculate expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Add expiration claim to the payload
    to_encode.update({"exp": expire})
    
    # Encode and return the JWT token
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt