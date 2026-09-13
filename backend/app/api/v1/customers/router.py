from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.response import APIResponse, api_response
from app.api.deps import get_db, get_current_active_user
from app.models.customer import Customer
from app.models.user import User
from app.services.audit_service import log_activity
from app.api.v1.customers.schemas import (
    CustomerCreateRequest, CustomerUpdateRequest, CustomerResponse, CustomerDetailResponse
)
from app.api.v1.customers.services import (
    generate_unique_customer_code, build_customer_response
)

router = APIRouter(
    prefix="/customers",
    tags=["Customer Management"],
    dependencies=[Depends(get_current_active_user)]
)


@router.get("", response_model=APIResponse[List[CustomerResponse]])
def list_customers(
    search: Optional[str] = Query(None, description="Search by company name, contact person, phone, email, code, GSTIN"),
    customer_type: Optional[str] = Query(None, description="Filter by customer type e.g. COLLEGE, UNIVERSITY"),
    state: Optional[str] = Query(None, description="Filter by State"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Retrieve all registered customer accounts with optional search and filters.
    """
    query = db.query(Customer)

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Customer.company_name.ilike(term),
                Customer.customer_code.ilike(term),
                Customer.email.ilike(term),
                Customer.phone.ilike(term),
                Customer.gstin.ilike(term),
                Customer.city.ilike(term)
            )
        )

    if customer_type and customer_type.strip() and customer_type.upper() != "ALL":
        query = query.filter(Customer.customer_type == customer_type.strip().upper())

    if state and state.strip():
        query = query.filter(Customer.state.ilike(f"%{state.strip()}%"))

    query = query.order_by(Customer.created_at.desc())
    if skip:
        query = query.offset(skip)
    if limit:
        query = query.limit(limit)

    customers = query.all()
    results = [build_customer_response(c, db, include_details=False) for c in customers]
    return api_response(data=results, message="Customers list retrieved successfully")


@router.post("", response_model=APIResponse[CustomerResponse], status_code=status.HTTP_201_CREATED)
def create_customer(
    payload: CustomerCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Register a new Customer account with company name, contact persons, GSTIN/PAN, state, and address.
    """
    if not payload.company_name or not payload.company_name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company / Institution Name is required."
        )

    # Check for existing duplicate code or gstin
    code = generate_unique_customer_code(db)

    contacts_data = [cp.model_dump() for cp in payload.contact_persons] if payload.contact_persons else []
    docs_data = [doc.model_dump() for doc in payload.documents] if payload.documents else []

    customer = Customer(
        customer_code=code,
        company_name=payload.company_name.strip(),
        customer_type=payload.customer_type.upper() if payload.customer_type else "COLLEGE",
        contact_persons=contacts_data,
        phone=payload.phone,
        email=payload.email,
        billing_address=payload.billing_address,
        shipping_address=payload.shipping_address or payload.billing_address,
        gstin=payload.gstin,
        pan=payload.pan,
        state=payload.state,
        city=payload.city,
        notes=payload.notes,
        documents=docs_data,
    )

    db.add(customer)
    db.commit()
    db.refresh(customer)

    log_activity(
        db=db,
        user=current_user,
        action="CREATE",
        module="Customer Management",
        entity_type="Customer",
        entity_id=customer.id,
        description=f"Created customer account '{customer.company_name}' ({code})",
        changes_diff={"code": code, "company_name": customer.company_name, "customer_type": customer.customer_type, "email": customer.email, "phone": customer.phone}
    )

    return api_response(
        data=build_customer_response(customer, db, include_details=False),
        message=f"Customer '{customer.company_name}' registered successfully with Code {code}."
    )


@router.get("/{customer_id}", response_model=APIResponse[CustomerDetailResponse])
def get_customer_details(
    customer_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve comprehensive customer profile including total business value, outstanding balance,
    quotation history, order history, and full interactive timeline.
    """
    customer = db.query(Customer).filter(Customer.id == customer_id).first()

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID #{customer_id} was not found."
        )

    detailed_data = build_customer_response(customer, db, include_details=True)
    return api_response(data=detailed_data, message="Customer profile details retrieved successfully")


@router.put("/{customer_id}", response_model=APIResponse[CustomerResponse])
def update_customer(
    customer_id: int,
    payload: CustomerUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update customer details, contact persons list, GSTIN/PAN, or addresses.
    """
    customer = db.query(Customer).filter(Customer.id == customer_id).first()

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID #{customer_id} not found."
        )

    if payload.company_name is not None and payload.company_name.strip():
        customer.company_name = payload.company_name.strip()

    if payload.customer_type is not None:
        customer.customer_type = payload.customer_type.upper()

    if payload.contact_persons is not None:
        customer.contact_persons = [cp.model_dump() for cp in payload.contact_persons]

    if payload.phone is not None:
        customer.phone = payload.phone
    if payload.email is not None:
        customer.email = payload.email
    if payload.billing_address is not None:
        customer.billing_address = payload.billing_address
    if payload.shipping_address is not None:
        customer.shipping_address = payload.shipping_address
    if payload.gstin is not None:
        customer.gstin = payload.gstin
    if payload.pan is not None:
        customer.pan = payload.pan
    if payload.state is not None:
        customer.state = payload.state
    if payload.city is not None:
        customer.city = payload.city
    if payload.notes is not None:
        customer.notes = payload.notes
    if payload.documents is not None:
        customer.documents = [doc.model_dump() for doc in payload.documents]

    db.commit()
    db.refresh(customer)

    log_activity(
        db=db,
        user=current_user,
        action="UPDATE",
        module="Customer Management",
        entity_type="Customer",
        entity_id=customer.id,
        description=f"Updated customer profile for '{customer.company_name}'",
        changes_diff=payload.model_dump(exclude_unset=True)
    )

    return api_response(
        data=build_customer_response(customer, db, include_details=False),
        message=f"Customer '{customer.company_name}' updated successfully."
    )


@router.delete("/{customer_id}", response_model=APIResponse[dict])
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete customer account.
    """
    customer = db.query(Customer).filter(Customer.id == customer_id).first()

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID #{customer_id} not found."
        )

    company_name = customer.company_name
    db.delete(customer)
    db.commit()

    log_activity(
        db=db,
        user=current_user,
        action="DELETE",
        module="Customer Management",
        entity_type="Customer",
        entity_id=customer_id,
        description=f"Deleted customer account '{company_name}'"
    )

    return api_response(
        data={"id": customer_id},
        message=f"Customer '{company_name}' deleted successfully."
    )
