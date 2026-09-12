from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.response import APIResponse, api_response
from app.api.deps import get_db, get_current_active_user
from app.models import Product
from app.api.v1.products.schemas import ProductResponse, ProductListResponse

router = APIRouter(
    prefix="/resources",
    tags=["Digital Resources"],
    dependencies=[Depends(get_current_active_user)]
)


@router.get("/lab-manuals", response_model=APIResponse[ProductListResponse])
def list_lab_manuals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    q: Optional[str] = Query(None, description="Search by manual title, product name, model number, SKU"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    has_manual: bool = Query(True, description="Filter products that have lab manual attached"),
    db: Session = Depends(get_db)
):
    """
    GET /api/v1/resources/lab-manuals
    Retrieve lab manuals catalog with searching and filtering.
    """
    query = db.query(Product)

    if category_id:
        query = query.filter(Product.category_id == category_id)

    if q:
        search = f"%{q}%"
        query = query.filter(
            or_(
                Product.product_name.ilike(search),
                Product.product_id.ilike(search),
                Product.model_number.ilike(search),
                Product.description.ilike(search),
            )
        )

    all_products = query.all()

    # Filter in Python for JSON column lab_manual presence or search
    filtered_items = []
    for p in all_products:
        manual = p.lab_manual
        if has_manual and not (manual and isinstance(manual, dict) and manual.get("url")):
            continue
        if q and manual and isinstance(manual, dict):
            title = manual.get("title", "")
            if title and q.lower() not in title.lower() and not (
                q.lower() in p.product_name.lower() or
                q.lower() in p.product_id.lower() or
                (p.model_number and q.lower() in p.model_number.lower())
            ):
                continue
        filtered_items.append(p)

    total = len(filtered_items)
    paginated_items = filtered_items[skip : skip + limit]
    item_responses = [ProductResponse.model_validate(item) for item in paginated_items]

    data = {
        "items": item_responses,
        "total": total,
        "skip": skip,
        "limit": limit
    }
    return api_response(data=data, message="Lab manuals retrieved successfully")


@router.get("/demo-videos", response_model=APIResponse[ProductListResponse])
def list_demo_videos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    q: Optional[str] = Query(None, description="Search by video title, product name, model number, SKU"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    has_video: bool = Query(True, description="Filter products that have demo video attached"),
    db: Session = Depends(get_db)
):
    """
    GET /api/v1/resources/demo-videos
    Retrieve equipment demo videos catalog with searching and filtering.
    """
    query = db.query(Product)

    if category_id:
        query = query.filter(Product.category_id == category_id)

    if q:
        search = f"%{q}%"
        query = query.filter(
            or_(
                Product.product_name.ilike(search),
                Product.product_id.ilike(search),
                Product.model_number.ilike(search),
                Product.description.ilike(search),
            )
        )

    all_products = query.all()

    filtered_items = []
    for p in all_products:
        video = p.demo_video
        if has_video and not (video and isinstance(video, dict) and video.get("url")):
            continue
        if q and video and isinstance(video, dict):
            title = video.get("title", "")
            if title and q.lower() not in title.lower() and not (
                q.lower() in p.product_name.lower() or
                q.lower() in p.product_id.lower() or
                (p.model_number and q.lower() in p.model_number.lower())
            ):
                continue
        filtered_items.append(p)

    total = len(filtered_items)
    paginated_items = filtered_items[skip : skip + limit]
    item_responses = [ProductResponse.model_validate(item) for item in paginated_items]

    data = {
        "items": item_responses,
        "total": total,
        "skip": skip,
        "limit": limit
    }
    return api_response(data=data, message="Demo videos retrieved successfully")
