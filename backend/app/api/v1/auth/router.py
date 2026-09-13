import json
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from jose import JWTError
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token, decode_jwt_token
from app.core.response import APIResponse, api_response
from app.api.deps import get_db, get_current_active_user
from app.api.v1.auth.schemas import (
    TokenResponse, LoginRequest, RegisterRequest, RefreshTokenRequest, LogoutRequest, ChangePasswordRequest, UserProfileResponse, UpdateProfileRequest
)
from app.api.v1.auth import service as auth_service
from app.api.v1.users import service as user_service
from app.api.v1.users.schemas import UserCreate
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

async def extract_token_from_request(request: Request, key: str) -> Optional[str]:
    """Helper function to extract token string from JSON body, raw text, or form data."""
    # 1. Try parsing JSON body
    try:
        data = await request.json()
        if isinstance(data, dict) and data.get(key):
            return str(data.get(key)).strip()
    except Exception:
        pass

    # 2. Try raw text/bytes body (handles Content-Type: text/plain from Postman)
    try:
        raw_body = await request.body()
        if raw_body:
            text = raw_body.decode("utf-8").strip()
            parsed = json.loads(text)
            if isinstance(parsed, dict) and parsed.get(key):
                return str(parsed.get(key)).strip()
    except Exception:
        pass

    # 3. Try form data
    try:
        form = await request.form()
        if form.get(key):
            return str(form.get(key)).strip()
    except Exception:
        pass

    return None

# Login

@router.post(
    "/login", 
    response_model=APIResponse[TokenResponse],
    openapi_extra={
        "requestBody": {
            "required": True,
            "content": {
                "application/json": {
                    "schema": LoginRequest.model_json_schema()
                }
            }
        }
    }
)
async def login(request: Request, db: Session = Depends(get_db)) -> Any:
    """Flexible login endpoint. Accepts JSON payload, raw body text, or form data."""
    username_or_email = await extract_token_from_request(request, "username_or_email") \
                        or await extract_token_from_request(request, "username") \
                        or await extract_token_from_request(request, "email")
    password = await extract_token_from_request(request, "password")

    if not username_or_email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Missing username/email or password in request body."
        )

    user = auth_service.authenticate_user(db, username_or_email, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Incorrect username/email or password", 
            headers={"WWW-Authenticate": "Bearer token"}
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user account"
        )

    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    
    user_profile = auth_service.build_user_profile(user, db)

    token_payload = {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_SECONDS,
        "user": user_profile
    }

    try:
        from app.services.audit_service import log_activity
        log_activity(
            db=db,
            user=user,
            action="LOGIN",
            module="Authentication",
            entity_type="User",
            entity_id=user.id,
            description=f"User '{user.full_name or user.username}' ({user.email}) logged in successfully",
            ip_address=request.client.host if request.client else None
        )
    except Exception:
        pass

    return api_response(data=token_payload, message="Login successful")

# Register

@router.post(
    "/register",
    response_model=APIResponse[TokenResponse]
)
def register_user(body: RegisterRequest, db: Session = Depends(get_db)) -> Any:
    """Register a new user account."""
    if user_service.get_user_by_email(db, body.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already registered."
        )
    if user_service.get_user_by_username(db, body.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is already taken."
        )

    user_in = UserCreate(
        username=body.username,
        email=body.email,
        password=body.password,
        full_name=body.full_name,
        is_active=True
    )
    user = user_service.create_user(db, user_in)

    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    user_profile = auth_service.build_user_profile(user, db)

    token_payload = {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_SECONDS,
        "user": user_profile
    }
    try:
        from app.services.audit_service import log_activity
        log_activity(
            db=db,
            user=user,
            action="CREATE",
            module="Authentication",
            entity_type="User",
            entity_id=user.id,
            description=f"Registered new user account '{user.email}'",
            changes_diff={"username": user.username, "email": user.email, "full_name": user.full_name}
        )
    except Exception:
        pass

    return api_response(data=token_payload, message="Account registered successfully")

# Refresh Token

@router.post(
    "/refresh", 
    response_model=APIResponse[TokenResponse],
    openapi_extra={
        "requestBody": {
            "required": True,
            "content": {
                "application/json": {
                    "schema": RefreshTokenRequest.model_json_schema()
                }
            }
        }
    }
)
async def refresh_token(request: Request, db: Session = Depends(get_db)) -> Any:
    """Refreshes access and refresh tokens using a valid 1-day refresh_token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, 
        detail="Invalid or expired refresh token", 
        headers={"WWW-Authenticate": "Bearer token"}
    )
    
    refresh_token_str = await extract_token_from_request(request, "refresh_token")
    if not refresh_token_str:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing 'refresh_token' in request body."
        )

    # Check if refresh token is in blocklist
    if auth_service.is_token_revoked(db, refresh_token_str):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Refresh token has been revoked (logged out).", 
            headers={"WWW-Authenticate": "Bearer token"}
        )

    try:
        payload = decode_jwt_token(refresh_token_str)
        user_id_str: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if user_id_str is None or token_type != "refresh":
            raise credentials_exception
            
        user_id = int(user_id_str)
    except (JWTError, ValueError):
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise credentials_exception

    new_access_token = create_access_token(subject=user.id)
    new_refresh_token = create_refresh_token(subject=user.id)

    # Revoke old refresh token so it cannot be re-used
    auth_service.revoke_token(db, refresh_token_str, token_type="refresh", user_id=user.id)

    token_payload = {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_SECONDS
    }
    return api_response(data=token_payload, message="Token refreshed successfully")

# Logout

@router.post(
    "/logout", 
    response_model=APIResponse[None],
    openapi_extra={
        "requestBody": {
            "required": True,
            "content": {
                "application/json": {
                    "schema": LogoutRequest.model_json_schema()
                }
            }
        }
    }
)
async def logout(
    request: Request,
    db: Session = Depends(get_db)
) -> Any:
    """Logs out the user by extracting both access_token and refresh_token from body or header and invalidating them."""
    # 1. Extract Access Token (from Body or Authorization Header)
    access_token_str = await extract_token_from_request(request, "access_token")
    if not access_token_str:
        auth_header = request.headers.get("Authorization") or request.headers.get("authorization")
        if auth_header and "bearer" in auth_header.lower():
            parts = auth_header.split()
            if len(parts) >= 2:
                access_token_str = parts[1].strip()

    # 2. Extract Refresh Token (from Body)
    refresh_token_str = await extract_token_from_request(request, "refresh_token")

    if not access_token_str and not refresh_token_str:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing 'access_token' and/or 'refresh_token' in request body or Authorization header."
        )

    # 3. Invalidate Access Token
    if access_token_str:
        user_id = None
        try:
            payload = decode_jwt_token(access_token_str)
            if payload.get("sub"):
                user_id = int(payload.get("sub"))
        except Exception:
            pass
        auth_service.revoke_token(db, access_token_str, token_type="access", user_id=user_id)

    # 4. Invalidate Refresh Token
    if refresh_token_str:
        user_id = None
        try:
            payload = decode_jwt_token(refresh_token_str)
            if payload.get("sub"):
                user_id = int(payload.get("sub"))
        except Exception:
            pass
        auth_service.revoke_token(db, refresh_token_str, token_type="refresh", user_id=user_id)

    return api_response(data=None, message="Successfully logged out. Both access and refresh tokens invalidated.")

# Profile

@router.get("/me", response_model=APIResponse[UserProfileResponse])
def get_current_user_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """Get current authenticated user profile, including roles, allowed permission codes, and sidebar menu tree."""
    profile = auth_service.build_user_profile(current_user, db)
    return api_response(data=profile, message="User profile retrieved successfully")

@router.put("/me/profile", response_model=APIResponse[UserProfileResponse])
def update_current_user_profile(
    body: UpdateProfileRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """Update current user's profile picture and full name."""
    if body.full_name is not None:
        current_user.full_name = body.full_name
    if body.profile_picture is not None:
        current_user.profile_picture = body.profile_picture

    db.commit()
    db.refresh(current_user)

    profile = auth_service.build_user_profile(current_user, db)

    try:
        from app.services.audit_service import log_activity
        log_activity(
            db=db,
            user=current_user,
            action="UPDATE",
            module="User Profile",
            entity_type="User",
            entity_id=current_user.id,
            description=f"Updated profile details for '{current_user.full_name or current_user.username}'",
            changes_diff=body.model_dump(exclude_unset=True)
        )
    except Exception:
        pass

    return api_response(data=profile, message="Profile updated successfully")

# Change Password

@router.post("/change-password", response_model=APIResponse[None])
def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """Change current user's password with password complexity validation and confirmation check."""
    if body.new_password != body.confirm_new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password and confirm new password do not match."
        )

    success = auth_service.change_user_password(
        db, current_user, body.current_password, body.new_password
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid current password"
        )

    try:
        from app.services.audit_service import log_activity
        log_activity(
            db=db,
            user=current_user,
            action="PASSWORD_CHANGE",
            module="User Profile",
            entity_type="User",
            entity_id=current_user.id,
            description=f"User '{current_user.full_name or current_user.username}' updated password"
        )
    except Exception:
        pass

    return api_response(data=None, message="Password updated successfully")
