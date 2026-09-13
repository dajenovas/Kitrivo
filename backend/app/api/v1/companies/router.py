from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.response import APIResponse, api_response
from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.models.company import Company
from app.api.v1.companies.schemas import (
    CompanyCreate, CompanyUpdate, CompanyResponse
)

router = APIRouter(
    prefix="/companies",
    tags=["Company Management"],
    dependencies=[Depends(get_current_active_user)]
)


@router.get("/active", response_model=APIResponse[Optional[CompanyResponse]])
def get_active_company(db: Session = Depends(get_db)):
    """
    Get the currently active company details.
    Used for quotation generation, checkout, and document rendering.
    """
    company = db.query(Company).filter(Company.is_active == True).first()
    if not company:
        # Fallback to the first company if none marked explicitly active
        company = db.query(Company).order_by(Company.id.asc()).first()

    return api_response(data=company, message="Active company fetched successfully.")


@router.get("", response_model=APIResponse[List[CompanyResponse]])
def list_companies(
    db: Session = Depends(get_db)
):
    """
    List all companies.
    """
    companies = db.query(Company).order_by(Company.is_active.desc(), Company.id.asc()).all()
    return api_response(data=companies, message="Companies retrieved successfully.")


@router.get("/{company_id}", response_model=APIResponse[CompanyResponse])
def get_company_by_id(
    company_id: int,
    db: Session = Depends(get_db)
):
    """
    Get company details by company ID.
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with ID {company_id} not found."
        )
    return api_response(data=company, message="Company details retrieved successfully.")


@router.post("", response_model=APIResponse[CompanyResponse], status_code=status.HTTP_201_CREATED)
def create_company(
    payload: CompanyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new company.
    If is_active is set to True, all other companies are set to is_active=False.
    """
    if payload.is_active:
        db.query(Company).update({Company.is_active: False})
        db.commit()

    # If this is the first company being created, automatically mark it as active
    existing_count = db.query(Company).count()
    should_be_active = payload.is_active or (existing_count == 0)

    company = Company(
        company_name=payload.company_name,
        logo_url=payload.logo_url,
        gst_number=payload.gst_number,
        pan_number=payload.pan_number,
        address=payload.address,
        billing_address=payload.billing_address,
        email=payload.email,
        phone=payload.phone,
        website=payload.website,
        is_active=should_be_active
    )

    db.add(company)
    db.commit()
    db.refresh(company)

    try:
        from app.services.audit_service import log_activity
        log_activity(
            db=db,
            user=current_user,
            action="CREATE",
            module="Company Management",
            entity_type="Company",
            entity_id=company.id,
            description=f"Created company '{company.company_name}'",
            changes_diff=payload.model_dump(exclude_unset=True)
        )
    except Exception:
        pass

    return api_response(data=company, message="Company created successfully.")


@router.put("/{company_id}", response_model=APIResponse[CompanyResponse])
def update_company(
    company_id: int,
    payload: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update an existing company by ID.
    If is_active is set to True, all other companies are deactivated.
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with ID {company_id} not found."
        )

    if payload.is_active is True:
        db.query(Company).filter(Company.id != company_id).update({Company.is_active: False})
        db.commit()

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)

    db.commit()
    db.refresh(company)

    try:
        from app.services.audit_service import log_activity
        log_activity(
            db=db,
            user=current_user,
            action="UPDATE",
            module="Company Management",
            entity_type="Company",
            entity_id=company.id,
            description=f"Updated company details for '{company.company_name}'",
            changes_diff=payload.model_dump(exclude_unset=True)
        )
    except Exception:
        pass

    return api_response(data=company, message="Company details updated successfully.")


@router.post("/{company_id}/activate", response_model=APIResponse[CompanyResponse])
def set_active_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Set the specified company as active.
    Deactivates all other companies in the system.
    """
    target_company = db.query(Company).filter(Company.id == company_id).first()
    if not target_company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with ID {company_id} not found."
        )

    db.query(Company).update({Company.is_active: False})
    target_company.is_active = True
    db.commit()
    db.refresh(target_company)

    try:
        from app.services.audit_service import log_activity
        log_activity(
            db=db,
            user=current_user,
            action="STATUS_CHANGE",
            module="Company Management",
            entity_type="Company",
            entity_id=target_company.id,
            description=f"Set company '{target_company.company_name}' as active"
        )
    except Exception:
        pass

    return api_response(data=target_company, message=f"'{target_company.company_name}' is now set as the Active Company.")


@router.delete("/{company_id}", response_model=APIResponse[dict])
def delete_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a company by ID.
    If the active company is deleted, sets the most recent remaining company as active.
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with ID {company_id} not found."
        )

    was_active = company.is_active
    comp_name = company.company_name
    db.delete(company)
    db.commit()

    if was_active:
        remaining = db.query(Company).order_by(Company.id.desc()).first()
        if remaining:
            remaining.is_active = True
            db.commit()

    try:
        from app.services.audit_service import log_activity
        log_activity(
            db=db,
            user=current_user,
            action="DELETE",
            module="Company Management",
            entity_type="Company",
            entity_id=company_id,
            description=f"Deleted company '{comp_name}' (# {company_id})"
        )
    except Exception:
        pass

    return api_response(data={"deleted_id": company_id}, message="Company deleted successfully.")
