from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field, ConfigDict

class QuoteItemSchema(BaseModel):
    product_id: str
    product_name: str
    model_number: Optional[str] = None
    price: float = Field(..., ge=0)
    quantity: int = Field(1, ge=1)
    total: float = Field(..., ge=0)

class QuotationCreateRequest(BaseModel):
    items: List[QuoteItemSchema]
    institution_name: Optional[str] = None
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    billing_address: Optional[str] = None
    notes: Optional[str] = None
    subtotal: Optional[float] = None
    tax_amount: Optional[float] = None
    discount_amount: Optional[float] = 0.0
    total_amount: Optional[float] = None
    valid_until: Optional[datetime] = None  # Optional explicit validity date override

class QuotationUpdateRequest(BaseModel):
    items: Optional[List[QuoteItemSchema]] = None
    institution_name: Optional[str] = None
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    billing_address: Optional[str] = None
    notes: Optional[str] = None
    subtotal: Optional[float] = None
    tax_amount: Optional[float] = None
    discount_amount: Optional[float] = None
    total_amount: Optional[float] = None
    valid_until: Optional[datetime] = None

class QuotationCheckoutRequest(BaseModel):
    customer_name: str
    institution_name: Optional[str] = None
    email: str
    phone: str
    shipping_address: str
    payment_method: Optional[str] = "Pending Configuration"
    notes: Optional[str] = None

class QuotationStatusUpdateRequest(BaseModel):
    status: str = Field(..., description="DRAFT, GENERATED, SENT, APPROVED, REJECTED, INVOICED, EXPIRED")

class SendEmailRequest(BaseModel):
    to_email: str
    custom_message: Optional[str] = None

class QuotationResponse(BaseModel):
    id: int
    quote_id: str
    user_id: Optional[int] = None
    items: List[Dict[str, Any]]
    subtotal: float
    tax_amount: float
    discount_amount: float
    total_amount: float
    valid_until: datetime
    status: str
    is_valid: bool
    institution_name: Optional[str] = None
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    billing_address: Optional[str] = None
    notes: Optional[str] = None
    converted_bill_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
