import random
from datetime import datetime, timedelta, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.response import APIResponse, api_response
from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.models.quotation import Quotation
from app.models.bill import Bill
from app.api.v1.bills.router import generate_unique_bill_number
from app.api.v1.quotations.schemas import (
    QuotationCreateRequest, QuotationUpdateRequest, QuotationCheckoutRequest, QuotationResponse
)

router = APIRouter(
    prefix="/quotations",
    tags=["Quotations & Checkout"],
    dependencies=[Depends(get_current_active_user)]
)


def generate_unique_quote_id(db: Session) -> str:
    """Generate a clean, professional Quote ID e.g. QT-2026-89412."""
    year = datetime.now().year
    for _ in range(20):
        rand_num = random.randint(10000, 99999)
        candidate = f"QT-{year}-{rand_num}"
        existing = db.query(Quotation).filter(Quotation.quote_id == candidate).first()
        if not existing:
            return candidate
    return f"QT-{year}-{random.randint(100000, 999999)}"


def build_quotation_response(quote: Quotation, db: Optional[Session] = None) -> dict:
    now = datetime.now(timezone.utc)
    valid_until_utc = quote.valid_until
    if valid_until_utc.tzinfo is None:
        valid_until_utc = valid_until_utc.replace(tzinfo=timezone.utc)

    is_valid = quote.status == "GENERATED" and valid_until_utc >= now

    bill_number = None
    if db:
        bill = db.query(Bill).filter(Bill.quote_id == quote.quote_id).first()
        if bill:
            bill_number = bill.bill_number

    res = {
        "id": quote.id,
        "quote_id": quote.quote_id,
        "user_id": quote.user_id,
        "items": quote.items,
        "subtotal": quote.subtotal,
        "tax_amount": quote.tax_amount,
        "discount_amount": quote.discount_amount,
        "total_amount": quote.total_amount,
        "valid_until": quote.valid_until,
        "status": "EXPIRED" if (quote.status == "GENERATED" and not is_valid) else quote.status,
        "is_valid": is_valid,
        "institution_name": quote.institution_name,
        "contact_name": quote.contact_name,
        "email": quote.email,
        "phone": quote.phone,
        "billing_address": quote.billing_address,
        "notes": quote.notes,
        "bill_number": bill_number,
        "created_at": quote.created_at,
        "updated_at": quote.updated_at,
    }
    return res


@router.get("", response_model=APIResponse[List[QuotationResponse]])
def list_quotations(
    search: Optional[str] = Query(None, description="Search by quote_id, institution_name, contact_name, or email"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by quotation status"),
    db: Session = Depends(get_db)
):
    """
    Retrieve all generated quotations with optional search and status filter.
    """
    query = db.query(Quotation)

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Quotation.quote_id.ilike(term),
                Quotation.institution_name.ilike(term),
                Quotation.contact_name.ilike(term),
                Quotation.email.ilike(term)
            )
        )

    if status_filter and status_filter.strip():
        query = query.filter(Quotation.status == status_filter.strip().upper())

    quotes = query.order_by(Quotation.created_at.desc()).all()
    results = [build_quotation_response(q, db) for q in quotes]
    return api_response(data=results, message="Quotations retrieved successfully")



@router.post("", response_model=APIResponse[QuotationResponse], status_code=status.HTTP_201_CREATED)
def create_quotation(
    payload: QuotationCreateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Generate a official quotation with a unique quote_id (e.g. QT-2026-89412),
    line items, custom customer details, and validity expiration date.
    """
    if not payload.items or len(payload.items) == 0:
        raise HTTPException(status_code=400, detail="Quotation must contain at least 1 item.")

    quote_id = generate_unique_quote_id(db)

    items_data = [item.model_dump() for item in payload.items]
    subtotal = payload.subtotal if payload.subtotal is not None else sum(item.total for item in payload.items)
    discount = payload.discount_amount if payload.discount_amount is not None else 0.0
    taxable = max(0.0, subtotal - discount)
    tax = payload.tax_amount if payload.tax_amount is not None else round(taxable * 0.18, 2)  # 18% GST default
    total = payload.total_amount if payload.total_amount is not None else round(taxable + tax, 2)

    # Validity date: default 14 days from now if not passed
    valid_until = payload.valid_until or (datetime.now(timezone.utc) + timedelta(days=14))

    quotation = Quotation(
        quote_id=quote_id,
        user_id=current_user.id,
        items=items_data,
        subtotal=subtotal,
        tax_amount=tax,
        discount_amount=discount,
        total_amount=total,
        valid_until=valid_until,
        status="GENERATED",
        institution_name=payload.institution_name,
        contact_name=payload.contact_name or current_user.full_name or current_user.username,
        email=payload.email or current_user.email,
        phone=payload.phone,
        billing_address=payload.billing_address,
        notes=payload.notes,
    )

    db.add(quotation)
    db.commit()
    db.refresh(quotation)

    try:
        from app.services.audit_service import log_activity
        log_activity(
            db=db,
            user=current_user,
            action="CREATE",
            module="Quotations & Checkout",
            entity_type="Quotation",
            entity_id=quotation.id,
            description=f"Created quotation '{quote_id}' for {quotation.institution_name or quotation.contact_name} (Total: ₹{total})",
            changes_diff=payload.model_dump(exclude_unset=True)
        )
    except Exception:
        pass

    return api_response(data=build_quotation_response(quotation), message=f"Quotation {quote_id} created successfully")


@router.get("/{quote_id}", response_model=APIResponse[QuotationResponse])
def get_quotation_by_id(
    quote_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve quotation details by unique Quote ID (e.g. QT-2026-89412).
    Verifies expiration and status validity.
    """
    cleaned_id = quote_id.strip().upper()
    quotation = db.query(Quotation).filter(Quotation.quote_id == cleaned_id).first()

    if not quotation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quotation with ID '{cleaned_id}' was not found. Please verify the Quote ID."
        )

    return api_response(data=build_quotation_response(quotation), message="Quotation retrieved successfully")


@router.put("/{quote_id}", response_model=APIResponse[QuotationResponse])
def update_quotation(
    quote_id: str,
    payload: QuotationUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update an existing quotation's line items, institution, customer details, discount,
    custom terms/notes, or validity expiration date.
    """
    cleaned_id = quote_id.strip().upper()
    quotation = db.query(Quotation).filter(Quotation.quote_id == cleaned_id).first()

    if not quotation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quotation with ID '{cleaned_id}' not found."
        )

    if payload.items is not None:
        quotation.items = [item.model_dump() for item in payload.items]
        quotation.subtotal = sum(item.total for item in payload.items)

    if payload.institution_name is not None:
        quotation.institution_name = payload.institution_name
    if payload.contact_name is not None:
        quotation.contact_name = payload.contact_name
    if payload.email is not None:
        quotation.email = payload.email
    if payload.phone is not None:
        quotation.phone = payload.phone
    if payload.billing_address is not None:
        quotation.billing_address = payload.billing_address
    if payload.notes is not None:
        quotation.notes = payload.notes
    if payload.discount_amount is not None:
        quotation.discount_amount = payload.discount_amount
    if payload.valid_until is not None:
        quotation.valid_until = payload.valid_until

    # Recalculate totals
    taxable = max(0.0, quotation.subtotal - quotation.discount_amount)
    quotation.tax_amount = round(taxable * 0.18, 2)
    quotation.total_amount = round(taxable + quotation.tax_amount, 2)

    db.commit()
    db.refresh(quotation)

    try:
        from app.services.audit_service import log_activity
        log_activity(
            db=db,
            user=current_user,
            action="UPDATE",
            module="Quotations & Checkout",
            entity_type="Quotation",
            entity_id=quotation.id,
            description=f"Updated quotation '{cleaned_id}' details",
            changes_diff=payload.model_dump(exclude_unset=True)
        )
    except Exception:
        pass

    return api_response(data=build_quotation_response(quotation), message=f"Quotation {cleaned_id} updated successfully")


@router.post("/{quote_id}/checkout", response_model=APIResponse[QuotationResponse])
def checkout_quotation(
    quote_id: str,
    payload: QuotationCheckoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Process quotation checkout using Quote ID, record customer details, and mark status as CHECKED_OUT.
    """
    cleaned_id = quote_id.strip().upper()
    quotation = db.query(Quotation).filter(Quotation.quote_id == cleaned_id).first()

    if not quotation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quotation ID '{cleaned_id}' not found."
        )

    now = datetime.now(timezone.utc)
    valid_until_utc = quotation.valid_until
    if valid_until_utc.tzinfo is None:
        valid_until_utc = valid_until_utc.replace(tzinfo=timezone.utc)

    if valid_until_utc < now:
        quotation.status = "EXPIRED"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Quotation '{cleaned_id}' expired on {quotation.valid_until.strftime('%Y-%m-%d')}. Please generate a new quotation."
        )

    if quotation.status == "CHECKED_OUT":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Quotation '{cleaned_id}' has already been checked out and completed."
        )

    # Update quotation with checkout information
    quotation.status = "CHECKED_OUT"
    quotation.contact_name = payload.customer_name
    if payload.institution_name:
        quotation.institution_name = payload.institution_name
    quotation.email = payload.email
    quotation.phone = payload.phone
    quotation.billing_address = payload.shipping_address
    if payload.notes:
        quotation.notes = f"{quotation.notes or ''}\nCheckout Note: {payload.notes}".strip()

    # Automatically generate an official Bill / Invoice for this checkout
    existing_bill = db.query(Bill).filter(Bill.quote_id == quotation.quote_id).first()
    if not existing_bill:
        bill_no = generate_unique_bill_number(db)
        bill = Bill(
            bill_number=bill_no,
            quote_id=quotation.quote_id,
            user_id=quotation.user_id,
            customer_name=payload.customer_name,
            institution_name=payload.institution_name or quotation.institution_name,
            email=payload.email,
            phone=payload.phone,
            billing_address=payload.shipping_address,
            items=quotation.items,
            subtotal=quotation.subtotal,
            tax_amount=quotation.tax_amount,
            discount_amount=quotation.discount_amount,
            total_amount=quotation.total_amount,
            payment_method=payload.payment_method or "DIRECT",
            payment_id=f"PAY-{cleaned_id}",
            status="PAID"
        )
        db.add(bill)

    db.commit()
    db.refresh(quotation)

    try:
        from app.services.audit_service import log_activity
        log_activity(
            db=db,
            user=current_user,
            action="UPDATE",
            module="Quotations & Checkout",
            entity_type="Quotation",
            entity_id=quotation.id,
            description=f"Completed checkout for quotation '{cleaned_id}'",
            changes_diff=payload.model_dump(exclude_unset=True)
        )
    except Exception:
        pass

    return api_response(
        data=build_quotation_response(quotation, db),
        message=f"Order checkout for Quotation {cleaned_id} completed successfully!"
    )

