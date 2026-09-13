import random
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.response import APIResponse, api_response
from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.models.bill import Bill
from app.api.v1.bills.schemas import BillCreateRequest, BillResponse

router = APIRouter(
    prefix="/bills",
    tags=["Bills & Invoices"],
    dependencies=[Depends(get_current_active_user)]
)


def generate_unique_bill_number(db: Session) -> str:
    """Generate a clean, professional Bill Number e.g. BILL-2026-48291."""
    year = datetime.now().year
    for _ in range(20):
        rand_num = random.randint(10000, 99999)
        candidate = f"BILL-{year}-{rand_num}"
        existing = db.query(Bill).filter(Bill.bill_number == candidate).first()
        if not existing:
            return candidate
    return f"BILL-{year}-{random.randint(100000, 999999)}"


@router.get("", response_model=APIResponse[List[BillResponse]])
def list_bills(
    search: Optional[str] = Query(None, description="Search by bill_number, quote_id, customer_name, or email"),
    payment_method: Optional[str] = Query(None, description="Filter by payment_method"),
    db: Session = Depends(get_db)
):
    """
    Retrieve all generated bills with optional search and filtering.
    """
    query = db.query(Bill)

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Bill.bill_number.ilike(term),
                Bill.quote_id.ilike(term),
                Bill.customer_name.ilike(term),
                Bill.institution_name.ilike(term),
                Bill.email.ilike(term)
            )
        )

    if payment_method and payment_method.strip():
        query = query.filter(Bill.payment_method == payment_method.strip().upper())

    bills = query.order_by(Bill.created_at.desc()).all()
    return api_response(data=bills, message="Bills retrieved successfully")


@router.get("/{bill_number}", response_model=APIResponse[BillResponse])
def get_bill_by_number(
    bill_number: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve specific bill details by unique Bill Number (e.g. BILL-2026-48291).
    """
    cleaned_no = bill_number.strip().upper()
    bill = db.query(Bill).filter(Bill.bill_number == cleaned_no).first()

    if not bill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bill with number '{cleaned_no}' not found."
        )

    return api_response(data=bill, message="Bill retrieved successfully")


@router.post("", response_model=APIResponse[BillResponse], status_code=status.HTTP_201_CREATED)
def create_bill(
    payload: BillCreateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Manually create a new bill/invoice record.
    """
    if not payload.items or len(payload.items) == 0:
        raise HTTPException(status_code=400, detail="Bill must contain at least 1 item.")

    bill_number = generate_unique_bill_number(db)
    items_data = [item.model_dump() for item in payload.items]

    bill = Bill(
        bill_number=bill_number,
        quote_id=payload.quote_id,
        user_id=current_user.id,
        customer_name=payload.customer_name,
        institution_name=payload.institution_name,
        email=payload.email,
        phone=payload.phone,
        billing_address=payload.billing_address,
        items=items_data,
        subtotal=payload.subtotal,
        tax_amount=payload.tax_amount,
        discount_amount=payload.discount_amount,
        total_amount=payload.total_amount,
        payment_method=payload.payment_method,
        payment_id=payload.payment_id,
        status="PAID"
    )

    db.add(bill)
    db.commit()
    db.refresh(bill)

    try:
        from app.services.audit_service import log_activity
        log_activity(
            db=db,
            user=current_user,
            action="CREATE",
            module="Bills & Invoices",
            entity_type="Bill",
            entity_id=bill.id,
            description=f"Generated bill/invoice '{bill_number}' for {bill.customer_name} (Total: ₹{bill.total_amount})",
            changes_diff=payload.model_dump(exclude_unset=True)
        )
    except Exception:
        pass

    return api_response(data=bill, message=f"Bill {bill_number} generated successfully")
