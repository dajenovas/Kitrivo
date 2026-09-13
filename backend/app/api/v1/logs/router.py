from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, func

from app.core.response import APIResponse, api_response
from app.api.deps import get_db, require_permission, get_current_active_user
from app.models.audit_log import AuditLog
from app.models.user import User
from app.api.v1.logs.schemas import AuditLogResponse, AuditLogListResponse

router = APIRouter(
    prefix="/logs",
    tags=["System Audit Logs"],
    dependencies=[require_permission("LOGS_READ")]
)

@router.get("", response_model=APIResponse[AuditLogListResponse])
def list_audit_logs(
    search: Optional[str] = Query(None, description="Search description, email, user name, or entity ID"),
    module: Optional[str] = Query(None, description="Filter by Module name"),
    action: Optional[str] = Query(None, description="Filter by Action type e.g. CREATE, UPDATE, DELETE"),
    user_id: Optional[int] = Query(None, description="Filter by User ID"),
    start_date: Optional[str] = Query(None, description="Filter by start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Filter by end date (YYYY-MM-DD)"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Retrieve paginated system activity audit logs (SuperAdmin Only).
    """
    query = db.query(AuditLog)

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                AuditLog.description.ilike(term),
                AuditLog.user_email.ilike(term),
                AuditLog.user_name.ilike(term),
                AuditLog.entity_id.ilike(term),
                AuditLog.entity_type.ilike(term),
            )
        )

    if module and module.strip() and module.upper() != "ALL":
        query = query.filter(AuditLog.module.ilike(f"%{module.strip()}%"))

    if action and action.strip() and action.upper() != "ALL":
        query = query.filter(AuditLog.action == action.strip().upper())

    if user_id:
        query = query.filter(AuditLog.user_id == user_id)

    if start_date and start_date.strip():
        try:
            start_dt = datetime.strptime(start_date.strip(), "%Y-%m-%d")
            query = query.filter(AuditLog.created_at >= start_dt)
        except ValueError:
            pass

    if end_date and end_date.strip():
        try:
            end_dt = datetime.strptime(f"{end_date.strip()} 23:59:59", "%Y-%m-%d %H:%M:%S")
            query = query.filter(AuditLog.created_at <= end_dt)
        except ValueError:
            pass

    total = query.count()
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    skip = (page - 1) * page_size
    items = query.order_by(desc(AuditLog.created_at)).offset(skip).limit(page_size).all()

    items_data = [AuditLogResponse.model_validate(item) for item in items]

    return api_response(
        data=AuditLogListResponse(
            items=items_data,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        ),
        message="System audit logs retrieved successfully"
    )

@router.get("/modules", response_model=APIResponse[List[str]])
def get_log_modules(db: Session = Depends(get_db)):
    """
    Get distinct module names recorded in audit logs.
    """
    modules = db.query(AuditLog.module).distinct().all()
    module_list = sorted([m[0] for m in modules if m[0]])
    return api_response(data=module_list, message="Log modules retrieved successfully")

@router.get("/{log_id}", response_model=APIResponse[AuditLogResponse])
def get_audit_log_by_id(
    log_id: int,
    db: Session = Depends(get_db)
):
    """
    Get detailed audit log by ID.
    """
    log_entry = db.query(AuditLog).filter(AuditLog.id == log_id).first()
    if not log_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Audit log with ID #{log_id} not found."
        )
    return api_response(data=AuditLogResponse.model_validate(log_entry), message="Audit log detail retrieved successfully")
