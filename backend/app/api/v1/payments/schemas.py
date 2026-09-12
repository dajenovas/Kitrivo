from typing import Optional, List
from pydantic import BaseModel, Field

class OrderItemInput(BaseModel):
    product_id: int
    product_name: str
    quantity: int = Field(..., ge=1)
    unit_price: float = Field(..., ge=0)

class CreateOrderRequest(BaseModel):
    quotation_id: Optional[str] = None
    items: List[OrderItemInput]
    notes: Optional[str] = None

class CreateOrderResponse(BaseModel):
    order_id: str
    amount: int  # in paise
    currency: str
    key_id: str
    quotation_id: Optional[str] = None

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    quotation_id: Optional[str] = None
    items: List[OrderItemInput]
