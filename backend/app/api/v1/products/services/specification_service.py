from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.product import SpecificationDefinition
from app.api.v1.products.schemas import SpecDefinitionCreate, SpecDefinitionUpdate


def get_spec_definitions(
    db: Session, category_id: Optional[int] = None, skip: int = 0, limit: int = 100
) -> List[SpecificationDefinition]:
    query = db.query(SpecificationDefinition)
    if category_id is not None:
        query = query.filter(
            (SpecificationDefinition.category_id == category_id) | (SpecificationDefinition.category_id.is_(None))
        )
    return query.order_by(SpecificationDefinition.sort_order.asc(), SpecificationDefinition.id.asc()).offset(skip).limit(limit).all()


def get_spec_definition_by_id(db: Session, spec_def_id: int) -> Optional[SpecificationDefinition]:
    return db.query(SpecificationDefinition).filter(SpecificationDefinition.id == spec_def_id).first()


def get_spec_definition_by_code(db: Session, code: str) -> Optional[SpecificationDefinition]:
    return db.query(SpecificationDefinition).filter(SpecificationDefinition.code == code).first()


def create_spec_definition(db: Session, spec_in: SpecDefinitionCreate) -> SpecificationDefinition:
    db_spec = SpecificationDefinition(**spec_in.model_dump())
    db.add(db_spec)
    db.commit()
    db.refresh(db_spec)
    return db_spec


def update_spec_definition(db: Session, db_spec: SpecificationDefinition, spec_in: SpecDefinitionUpdate) -> SpecificationDefinition:
    update_data = spec_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_spec, field, value)
    db.commit()
    db.refresh(db_spec)
    return db_spec


def delete_spec_definition(db: Session, db_spec: SpecificationDefinition) -> None:
    db.delete(db_spec)
    db.commit()
