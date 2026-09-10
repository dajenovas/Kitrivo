from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.api.v1.permissions.schemas import PermissionResponse

class RoleBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None

class RoleCreate(RoleBase):
    permission_ids: Optional[List[int]] = []

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    permission_ids: Optional[List[int]] = None

class RoleResponse(RoleBase):
    id: int
    permissions: List[PermissionResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AssignPermissionsSchema(BaseModel):
    permission_ids: List[int]
