from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.product import Category
from app.api.v1.products.schemas import CategoryCreate, CategoryUpdate


def get_categories(db: Session, skip: int = 0, limit: int = 100, status: Optional[str] = None) -> List[Category]:
    query = db.query(Category)
    if status:
        query = query.filter(Category.status == status)
    return query.order_by(Category.sort_order.asc(), Category.id.asc()).offset(skip).limit(limit).all()


def get_category_tree(db: Session) -> List[Category]:
    """Returns top-level categories (parent_id is None) with pre-loaded children."""
    return db.query(Category).filter(Category.parent_id.is_(None)).order_by(Category.sort_order.asc(), Category.id.asc()).all()


def get_category_by_id(db: Session, category_id: int) -> Optional[Category]:
    return db.query(Category).filter(Category.id == category_id).first()


def get_category_by_code(db: Session, code: str) -> Optional[Category]:
    return db.query(Category).filter(Category.code == code).first()


def create_category(db: Session, category_in: CategoryCreate) -> Category:
    db_category = Category(**category_in.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def update_category(db: Session, db_category: Category, category_in: CategoryUpdate) -> Category:
    update_data = category_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_category, field, value)
    db.commit()
    db.refresh(db_category)
    return db_category


def delete_category(db: Session, db_category: Category) -> None:
    db.delete(db_category)
    db.commit()
