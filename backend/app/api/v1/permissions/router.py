from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.response import APIResponse, api_response
from app.api.deps import get_db, require_permission, get_current_active_user
from app.services.audit_service import log_activity
from app.models.user import User
from app.api.v1.permissions.schemas import (
    PermissionCreate, PermissionUpdate, PermissionResponse, MenuItemTreeResponse, GroupedPermissionsResponse
)
from app.api.v1.permissions import service as permission_service

router = APIRouter(prefix="/permissions", tags=["Permissions"])

@router.get("", response_model=APIResponse[List[PermissionResponse]], dependencies=[require_permission("PERMISSION_READ")])
def list_permissions(
    skip: int = 0,
    limit: int = 100,
    is_menu: Optional[bool] = None,
    module: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all permissions with optional filtering for menu items and module."""
    perms = permission_service.get_permissions(db, skip=skip, limit=limit, is_menu=is_menu, module=module)
    return api_response(data=perms, message="Permissions retrieved successfully")

@router.get("/grouped", response_model=APIResponse[List[GroupedPermissionsResponse]], dependencies=[require_permission("PERMISSION_READ")])
def get_grouped_permissions(db: Session = Depends(get_db)):
    """Get all permissions grouped by their assigned module."""
    grouped = permission_service.get_permissions_grouped_by_module(db)
    return api_response(data=grouped, message="Permissions grouped by module retrieved successfully")

@router.get("/menu-tree", response_model=APIResponse[List[MenuItemTreeResponse]], dependencies=[require_permission("PERMISSION_READ")])
def get_menu_tree(db: Session = Depends(get_db)):
    """Get nested menu item tree for UI sidebar navigation based on registered menu permissions."""
    all_menu_permissions = permission_service.get_permissions(db, limit=1000, is_menu=True)
    tree = permission_service.build_menu_tree(all_menu_permissions)
    return api_response(data=tree, message="Sidebar menu tree retrieved successfully")

@router.post("", response_model=APIResponse[PermissionResponse], status_code=status.HTTP_201_CREATED, dependencies=[require_permission("PERMISSION_CREATE")])
def create_permission(
    permission_in: PermissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new permission (supports is_menu, icon, code, path, module, sort_order)."""
    existing = permission_service.get_permission_by_code(db, permission_in.code)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Permission with code '{permission_in.code}' already exists."
        )
    perm = permission_service.create_permission(db, permission_in)

    try:
        log_activity(
            db=db,
            user=current_user,
            action="CREATE",
            module="Permission Management",
            entity_type="Permission",
            entity_id=perm.id,
            description=f"Created permission '{perm.name}' ({perm.code})",
            changes_diff=permission_in.model_dump(exclude_unset=True)
        )
    except Exception:
        pass

    return api_response(data=perm, message="Permission created successfully")

@router.get("/{permission_id}", response_model=APIResponse[PermissionResponse], dependencies=[require_permission("PERMISSION_READ")])
def get_permission(
    permission_id: int,
    db: Session = Depends(get_db)
):
    """Get details of a specific permission by ID."""
    permission = permission_service.get_permission_by_id(db, permission_id)
    if not permission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Permission not found")
    return api_response(data=permission, message="Permission details retrieved successfully")

@router.put("/{permission_id}", response_model=APIResponse[PermissionResponse], dependencies=[require_permission("PERMISSION_UPDATE")])
def update_permission(
    permission_id: int,
    permission_in: PermissionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update permission details."""
    permission = permission_service.get_permission_by_id(db, permission_id)
    if not permission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Permission not found")
    
    if permission_in.code and permission_in.code != permission.code:
        existing = permission_service.get_permission_by_code(db, permission_in.code)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Permission code '{permission_in.code}' is already in use."
            )
            
    updated_perm = permission_service.update_permission(db, permission, permission_in)

    try:
        log_activity(
            db=db,
            user=current_user,
            action="UPDATE",
            module="Permission Management",
            entity_type="Permission",
            entity_id=updated_perm.id,
            description=f"Updated permission '{updated_perm.name}' ({updated_perm.code})",
            changes_diff=permission_in.model_dump(exclude_unset=True)
        )
    except Exception:
        pass

    return api_response(data=updated_perm, message="Permission updated successfully")

@router.delete("/{permission_id}", response_model=APIResponse[None], dependencies=[require_permission("PERMISSION_DELETE")])
def delete_permission(
    permission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a permission."""
    permission = permission_service.get_permission_by_id(db, permission_id)
    if not permission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Permission not found")
    perm_code = permission.code
    permission_service.delete_permission(db, permission)

    try:
        log_activity(
            db=db,
            user=current_user,
            action="DELETE",
            module="Permission Management",
            entity_type="Permission",
            entity_id=permission_id,
            description=f"Deleted permission '{perm_code}' (# {permission_id})"
        )
    except Exception:
        pass

    return api_response(data=None, message="Permission deleted successfully")
