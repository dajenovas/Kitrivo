from typing import List, Optional
from pydantic import BaseModel

class StatCard(BaseModel):
    id: str
    title: str
    value: str
    numeric_value: float
    change_percentage: str
    change_type: str  # 'up', 'down', 'neutral'
    subtitle: str
    icon_type: str  # 'revenue', 'quotation', 'invoice', 'product'

class ChartPoint(BaseModel):
    month: str
    revenue: float
    quotations: int
    bills: int

class RankingItem(BaseModel):
    rank: int
    id: str
    title: str
    category: str
    quantity_sold: int
    total_revenue: float
    percentage: float
    image: Optional[str] = None

class RecentTransaction(BaseModel):
    id: int
    ref_number: str
    type: str  # 'INVOICE' | 'QUOTATION'
    customer_name: str
    institution_name: Optional[str] = None
    date: str
    amount: float
    status: str

class DashboardResponse(BaseModel):
    stats: List[StatCard]
    chart_data: List[ChartPoint]
    ranking_list: List[RankingItem]
    recent_transactions: List[RecentTransaction]
