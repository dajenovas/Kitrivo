import random
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, func

from app.models.customer import Customer
from app.models.quotation import Quotation
from app.models.bill import Bill
from app.api.v1.customers.schemas import (
    CustomerCreateRequest, CustomerUpdateRequest, CustomerResponse,
    CustomerDetailResponse, TimelineEvent, ContactPersonSchema, CustomerDocumentSchema
)

def generate_unique_customer_code(db: Session) -> str:
    """Generate unique Customer Code e.g. CUST-2026-0182."""
    year = datetime.now().year
    for _ in range(20):
        rand_num = random.randint(1000, 9999)
        candidate = f"CUST-{year}-{rand_num}"
        existing = db.query(Customer).filter(Customer.customer_code == candidate).first()
        if not existing:
            return candidate
    return f"CUST-{year}-{random.randint(10000, 99999)}"


def build_customer_response(customer: Customer, db: Session, include_details: bool = False) -> Dict[str, Any]:
    # 1. Fetch linked or matching Quotations & Bills
    # Match either by customer_id OR by institution_name / email case-insensitively
    term_name = customer.company_name.strip() if customer.company_name else ""
    term_email = customer.email.strip() if customer.email else ""

    quotes_query = db.query(Quotation).filter(
        or_(
            Quotation.customer_id == customer.id,
            func.lower(Quotation.institution_name) == term_name.lower(),
            (Quotation.email == term_email) if term_email else False
        )
    ).order_by(desc(Quotation.created_at)).all()

    bills_query = db.query(Bill).filter(
        or_(
            Bill.customer_id == customer.id,
            func.lower(Bill.institution_name) == term_name.lower(),
            (Bill.email == term_email) if term_email else False
        )
    ).order_by(desc(Bill.created_at)).all()

    # 2. Calculate Financial Metrics
    paid_bills = [b for b in bills_query if b.status == "PAID"]
    total_business_value = sum(b.total_amount for b in paid_bills)
    
    # If no paid bills but quotes checked out, factor quotes checked out
    if total_business_value == 0:
        checked_out_quotes = [q for q in quotes_query if q.status == "CHECKED_OUT"]
        total_business_value = sum(q.total_amount for q in checked_out_quotes)

    pending_bills = [b for b in bills_query if b.status == "PENDING"]
    outstanding_payments = sum(b.total_amount for b in pending_bills)

    contacts_data = customer.contact_persons if isinstance(customer.contact_persons, list) else []
    docs_data = customer.documents if isinstance(customer.documents, list) else []

    res = {
        "id": customer.id,
        "customer_code": customer.customer_code,
        "company_name": customer.company_name,
        "customer_type": customer.customer_type,
        "contact_persons": contacts_data,
        "phone": customer.phone,
        "email": customer.email,
        "billing_address": customer.billing_address,
        "shipping_address": customer.shipping_address,
        "gstin": customer.gstin,
        "pan": customer.pan,
        "state": customer.state,
        "city": customer.city,
        "notes": customer.notes,
        "documents": docs_data,
        "total_business_value": round(total_business_value, 2),
        "outstanding_payments": round(outstanding_payments, 2),
        "quotations_count": len(quotes_query),
        "orders_count": len(bills_query),
        "created_at": customer.created_at,
        "updated_at": customer.updated_at,
    }

    if not include_details:
        return res

    # 3. Build Previous Quotations list
    prev_quotations = []
    for q in quotes_query:
        prev_quotations.append({
            "id": q.id,
            "quote_id": q.quote_id,
            "total_amount": q.total_amount,
            "status": q.status,
            "created_at": q.created_at.strftime("%b %d, %Y") if q.created_at else "",
            "valid_until": q.valid_until.strftime("%b %d, %Y") if q.valid_until else "",
            "items_count": len(q.items) if isinstance(q.items, list) else 0
        })

    # 4. Build Previous Orders list
    prev_orders = []
    for b in bills_query:
        prev_orders.append({
            "id": b.id,
            "bill_number": b.bill_number,
            "quote_id": b.quote_id,
            "total_amount": b.total_amount,
            "payment_method": b.payment_method,
            "status": b.status,
            "created_at": b.created_at.strftime("%b %d, %Y") if b.created_at else "",
            "items_count": len(b.items) if isinstance(b.items, list) else 0
        })

    # 5. Build Interactive Customer Timeline
    timeline_events: List[Dict[str, Any]] = []

    # Add Account Onboarded Event
    timeline_events.append({
        "id": f"evt-onboard-{customer.id}",
        "date": customer.created_at.strftime("%b %d, %Y") if customer.created_at else "Recently",
        "raw_dt": customer.created_at or datetime.now(),
        "title": "Customer Account Registered",
        "description": f"Customer '{customer.company_name}' onboarded into system as {customer.customer_type}.",
        "event_type": "ACCOUNT_CREATED",
        "reference_id": customer.customer_code
    })

    # Add Quotations to Timeline
    for q in quotes_query:
        q_date = q.created_at.strftime("%b %d, %Y") if q.created_at else ""
        timeline_events.append({
            "id": f"evt-q-{q.id}",
            "date": q_date,
            "raw_dt": q.created_at or datetime.now(),
            "title": f"Quotation {q.quote_id} Generated",
            "description": f"Quotation created for total amount ₹{q.total_amount:,.2f} ({len(q.items or [])} line items).",
            "event_type": "QUOTATION_CREATED",
            "reference_id": q.quote_id
        })

        if q.status == "CHECKED_OUT":
            timeline_events.append({
                "id": f"evt-q-chk-{q.id}",
                "date": q.updated_at.strftime("%b %d, %Y") if q.updated_at else q_date,
                "raw_dt": q.updated_at or q.created_at or datetime.now(),
                "title": f"Quotation {q.quote_id} Accepted & Checked Out",
                "description": f"Quotation terms accepted by client for order execution.",
                "event_type": "QUOTATION_CHECKED_OUT",
                "reference_id": q.quote_id
            })

    # Add Orders / Invoices to Timeline
    for b in bills_query:
        b_date = b.created_at.strftime("%b %d, %Y") if b.created_at else ""
        timeline_events.append({
            "id": f"evt-b-{b.id}",
            "date": b_date,
            "raw_dt": b.created_at or datetime.now(),
            "title": f"Invoice {b.bill_number} Settled",
            "description": f"Official invoice generated & payment verified via {b.payment_method} (Total: ₹{b.total_amount:,.2f}).",
            "event_type": "INVOICE_GENERATED" if b.status != "PAID" else "PAYMENT_RECEIVED",
            "reference_id": b.bill_number
        })

    # Sort timeline events descending by timestamp
    timeline_events.sort(key=lambda x: x["raw_dt"], reverse=True)
    
    # Strip raw_dt helper key
    cleaned_timeline = []
    for evt in timeline_events:
        cleaned_timeline.append({
            "id": evt["id"],
            "date": evt["date"],
            "title": evt["title"],
            "description": evt["description"],
            "event_type": evt["event_type"],
            "reference_id": evt["reference_id"]
        })

    res["previous_quotations"] = prev_quotations
    res["previous_orders"] = prev_orders
    res["timeline"] = cleaned_timeline

    return res
