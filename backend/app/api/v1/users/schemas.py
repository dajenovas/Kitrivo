from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from app.api.v1.roles.schemas import RoleResponse
from app.core.security import validate_password_complexity

class UserBase(BaseModel):
    email: EmailStr
    username: str
    employee_id: Optional[str] = None
    full_name: Optional[str] = None
    profile_picture: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str
    role_ids: Optional[List[int]] = []

    @field_validator("password")
    @classmethod
    def validate_user_password(cls, v: str) -> str:
        return validate_password_complexity(v)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    employee_id: Optional[str] = None
    full_name: Optional[str] = None
    profile_picture: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    role_ids: Optional[List[int]] = None

    @field_validator("password")
    @classmethod
    def validate_optional_password(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v != "":
            return validate_password_complexity(v)
        return v

class UserResponse(UserBase):
    id: int
    roles: List[RoleResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AssignRolesSchema(BaseModel):
    role_ids: List[int]

class ResetPasswordSchema(BaseModel):
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        return validate_password_complexity(v)
