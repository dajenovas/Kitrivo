from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from fastapi import HTTPException, status
from app.models.product import Product, ProductCategory
from app.api.v1.products.schemas import ProductCreate, ProductUpdate, ProductCategoryCreate, ProductCategoryUpdate


class ProductService:

    # ------------------ CATEGORY SERVICES ------------------
    @staticmethod
    def get_categories(db: Session) -> List[ProductCategory]:
        return db.query(ProductCategory).order_by(ProductCategory.name.asc()).all()

    @staticmethod
    def get_category_by_id(db: Session, category_id: int) -> ProductCategory:
        category = db.query(ProductCategory).filter(ProductCategory.id == category_id).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product category with ID {category_id} not found."
            )
        return category

    @staticmethod
    def create_category(db: Session, category_in: ProductCategoryCreate) -> ProductCategory:
        existing = db.query(ProductCategory).filter(ProductCategory.code == category_in.code).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product category with code '{category_in.code}' already exists."
            )
        category = ProductCategory(**category_in.model_dump())
        db.add(category)
        db.commit()
        db.refresh(category)
        return category

    # ------------------ PRODUCT SERVICES ------------------
    @staticmethod
    def get_products(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        q: Optional[str] = None,
        category_id: Optional[int] = None,
        status_filter: Optional[str] = None
    ) -> Tuple[List[Product], int]:
        # Joined load explicitly performs a JOIN on product_category
        query = db.query(Product).options(joinedload(Product.category))

        if category_id:
            query = query.filter(Product.category_id == category_id)

        if status_filter:
            query = query.filter(Product.status == status_filter)

        if q:
            search_pattern = f"%{q}%"
            query = query.filter(
                or_(
                    Product.product_name.ilike(search_pattern),
                    Product.product_id.ilike(search_pattern),
                    Product.hsn_code.ilike(search_pattern),
                    Product.model_number.ilike(search_pattern),
                    Product.description.ilike(search_pattern)
                )
            )

        total = query.count()
        items = query.order_by(Product.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    @staticmethod
    def get_product_by_id(db: Session, product_identifier: str) -> Product:
        # Join product_category
        query = db.query(Product).options(joinedload(Product.category))
        
        # Check if identifier is numeric database ID or string business SKU product_id
        if product_identifier.isdigit():
            product = query.filter(Product.id == int(product_identifier)).first()
        else:
            product = query.filter(Product.product_id == product_identifier).first()

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product '{product_identifier}' not found."
            )
        return product

    @staticmethod
    def create_product(db: Session, product_in: ProductCreate) -> Product:
        # 1. Verify category exists
        ProductService.get_category_by_id(db, product_in.category_id)

        # 2. Check product_id uniqueness
        existing = db.query(Product).filter(Product.product_id == product_in.product_id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with Product ID / SKU '{product_in.product_id}' already exists."
            )

        data = product_in.model_dump()
        # Convert nested pydantic models to dicts for JSON columns
        if data.get("catalog_document"):
            data["catalog_document"] = product_in.catalog_document.model_dump() if product_in.catalog_document else None
        if data.get("warranty_service"):
            data["warranty_service"] = product_in.warranty_service.model_dump() if product_in.warranty_service else None
        if data.get("dimensions"):
            data["dimensions"] = product_in.dimensions.model_dump()

        product = Product(**data)
        db.add(product)
        db.commit()
        db.refresh(product)
        return ProductService.get_product_by_id(db, str(product.id))

    @staticmethod
    def update_product(db: Session, db_product: Product, product_in: ProductUpdate) -> Product:
        update_data = product_in.model_dump(exclude_unset=True)

        if "category_id" in update_data and update_data["category_id"] is not None:
            ProductService.get_category_by_id(db, update_data["category_id"])

        if "product_id" in update_data and update_data["product_id"] != db_product.product_id:
            existing = db.query(Product).filter(Product.product_id == update_data["product_id"]).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product with Product ID / SKU '{update_data['product_id']}' already exists."
                )

        # Handle nested pydantic serialization for JSON columns
        if "catalog_document" in update_data:
            update_data["catalog_document"] = product_in.catalog_document.model_dump() if product_in.catalog_document else None
        if "warranty_service" in update_data:
            update_data["warranty_service"] = product_in.warranty_service.model_dump() if product_in.warranty_service else None
        if "dimensions" in update_data:
            update_data["dimensions"] = product_in.dimensions.model_dump() if product_in.dimensions else None

        for field, value in update_data.items():
            setattr(db_product, field, value)

        db.commit()
        db.refresh(db_product)
        return ProductService.get_product_by_id(db, str(db_product.id))

    @staticmethod
    def delete_product(db: Session, db_product: Product) -> None:
        db.delete(db_product)
        db.commit()
