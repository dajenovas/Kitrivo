from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class ContactPersonSchema(BaseModel):
    name: str
    designation: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

class CustomerDocumentSchema(BaseModel):
    title: str
    url: str
    file_type: Optional[str] = "PDF"
    uploaded_at: Optional[str] = None

class CustomerCreateRequest(BaseModel):
    company_name: str
    customer_type: Optional[str] = "COLLEGE"  # COLLEGE, UNIVERSITY, POLYTECHNIC, RESEARCH_LAB, CORPORATE, OTHER
    contact_persons: Optional[List[ContactPersonSchema]] = []
    phone: Optional[str] = None
    email: Optional[str] = None
    billing_address: Optional[str] = None
    shipping_address: Optional[str] = None
    gstin: Optional[str] = None
    pan: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    notes: Optional[str] = None
    documents: Optional[List[CustomerDocumentSchema]] = []

class CustomerUpdateRequest(BaseModel):
    company_name: Optional[str] = None
    customer_type: Optional[str] = None
    contact_persons: Optional[List[ContactPersonSchema]] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    billing_address: Optional[str] = None
    shipping_address: Optional[str] = None
    gstin: Optional[str] = None
    pan: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    notes: Optional[str] = None
    documents: Optional[List[CustomerDocumentSchema]] = None

class CustomerResponse(BaseModel):
    id: int
    customer_code: str
    company_name: str
    customer_type: str
    contact_persons: List[ContactPersonSchema]
    phone: Optional[str] = None
    email: Optional[str] = None
    billing_address: Optional[str] = None
    shipping_address: Optional[str] = None
    gstin: Optional[str] = None
    pan: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    notes: Optional[str] = None
    documents: List[CustomerDocumentSchema]
    total_business_value: float = 0.0
    outstanding_payments: float = 0.0
    quotations_count: int = 0
    orders_count: int = 0
    created_at: datetime
    updated_at: datetime

class TimelineEvent(BaseModel):
    id: str
    date: str
    title: str
    description: str
    event_type: str  # QUOTATION_CREATED, QUOTATION_CHECKED_OUT, INVOICE_GENERATED, PAYMENT_RECEIVED, DISCOUNT_REQUESTED, ORDER_DISPATCHED, NOTE_ADDED
    reference_id: Optional[str] = None

class CustomerDetailResponse(CustomerResponse):
    previous_quotations: List[dict] = []
    previous_orders: List[dict] = []
    timeline: List[TimelineEvent] = []
