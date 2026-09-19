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
from app.models.payment_record import PaymentRecord
from app.api.v1.bills.schemas import (
    BillCreateRequest, BillResponse, PaymentCreateRequest, PaymentRecordResponse
)
from app.api.v1.quotations.schemas import SendEmailRequest

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


@router.post("/{bill_number}/payments", response_model=APIResponse[BillResponse])
def record_bill_payment(
    bill_number: str,
    payload: PaymentCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Record a partial or full payment against a bill/invoice.
    Recalculates amount_paid, balance_due, and updates payment_status (PAID, PARTIAL, UNPAID).
    """
    cleaned_no = bill_number.strip().upper()
    bill = db.query(Bill).filter(Bill.bill_number == cleaned_no).first()

    if not bill:
        raise HTTPException(status_code=404, detail=f"Bill '{cleaned_no}' not found.")

    if bill.balance_due is None or bill.balance_due <= 0:
        bill.balance_due = max(0.0, bill.total_amount - (bill.amount_paid or 0.0))

    if payload.amount > (bill.balance_due + 0.01):
        raise HTTPException(
            status_code=400,
            detail=f"Payment amount ₹{payload.amount} exceeds outstanding balance of ₹{bill.balance_due:,.2f}"
        )

    # Create PaymentRecord
    record = PaymentRecord(
        bill_id=bill.id,
        customer_id=bill.customer_id,
        amount=payload.amount,
        payment_method=payload.payment_method,
        transaction_reference=payload.transaction_reference,
        payment_date=datetime.now(),
        notes=payload.notes,
        created_by_id=current_user.id
    )
    db.add(record)

    # Recalculate bill totals
    bill.amount_paid = round((bill.amount_paid or 0.0) + payload.amount, 2)
    bill.balance_due = round(max(0.0, bill.total_amount - bill.amount_paid), 2)

    if bill.balance_due <= 0.01:
        bill.payment_status = "PAID"
        bill.status = "PAID"
    elif bill.amount_paid > 0:
        bill.payment_status = "PARTIAL"

    db.commit()
    db.refresh(bill)

    try:
        from app.services.audit_service import log_activity
        log_activity(
            db=db,
            user=current_user,
            action="UPDATE",
            module="Bills & Invoices",
            entity_type="PaymentRecord",
            entity_id=record.id,
            description=f"Recorded payment of ₹{payload.amount} for Bill '{cleaned_no}' ({payload.payment_method})"
        )
    except Exception:
        pass

    return api_response(data=bill, message=f"Payment of ₹{payload.amount} recorded successfully for {cleaned_no}")


@router.get("/{bill_number}/payments", response_model=APIResponse[List[PaymentRecordResponse]])
def get_bill_payment_history(
    bill_number: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve payment history log for a specific bill/invoice.
    """
    cleaned_no = bill_number.strip().upper()
    bill = db.query(Bill).filter(Bill.bill_number == cleaned_no).first()

    if not bill:
        raise HTTPException(status_code=404, detail=f"Bill '{cleaned_no}' not found.")

    records = db.query(PaymentRecord).filter(PaymentRecord.bill_id == bill.id).order_by(PaymentRecord.created_at.desc()).all()
    return api_response(data=records, message="Payment records retrieved successfully")


@router.post("/{bill_number}/send-email", response_model=APIResponse[bool])
async def send_bill_via_email(
    bill_number: str,
    payload: SendEmailRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Send Invoice PDF directly to customer email.
    """
    cleaned_no = bill_number.strip().upper()
    bill = db.query(Bill).filter(Bill.bill_number == cleaned_no).first()

    if not bill:
        raise HTTPException(status_code=404, detail=f"Bill '{cleaned_no}' not found.")

    from app.services.email_service import send_email_with_pdf

    body = f"""
    <h2>Invoice Details - {bill.bill_number}</h2>
    <p>Dear {bill.customer_name},</p>
    <p>Please find details of your official invoice from Kitrivo below:</p>
    <ul>
      <li><strong>Invoice Number:</strong> {bill.bill_number}</li>
      <li><strong>Institution / Customer:</strong> {bill.institution_name or bill.customer_name}</li>
      <li><strong>Total Amount:</strong> ₹{bill.total_amount:,.2f}</li>
      <li><strong>Amount Paid:</strong> ₹{(bill.amount_paid or 0.0):,.2f}</li>
      <li><strong>Balance Due:</strong> ₹{(bill.balance_due or bill.total_amount):,.2f}</li>
      <li><strong>Status:</strong> {bill.payment_status or bill.status}</li>
    </ul>
    <p>{payload.custom_message or 'Thank you for your business!'}</p>
    """

    success = await send_email_with_pdf(
        to_email=payload.to_email,
        subject=f"Official Invoice {bill.bill_number} - Kitrivo",
        body_text=body,
        pdf_bytes=b"%PDF-1.4 Mock Invoice PDF Content",
        filename=f"Invoice_{bill.bill_number}.pdf"
    )

    return api_response(data=success, message=f"Invoice {cleaned_no} sent to {payload.to_email}")

