from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from app.api.v1.products.schemas import ProductResponse

class StockAdjustmentRequest(BaseModel):
    product_id: int = Field(..., description="Database ID of the product")
    quantity_change: int = Field(..., description="Quantity to add (positive) or deduct (negative), or set exact if is_absolute=True")
    is_absolute: bool = Field(False, description="If True, sets exact stock_quantity. If False, adds/subtracts quantity_change.")
    notes: Optional[str] = Field(None, description="Optional adjustment note or reason")

class StockOverviewItem(BaseModel):
    product_id: int
    sku: str
    product_name: str
    category_name: Optional[str] = None
    price: float
    stock_quantity: int
    status: str
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class StockSummaryResponse(BaseModel):
    total_products: int
    total_stock_units: int
    out_of_stock_count: int
    low_stock_count: int
    items: List[StockOverviewItem]

class StockTransactionResponse(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    change_amount: int
    previous_quantity: int
    new_quantity: int
    transaction_type: str
    reference_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
