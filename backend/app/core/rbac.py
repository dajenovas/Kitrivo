from typing import Set
from app.models.user import User

def get_user_permission_codes(user: User) -> Set[str]:
    """Extract all permission codes assigned to a user through their assigned roles."""
    permission_codes: Set[str] = set()
    if not user or not user.roles:
        return permission_codes
    
    for role in user.roles:
        for perm in role.permissions:
            permission_codes.add(perm.code)
    
    return permission_codes
