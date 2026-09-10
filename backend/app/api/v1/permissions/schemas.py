from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class PermissionBase(BaseModel):
    name: str
    code: str
    module: Optional[str] = None
    description: Optional[str] = None
    is_menu: bool = False
    icon: Optional[str] = None
    path: Optional[str] = None
    sort_order: int = 0

class PermissionCreate(PermissionBase):
    pass

class PermissionUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    module: Optional[str] = None
    description: Optional[str] = None
    is_menu: Optional[bool] = None
    icon: Optional[str] = None
    path: Optional[str] = None
    sort_order: Optional[int] = None

class PermissionResponse(PermissionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class GroupedPermissionsResponse(BaseModel):
    module: str
    permissions: List[PermissionResponse]

class MenuItemTreeResponse(BaseModel):
    id: int
    name: str
    code: str
    module: Optional[str] = None
    is_menu: bool
    icon: Optional[str] = None
    path: Optional[str] = None
    sort_order: int = 0

    model_config = ConfigDict(from_attributes=True)
