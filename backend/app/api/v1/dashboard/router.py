from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.response import APIResponse, api_response
from app.api.deps import get_db, get_current_active_user
from app.api.v1.dashboard.schemas import DashboardResponse
from app.api.v1.dashboard.services import get_dashboard_analytics

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard & Analytics"],
    dependencies=[Depends(get_current_active_user)]
)

@router.get("/stats", response_model=APIResponse[DashboardResponse])
def get_dashboard_stats(
    db: Session = Depends(get_db)
):
    """
    Retrieve aggregated dashboard statistics including:
    - 4 main stats cards (Revenue, Quotations, Invoices, Catalog Stock)
    - Monthly performance trend chart data
    - Top performing product rankings
    - Recent activities and transaction history table
    """
    data = get_dashboard_analytics(db)
    return api_response(data=data, message="Dashboard statistics retrieved successfully")
