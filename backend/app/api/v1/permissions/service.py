from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from app.models.permission import Permission
from app.api.v1.permissions.schemas import PermissionCreate, PermissionUpdate, MenuItemTreeResponse, GroupedPermissionsResponse

def get_permissions(db: Session, skip: int = 0, limit: int = 100, is_menu: Optional[bool] = None, module: Optional[str] = None) -> List[Permission]:
    query = db.query(Permission)
    if is_menu is not None:
        query = query.filter(Permission.is_menu == is_menu)
    if module:
        query = query.filter(Permission.module.ilike(f"%{module}%"))
    return query.order_by(Permission.sort_order.asc(), Permission.id.asc()).offset(skip).limit(limit).all()

def get_permission_by_id(db: Session, permission_id: int) -> Optional[Permission]:
    return db.query(Permission).filter(Permission.id == permission_id).first()

def get_permission_by_code(db: Session, code: str) -> Optional[Permission]:
    return db.query(Permission).filter(Permission.code == code).first()

def create_permission(db: Session, permission_in: PermissionCreate) -> Permission:
    db_permission = Permission(
        name=permission_in.name,
        code=permission_in.code,
        module=permission_in.module,
        description=permission_in.description,
        is_menu=permission_in.is_menu,
        icon=permission_in.icon,
        path=permission_in.path,
        sort_order=permission_in.sort_order,
    )
    db.add(db_permission)
    db.commit()
    db.refresh(db_permission)
    return db_permission

def get_permissions_grouped_by_module(db: Session) -> List[GroupedPermissionsResponse]:
    permissions = db.query(Permission).order_by(Permission.module.asc(), Permission.sort_order.asc(), Permission.id.asc()).all()
    grouped: Dict[str, List[Permission]] = {}
    for p in permissions:
        mod_name = p.module or "General"
        if mod_name not in grouped:
            grouped[mod_name] = []
        grouped[mod_name].append(p)
    return [GroupedPermissionsResponse(module=mod, permissions=perms) for mod, perms in grouped.items()]

def update_permission(db: Session, db_permission: Permission, permission_in: PermissionUpdate) -> Permission:
    update_data = permission_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_permission, field, value)
    db.commit()
    db.refresh(db_permission)
    return db_permission

def delete_permission(db: Session, db_permission: Permission) -> None:
    db.delete(db_permission)
    db.commit()

def build_menu_tree(permissions: List[Permission]) -> List[MenuItemTreeResponse]:
    """Converts a list of permissions (where is_menu is True) into a list of menu items for UI sidebars."""
    menu_items = [p for p in permissions if p.is_menu]
    
    result: List[MenuItemTreeResponse] = [
        MenuItemTreeResponse(
            id=p.id,
            name=p.name,
            code=p.code,
            module=p.module,
            is_menu=p.is_menu,
            icon=p.icon,
            path=p.path,
            sort_order=p.sort_order,
        )
        for p in menu_items
    ]
    
    # Sort menu items by sort_order ascending, then by id
    result.sort(key=lambda x: (x.sort_order, x.id))
    return result
