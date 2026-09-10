from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.product import HSNMaster
from app.api.v1.products.schemas import HSNCreate, HSNUpdate


def get_hsns(db: Session, skip: int = 0, limit: int = 100, status: Optional[str] = None) -> List[HSNMaster]:
    query = db.query(HSNMaster)
    if status:
        query = query.filter(HSNMaster.status == status)
    return query.order_by(HSNMaster.id.asc()).offset(skip).limit(limit).all()


def get_hsn_by_id(db: Session, hsn_id: int) -> Optional[HSNMaster]:
    return db.query(HSNMaster).filter(HSNMaster.id == hsn_id).first()


def get_hsn_by_code(db: Session, hsn_code: str) -> Optional[HSNMaster]:
    return db.query(HSNMaster).filter(HSNMaster.hsn_code == hsn_code).first()


def create_hsn(db: Session, hsn_in: HSNCreate) -> HSNMaster:
    db_hsn = HSNMaster(**hsn_in.model_dump())
    db.add(db_hsn)
    db.commit()
    db.refresh(db_hsn)
    return db_hsn


def update_hsn(db: Session, db_hsn: HSNMaster, hsn_in: HSNUpdate) -> HSNMaster:
    update_data = hsn_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_hsn, field, value)
    db.commit()
    db.refresh(db_hsn)
    return db_hsn


def delete_hsn(db: Session, db_hsn: HSNMaster) -> None:
    db.delete(db_hsn)
    db.commit()
