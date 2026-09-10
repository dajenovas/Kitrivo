from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import SessionLocal, get_db
from app.core.security import decode_jwt_token
from app.core.rbac import get_user_permission_codes
from app.models.user import User
from app.models.token_blocklist import TokenBlocklist

security_bearer = HTTPBearer(
    scheme_name="Bearer",
    description="Pass your JWT access token directly as Bearer <token>"
)

def get_current_user(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security_bearer)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer token"},
    )
    token = credentials.credentials
    
    # Check if access token has been revoked/logged out
    revoked = db.query(TokenBlocklist).filter(TokenBlocklist.token == token).first()
    if revoked:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token has been revoked (logged out).",
            headers={"WWW-Authenticate": "Bearer token"},
        )

    try:
        payload = decode_jwt_token(token)
        user_id_str: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if user_id_str is None or token_type != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type or payload. Access token required.",
                headers={"WWW-Authenticate": "Bearer token"},
            )
        user_id = int(user_id_str)
    except (JWTError, ValueError):
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise credentials_exception
    return user

def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )
    return current_user

class PermissionChecker:
    """FastAPI Dependency for enforcing fine-grained RBAC on routes based on permission code."""
    def __init__(self, required_permission_code: str):
        self.required_permission_code = required_permission_code

    def __call__(self, current_user: User = Depends(get_current_active_user)) -> User:
        user_permissions = get_user_permission_codes(current_user)
        if self.required_permission_code not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Requires permission '{self.required_permission_code}'"
            )
        return current_user

def require_permission(permission_code: str):
    return Depends(PermissionChecker(permission_code))
