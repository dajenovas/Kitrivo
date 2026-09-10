from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.response import APIResponse, api_response
from app.api.deps import get_db, get_current_active_user
from app.api.v1.products.schemas import (
    ProductCreate, ProductUpdate, ProductResponse, ProductListResponse,
    ProductCategoryCreate, ProductCategoryResponse
)
from app.api.v1.products.services.product_service import ProductService

# Require JWT access token authentication for all product endpoints
router = APIRouter(
    prefix="/products",
    tags=["Products"],
    dependencies=[Depends(get_current_active_user)]
)


# ------------------ CATEGORY ENDPOINTS ------------------
@router.get("/categories", response_model=APIResponse[List[ProductCategoryResponse]])
def list_categories(db: Session = Depends(get_db)):
    """List all product categories (Requires authentication token)."""
    categories = ProductService.get_categories(db)
    return api_response(data=categories, message="Product categories retrieved successfully")


@router.post("/categories", response_model=APIResponse[ProductCategoryResponse], status_code=status.HTTP_201_CREATED)
def create_category(category_in: ProductCategoryCreate, db: Session = Depends(get_db)):
    """Create a new product category (Requires authentication token)."""
    category = ProductService.create_category(db, category_in)
    return api_response(data=category, message="Product category created successfully")


# ------------------ 5 CORE PRODUCT ENDPOINTS ------------------
@router.get("", response_model=APIResponse[ProductListResponse])
def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    q: Optional[str] = Query(None, description="Search query across product name, SKU, HSN, model, description"),
    category_id: Optional[int] = Query(None, description="Filter by Product Category ID"),
    status: Optional[str] = Query(None, description="Filter by status: ACTIVE, INACTIVE, OUTOFSTOCK, DISCONTINUED"),
    db: Session = Depends(get_db)
):
    """
    1. GET /api/v1/products
    List all products with category JOIN, filtering, search, and pagination. Requires Bearer access token.
    """
    items, total = ProductService.get_products(
        db=db,
        skip=skip,
        limit=limit,
        q=q,
        category_id=category_id,
        status_filter=status
    )
    item_responses = [ProductResponse.model_validate(item) for item in items]
    data = {
        "items": item_responses,
        "total": total,
        "skip": skip,
        "limit": limit
    }
    return api_response(data=data, message="Products retrieved successfully")


@router.get("/{product_id}", response_model=APIResponse[ProductResponse])
def get_product_by_id(
    product_id: str,
    db: Session = Depends(get_db)
):
    """
    2. GET /api/v1/products/{product_id}
    Get details of a specific product by Database ID or Business SKU Product ID. Requires Bearer access token.
    """
    product = ProductService.get_product_by_id(db, product_id)
    return api_response(data=product, message="Product details retrieved successfully")


@router.post("", response_model=APIResponse[ProductResponse], status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db)
):
    """
    3. POST /api/v1/products
    Create a new product. Requires Bearer access token. Enforces minimum 3 images.
    """
    product = ProductService.create_product(db, product_in)
    return api_response(data=product, message="Product created successfully")


@router.put("/{product_id}", response_model=APIResponse[ProductResponse])
def update_product(
    product_id: str,
    product_in: ProductUpdate,
    db: Session = Depends(get_db)
):
    """
    4. PUT /api/v1/products/{product_id}
    Update an existing product by Database ID or Business SKU Product ID. Requires Bearer access token.
    """
    db_product = ProductService.get_product_by_id(db, product_id)
    updated_product = ProductService.update_product(db, db_product, product_in)
    return api_response(data=updated_product, message="Product updated successfully")


@router.delete("/{product_id}", response_model=APIResponse[None])
def delete_product(
    product_id: str,
    db: Session = Depends(get_db)
):
    """
    5. DELETE /api/v1/products/{product_id}
    Delete a product by Database ID or Business SKU Product ID. Requires Bearer access token.
    """
    db_product = ProductService.get_product_by_id(db, product_id)
    ProductService.delete_product(db, db_product)
    return api_response(data=None, message="Product deleted successfully")
