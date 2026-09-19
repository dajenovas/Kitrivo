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

class PaymentCreateRequest(BaseModel):
    amount: float = Field(..., gt=0)
    payment_method: str = Field("CASH", description="CASH, UPI, BANK_TRANSFER, CHEQUE, CREDIT_CARD, DIRECT")
    transaction_reference: Optional[str] = None
    notes: Optional[str] = None

class PaymentRecordResponse(BaseModel):
    id: int
    bill_id: int
    amount: float
    payment_method: str
    transaction_reference: Optional[str] = None
    payment_date: datetime
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class BillResponse(BaseModel):
    id: int
    bill_number: str
    quote_id: Optional[str] = None
    user_id: Optional[int] = None
    customer_id: Optional[int] = None
    customer_name: str
    institution_name: Optional[str] = None
    email: str
    phone: Optional[str] = None
    billing_address: Optional[str] = None
    items: List[BillItemSchema]
    subtotal: float
    tax_amount: float
    cgst_amount: float = 0.0
    sgst_amount: float = 0.0
    igst_amount: float = 0.0
    is_interstate: str = "INTRA"
    discount_amount: float
    total_amount: float
    amount_paid: float = 0.0
    balance_due: float = 0.0
    payment_method: str
    payment_id: Optional[str] = None
    status: str
    payment_status: str = "PAID"
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
