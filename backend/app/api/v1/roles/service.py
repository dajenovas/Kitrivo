from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.role import Role
from app.models.permission import Permission
from app.api.v1.roles.schemas import RoleCreate, RoleUpdate

def get_roles(db: Session, skip: int = 0, limit: int = 100) -> List[Role]:
    return db.query(Role).offset(skip).limit(limit).all()

def get_role_by_id(db: Session, role_id: int) -> Optional[Role]:
    return db.query(Role).filter(Role.id == role_id).first()

def get_role_by_code(db: Session, code: str) -> Optional[Role]:
    return db.query(Role).filter(Role.code == code).first()

def create_role(db: Session, role_in: RoleCreate) -> Role:
    db_role = Role(
        name=role_in.name,
        code=role_in.code,
        description=role_in.description,
    )
    if role_in.permission_ids:
        permissions = db.query(Permission).filter(Permission.id.in_(role_in.permission_ids)).all()
        db_role.permissions = permissions

    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

def update_role(db: Session, db_role: Role, role_in: RoleUpdate) -> Role:
    update_data = role_in.model_dump(exclude_unset=True)
    
    if "permission_ids" in update_data:
        perm_ids = update_data.pop("permission_ids")
        if perm_ids is not None:
            permissions = db.query(Permission).filter(Permission.id.in_(perm_ids)).all()
            db_role.permissions = permissions
            
    for field, value in update_data.items():
        setattr(db_role, field, value)
        
    db.commit()
    db.refresh(db_role)
    return db_role

def delete_role(db: Session, db_role: Role) -> None:
    db.delete(db_role)
    db.commit()

def assign_permissions_to_role(db: Session, db_role: Role, permission_ids: List[int]) -> Role:
    permissions = db.query(Permission).filter(Permission.id.in_(permission_ids)).all()
    db_role.permissions = permissions
    db.commit()
    db.refresh(db_role)
    return db_role
