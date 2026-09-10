import re
from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional, Dict
import bcrypt
from jose import jwt, JWTError
from app.core.config import settings

def validate_password_complexity(password: str) -> str:
    """Validates password complexity:
    - Minimum length: 6 characters
    - At least 1 uppercase letter (A-Z)
    - At least 1 lowercase letter (a-z)
    - At least 1 number (0-9)
    - At least 1 special character
    """
    if len(password) < 6:
        raise ValueError("Password must be at least 6 characters long.")
    if not re.search(r"[A-Z]", password):
        raise ValueError("Password must contain at least one uppercase letter (A-Z).")
    if not re.search(r"[a-z]", password):
        raise ValueError("Password must contain at least one lowercase letter (a-z).")
    if not re.search(r"[0-9]", password):
        raise ValueError("Password must contain at least one number (0-9).")
    if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>/?]", password):
        raise ValueError("Password must contain at least one special character.")
    return password

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plaintext password against a bcrypt hash."""
    try:
        pwd_bytes = plain_password.encode('utf-8')
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """Hashes a plaintext password using bcrypt."""
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generates an access JWT token (default 3600 seconds lifetime)."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(seconds=settings.ACCESS_TOKEN_EXPIRE_SECONDS)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "access"
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generates a refresh JWT token (default 1 day lifetime)."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(seconds=settings.REFRESH_TOKEN_EXPIRE_SECONDS)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "refresh"
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_jwt_token(token: str) -> Dict[str, Any]:
    """Decodes a JWT token using jose and the system SECRET_KEY."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
