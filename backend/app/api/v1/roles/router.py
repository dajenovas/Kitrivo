from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.response import APIResponse, api_response
from app.api.deps import get_db, require_permission, get_current_active_user
from app.services.audit_service import log_activity
from app.models.user import User
from app.api.v1.roles.schemas import (
    RoleCreate, RoleUpdate, RoleResponse, AssignPermissionsSchema
)
from app.api.v1.roles import service as role_service

router = APIRouter(prefix="/roles", tags=["Roles"])

@router.get("", response_model=APIResponse[List[RoleResponse]], dependencies=[require_permission("ROLE_READ")])
def list_roles(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all user roles along with their assigned permissions."""
    roles = role_service.get_roles(db, skip=skip, limit=limit)
    return api_response(data=roles, message="Roles list retrieved successfully")

@router.post("", response_model=APIResponse[RoleResponse], status_code=status.HTTP_201_CREATED, dependencies=[require_permission("ROLE_CREATE")])
def create_role(
    role_in: RoleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new role with optional permission assignments."""
    existing = role_service.get_role_by_code(db, role_in.code)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role with code '{role_in.code}' already exists."
        )
    role = role_service.create_role(db, role_in)

    try:
        log_activity(
            db=db,
            user=current_user,
            action="CREATE",
            module="Role Management",
            entity_type="Role",
            entity_id=role.id,
            description=f"Created role '{role.name}' ({role.code})",
            changes_diff=role_in.model_dump(exclude_unset=True)
        )
    except Exception:
        pass

    return api_response(data=role, message="Role created successfully")

@router.get("/{role_id}", response_model=APIResponse[RoleResponse], dependencies=[require_permission("ROLE_READ")])
def get_role(
    role_id: int,
    db: Session = Depends(get_db)
):
    """Get specific role details by ID."""
    role = role_service.get_role_by_id(db, role_id)
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    return api_response(data=role, message="Role details retrieved successfully")

@router.put("/{role_id}", response_model=APIResponse[RoleResponse], dependencies=[require_permission("ROLE_UPDATE")])
def update_role(
    role_id: int,
    role_in: RoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update role details and permissions."""
    role = role_service.get_role_by_id(db, role_id)
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    
    if role_in.code and role_in.code != role.code:
        existing = role_service.get_role_by_code(db, role_in.code)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Role code '{role_in.code}' already exists."
            )
            
    updated_role = role_service.update_role(db, role, role_in)

    try:
        log_activity(
            db=db,
            user=current_user,
            action="UPDATE",
            module="Role Management",
            entity_type="Role",
            entity_id=updated_role.id,
            description=f"Updated role '{updated_role.name}' ({updated_role.code})",
            changes_diff=role_in.model_dump(exclude_unset=True)
        )
    except Exception:
        pass

    return api_response(data=updated_role, message="Role updated successfully")

@router.delete("/{role_id}", response_model=APIResponse[None], dependencies=[require_permission("ROLE_DELETE")])
def delete_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a role."""
    role = role_service.get_role_by_id(db, role_id)
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    role_name = role.name
    role_service.delete_role(db, role)

    try:
        log_activity(
            db=db,
            user=current_user,
            action="DELETE",
            module="Role Management",
            entity_type="Role",
            entity_id=role_id,
            description=f"Deleted role '{role_name}' (# {role_id})"
        )
    except Exception:
        pass

    return api_response(data=None, message="Role deleted successfully")

@router.post("/{role_id}/permissions", response_model=APIResponse[RoleResponse], dependencies=[require_permission("ROLE_UPDATE")])
def assign_permissions_to_role(
    role_id: int,
    body: AssignPermissionsSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Batch assign/replace permissions for a role."""
    role = role_service.get_role_by_id(db, role_id)
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    updated_role = role_service.assign_permissions_to_role(db, role, body.permission_ids)

    try:
        log_activity(
            db=db,
            user=current_user,
            action="UPDATE",
            module="Role Management",
            entity_type="Role",
            entity_id=updated_role.id,
            description=f"Updated permissions for role '{updated_role.name}'",
            changes_diff={"permission_ids": body.permission_ids}
        )
    except Exception:
        pass

    return api_response(data=updated_role, message="Permissions assigned to role successfully")
