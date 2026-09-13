from typing import Dict, Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.response import APIResponse, api_response
from app.api.deps import get_db, get_current_active_user
from app.api.v1.payments.schemas import CreateOrderRequest, CreateOrderResponse, VerifyPaymentRequest
from app.api.v1.payments.services.razorpay_service import RazorpayService

from app.services.audit_service import log_activity
from app.models.user import User

router = APIRouter(
    prefix="/payments",
    tags=["Payments & Checkout"],
    dependencies=[Depends(get_current_active_user)]
)

@router.post("/create-order", response_model=APIResponse[CreateOrderResponse], status_code=status.HTTP_201_CREATED)
def create_razorpay_order(
    request: CreateOrderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Validate product stock availability and create a Razorpay Order.
    Raises HTTP 400 if any product is OUT_OF_STOCK or has insufficient stock quantity.
    """
    order = RazorpayService.create_order(db, request)

    try:
        log_activity(
            db=db,
            user=current_user,
            action="CREATE",
            module="Payment Gateway",
            entity_type="PaymentOrder",
            entity_id=getattr(order, "id", None) or getattr(order, "order_id", None),
            description=f"Created Razorpay payment order for amount ₹{request.amount}",
            changes_diff=request.model_dump()
        )
    except Exception:
        pass

    return api_response(data=order, message="Razorpay order created successfully")

@router.post("/verify", response_model=APIResponse[Dict[str, Any]])
def verify_razorpay_payment(
    request: VerifyPaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Verify Razorpay payment signature and automatically reduce purchased items' stock.
    Auto-updates product status to OUT_OF_STOCK if stock hits 0.
    """
    result = RazorpayService.verify_payment(db, request)

    try:
        log_activity(
            db=db,
            user=current_user,
            action="UPDATE",
            module="Payment Gateway",
            entity_type="Payment",
            entity_id=request.razorpay_payment_id,
            description=f"Verified Razorpay payment '{request.razorpay_payment_id}' and updated stock",
            changes_diff=request.model_dump()
        )
    except Exception:
        pass

    return api_response(data=result, message="Payment verified and stock updated successfully")
