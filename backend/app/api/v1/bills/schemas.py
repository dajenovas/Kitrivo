from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class BillItemSchema(BaseModel):
    product_id: Optional[int] = None
    product_name: str
    quantity: int = Field(gt=0)
    unit_price: float = Field(ge=0.0)
    total: float = Field(ge=0.0)

class BillCreateRequest(BaseModel):
    quote_id: Optional[str] = None
    customer_name: str
    institution_name: Optional[str] = None
    email: str
    phone: Optional[str] = None
    billing_address: Optional[str] = None
    items: List[BillItemSchema]
    subtotal: float
    tax_amount: float = 0.0
    discount_amount: float = 0.0
    total_amount: float
    payment_method: str = "DIRECT"
    payment_id: Optional[str] = None

class BillResponse(BaseModel):
    id: int
    bill_number: str
    quote_id: Optional[str] = None
    user_id: Optional[int] = None
    customer_name: str
    institution_name: Optional[str] = None
    email: str
    phone: Optional[str] = None
    billing_address: Optional[str] = None
    items: List[BillItemSchema]
    subtotal: float
    tax_amount: float
    discount_amount: float
    total_amount: float
    payment_method: str
    payment_id: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
