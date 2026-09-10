from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.user import User
from app.models.role import Role
from app.api.v1.users.schemas import UserCreate, UserUpdate

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    return db.query(User).offset(skip).limit(limit).all()

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    return db.query(User).filter(User.username == username).first()

def get_user_by_employee_id(db: Session, employee_id: str) -> Optional[User]:
    return db.query(User).filter(User.employee_id == employee_id).first()

def create_user(db: Session, user_in: UserCreate) -> User:
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        username=user_in.username,
        employee_id=user_in.employee_id,
        full_name=user_in.full_name,
        profile_picture=user_in.profile_picture,
        hashed_password=hashed_password,
        is_active=user_in.is_active,
    )
    if user_in.role_ids:
        roles = db.query(Role).filter(Role.id.in_(user_in.role_ids)).all()
        db_user.roles = roles

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, db_user: User, user_in: UserUpdate) -> User:
    update_data = user_in.model_dump(exclude_unset=True)
    
    if "password" in update_data:
        password = update_data.pop("password")
        if password:
            db_user.hashed_password = get_password_hash(password)

    if "role_ids" in update_data:
        role_ids = update_data.pop("role_ids")
        if role_ids is not None:
            roles = db.query(Role).filter(Role.id.in_(role_ids)).all()
            db_user.roles = roles

    for field, value in update_data.items():
        setattr(db_user, field, value)

    db.commit()
    db.refresh(db_user)
    return db_user

def assign_roles_to_user(db: Session, db_user: User, role_ids: List[int]) -> User:
    """Batch assign/replace roles for a specific user."""
    roles = db.query(Role).filter(Role.id.in_(role_ids)).all()
    db_user.roles = roles
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, db_user: User) -> None:
    db.delete(db_user)
    db.commit()

def reset_user_password(db: Session, db_user: User, new_password: str) -> User:
    db_user.hashed_password = get_password_hash(new_password)
    db.commit()
    db.refresh(db_user)
    return db_user
