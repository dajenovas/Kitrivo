from typing import Optional, List
from sqlalchemy.orm import Session
from app.core.security import verify_password, get_password_hash
from app.models.user import User
from app.models.permission import Permission
from app.models.token_blocklist import TokenBlocklist
from app.api.v1.auth.schemas import UserProfileResponse
from app.api.v1.permissions.service import build_menu_tree

def authenticate_user(db: Session, username_or_email: str, password: str) -> Optional[User]:
    user = db.query(User).filter(
        (User.email == username_or_email) | (User.username == username_or_email) | (User.employee_id == username_or_email)
    ).first()
    
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def change_user_password(db: Session, user: User, current_password: str, new_password: str) -> bool:
    if not verify_password(current_password, user.hashed_password):
        return False
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    return True

def get_user_assigned_permissions(user: User, db: Session) -> List[Permission]:
    """Extracts permissions strictly assigned through the user's assigned roles."""
    permission_map = {}
    if user.roles:
        for role in user.roles:
            for perm in role.permissions:
                permission_map[perm.id] = perm
            
    return list(permission_map.values())

def build_user_profile(user: User, db: Session) -> UserProfileResponse:
    assigned_permissions = get_user_assigned_permissions(user, db)
    perm_codes = [p.code for p in assigned_permissions]
    
    menu_items = [p for p in assigned_permissions if p.is_menu]
    menu_tree = build_menu_tree(menu_items)

    return UserProfileResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        employee_id=user.employee_id,
        full_name=user.full_name,
        profile_picture=user.profile_picture,
        is_active=user.is_active,
        roles=user.roles,
        permission_codes=perm_codes,
        menu_tree=menu_tree
    )

def revoke_token(db: Session, token: str, token_type: str, user_id: Optional[int] = None) -> None:
    """Adds a JWT token to the blocklist so it cannot be used again."""
    existing = db.query(TokenBlocklist).filter(TokenBlocklist.token == token).first()
    if not existing:
        blocklisted = TokenBlocklist(
            token=token,
            token_type=token_type,
            user_id=user_id
        )
        db.add(blocklisted)
        db.commit()

def is_token_revoked(db: Session, token: str) -> bool:
    """Checks if a JWT token has been revoked / logged out."""
    return db.query(TokenBlocklist).filter(TokenBlocklist.token == token).first() is not None
