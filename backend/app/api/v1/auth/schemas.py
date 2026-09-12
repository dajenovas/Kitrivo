from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict, field_validator, model_validator
from app.api.v1.roles.schemas import RoleResponse
from app.api.v1.permissions.schemas import MenuItemTreeResponse
from app.core.security import validate_password_complexity

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    type: Optional[str] = None

class LoginRequest(BaseModel):
    username_or_email: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class LogoutRequest(BaseModel):
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        return validate_password_complexity(v)

    @model_validator(mode="after")
    def validate_passwords_match(self):
        if self.new_password != self.confirm_new_password:
            raise ValueError("New password and confirm new password do not match.")
        return self

class UserProfileResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    employee_id: Optional[str] = None
    full_name: Optional[str] = None
    profile_picture: Optional[str] = None
    is_active: bool
    roles: List[RoleResponse] = []
    permission_codes: List[str] = []
    menu_tree: List[MenuItemTreeResponse] = []

    model_config = ConfigDict(from_attributes=True)

class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    profile_picture: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 3600
    user: Optional[UserProfileResponse] = None
