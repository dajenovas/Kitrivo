from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.response import APIResponse, api_response
from app.api.deps import get_db, get_current_active_user
from app.api.v1.stock.schemas import StockSummaryResponse, StockAdjustmentRequest, StockOverviewItem, StockTransactionResponse
from app.api.v1.stock.services.stock_service import StockService

router = APIRouter(
    prefix="/stock",
    tags=["Stock Management"],
    dependencies=[Depends(get_current_active_user)]
)

@router.get("", response_model=APIResponse[StockSummaryResponse])
def get_stock_summary(
    q: Optional[str] = Query(None, description="Search by product name or SKU"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    status: Optional[str] = Query(None, description="Filter by status e.g. ACTIVE, OUT_OF_STOCK"),
    db: Session = Depends(get_db)
):
    """Retrieve stock management dashboard summary and product stock list."""
    summary = StockService.get_stock_overview(
        db=db,
        q=q,
        category_id=category_id,
        status_filter=status
    )
    return api_response(data=summary, message="Stock summary retrieved successfully")

@router.post("/adjust", response_model=APIResponse[StockOverviewItem])
def adjust_stock(
    request: StockAdjustmentRequest,
    db: Session = Depends(get_db)
):
    """Adjust product stock quantity. Automatically transitions status to OUT_OF_STOCK (if 0) or ACTIVE (if >0)."""
    item = StockService.adjust_stock(db, request)
    return api_response(data=item, message="Stock adjusted successfully")

@router.get("/transactions", response_model=APIResponse[List[StockTransactionResponse]])
def get_stock_transactions(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Retrieve audit log history of recent stock adjustments and order deductions."""
    txs = StockService.get_transactions(db, limit)
    return api_response(data=txs, message="Stock audit transactions retrieved successfully")
