from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.product import Catalog, CatalogProduct, Product
from app.api.v1.products.schemas import CatalogCreate, CatalogUpdate, CatalogProductCreate, CatalogProductUpdate


def get_catalogs(db: Session, skip: int = 0, limit: int = 100, status: Optional[str] = None) -> List[Catalog]:
    query = db.query(Catalog)
    if status:
        query = query.filter(Catalog.status == status)
    return query.order_by(Catalog.id.desc()).offset(skip).limit(limit).all()


def get_catalog_by_id(db: Session, catalog_id: int) -> Optional[Catalog]:
    return db.query(Catalog).filter(Catalog.id == catalog_id).first()


def get_catalog_by_code(db: Session, code: str) -> Optional[Catalog]:
    return db.query(Catalog).filter(Catalog.code == code).first()


def create_catalog(db: Session, catalog_in: CatalogCreate) -> Catalog:
    db_catalog = Catalog(**catalog_in.model_dump())
    db.add(db_catalog)
    db.commit()
    db.refresh(db_catalog)
    return db_catalog


def update_catalog(db: Session, db_catalog: Catalog, catalog_in: CatalogUpdate) -> Catalog:
    update_data = catalog_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_catalog, field, value)
    db.commit()
    db.refresh(db_catalog)
    return db_catalog


def delete_catalog(db: Session, db_catalog: Catalog) -> None:
    db.delete(db_catalog)
    db.commit()


def add_product_to_catalog(db: Session, catalog_id: int, cp_in: CatalogProductCreate) -> CatalogProduct:
    # Check if catalog exists
    catalog = get_catalog_by_id(db, catalog_id)
    if not catalog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Catalog not found")
    
    # Check if product exists
    product = db.query(Product).filter(Product.id == cp_in.product_id, Product.is_deleted.is_(False)).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    # Check for duplicate association
    existing = db.query(CatalogProduct).filter(
        CatalogProduct.catalog_id == catalog_id,
        CatalogProduct.product_id == cp_in.product_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product is already associated with this catalog"
        )

    db_cp = CatalogProduct(
        catalog_id=catalog_id,
        product_id=cp_in.product_id,
        catalog_section=cp_in.catalog_section,
        display_name=cp_in.display_name,
        display_description=cp_in.display_description,
        display_price=cp_in.display_price,
        show_price=cp_in.show_price,
        show_hsn=cp_in.show_hsn,
        show_specifications=cp_in.show_specifications,
        show_image=cp_in.show_image,
        sort_order=cp_in.sort_order,
    )
    db.add(db_cp)
    db.commit()
    db.refresh(db_cp)
    return db_cp


def get_catalog_products(db: Session, catalog_id: int) -> List[CatalogProduct]:
    return db.query(CatalogProduct).filter(CatalogProduct.catalog_id == catalog_id).order_by(CatalogProduct.sort_order.asc()).all()


def remove_product_from_catalog(db: Session, catalog_id: int, product_id: int) -> None:
    cp = db.query(CatalogProduct).filter(
        CatalogProduct.catalog_id == catalog_id,
        CatalogProduct.product_id == product_id
    ).first()
    if not cp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Catalog product association not found")
    db.delete(cp)
    db.commit()
