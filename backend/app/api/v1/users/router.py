from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.response import APIResponse, api_response
from app.api.deps import get_db, require_permission, get_current_user, get_current_active_user
from app.services.audit_service import log_activity
from app.api.v1.users.schemas import UserCreate, UserUpdate, UserResponse, AssignRolesSchema, ResetPasswordSchema
from app.api.v1.users import service as user_service
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("", response_model=APIResponse[List[UserResponse]], dependencies=[require_permission("USER_READ")])
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all registered users with their assigned roles."""
    users = user_service.get_users(db, skip=skip, limit=limit)
    return api_response(data=users, message="Users list retrieved successfully")

@router.post("", response_model=APIResponse[UserResponse], status_code=status.HTTP_201_CREATED, dependencies=[require_permission("USER_CREATE")])
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db)
):
    """Create a new user and assign roles."""
    if user_service.get_user_by_email(db, user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
    if user_service.get_user_by_username(db, user_in.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this username already exists."
        )
    if user_in.employee_id and user_service.get_user_by_employee_id(db, user_in.employee_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this employee ID already exists."
        )
    user = user_service.create_user(db, user_in)

    try:
        log_activity(
            db=db,
            user=None,
            action="CREATE",
            module="User Management",
            entity_type="User",
            entity_id=user.id,
            description=f"Created user account '{user.email}' ({user.username})",
            changes_diff=user_in.model_dump(exclude={"password"}, exclude_unset=True)
        )
    except Exception:
        pass

    return api_response(data=user, message="User created successfully")

@router.get("/{user_id}", response_model=APIResponse[UserResponse], dependencies=[require_permission("USER_READ")])
def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get details of a specific user."""
    user = user_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return api_response(data=user, message="User details retrieved successfully")

@router.put("/{user_id}", response_model=APIResponse[UserResponse], dependencies=[require_permission("USER_UPDATE")])
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update user information (email, username, password, active status, roles)."""
    user = user_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user_in.email and user_in.email != user.email:
        if user_service.get_user_by_email(db, user_in.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already in use by another user."
            )
            
    if user_in.username and user_in.username != user.username:
        if user_service.get_user_by_username(db, user_in.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username is already in use by another user."
            )

    if user_in.employee_id and user_in.employee_id != user.employee_id:
        if user_service.get_user_by_employee_id(db, user_in.employee_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Employee ID is already in use by another user."
            )

    updated_user = user_service.update_user(db, user, user_in)

    try:
        log_activity(
            db=db,
            user=current_user,
            action="UPDATE",
            module="User Management",
            entity_type="User",
            entity_id=updated_user.id,
            description=f"Updated user account '{updated_user.email}'",
            changes_diff=user_in.model_dump(exclude={"password"}, exclude_unset=True)
        )
    except Exception:
        pass

    return api_response(data=updated_user, message="User updated successfully")

@router.post("/{user_id}/roles", response_model=APIResponse[UserResponse], dependencies=[require_permission("USER_UPDATE")])
def assign_roles_to_user(
    user_id: int,
    body: AssignRolesSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Batch assign/replace roles for a specific user."""
    user = user_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    updated_user = user_service.assign_roles_to_user(db, user, body.role_ids)

    try:
        log_activity(
            db=db,
            user=current_user,
            action="UPDATE",
            module="User Management",
            entity_type="User",
            entity_id=updated_user.id,
            description=f"Assigned roles to user '{updated_user.email}'",
            changes_diff={"role_ids": body.role_ids}
        )
    except Exception:
        pass

    return api_response(data=updated_user, message="Roles assigned to user successfully")

@router.delete("/{user_id}", response_model=APIResponse[None], dependencies=[require_permission("USER_DELETE")])
def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a user. Prevents a user from deleting their own account."""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account."
        )
    user = user_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    target_email = user.email
    user_service.delete_user(db, user)

    try:
        log_activity(
            db=db,
            user=current_user,
            action="DELETE",
            module="User Management",
            entity_type="User",
            entity_id=user_id,
            description=f"Deleted user account '{target_email}' (# {user_id})"
        )
    except Exception:
        pass

    return api_response(data=None, message="User deleted successfully")

@router.post("/{user_id}/reset-password", response_model=APIResponse[UserResponse], dependencies=[require_permission("USER_PASSWORD_RESET")])
def reset_user_password(
    user_id: int,
    body: ResetPasswordSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Reset user password directly without requiring original password (requires USER_PASSWORD_RESET permission)."""
    user = user_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    updated_user = user_service.reset_user_password(db, user, body.new_password)

    try:
        log_activity(
            db=db,
            user=current_user,
            action="PASSWORD_RESET",
            module="User Management",
            entity_type="User",
            entity_id=updated_user.id,
            description=f"Reset password for user '{updated_user.email}'"
        )
    except Exception:
        pass

    return api_response(data=updated_user, message="Password reset successfully")
