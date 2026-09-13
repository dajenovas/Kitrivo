import logging
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from app.models.user import User

logger = logging.getLogger(__name__)

def log_activity(
    db: Session,
    user: Optional[User],
    action: str,
    module: str,
    description: str,
    entity_type: Optional[str] = None,
    entity_id: Optional[Any] = None,
    changes_diff: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
) -> Optional[AuditLog]:
    """
    Utility function to log system-wide activity into the audit_logs table.
    """
    try:
        user_id = user.id if user else None
        user_email = user.email if user else "system@kitrivo.com"
        user_name = user.full_name or user.username if user else "System Automations"
        user_role = user.roles[0].name if (user and user.roles and len(user.roles) > 0) else "System"

        log_entry = AuditLog(
            user_id=user_id,
            user_email=user_email,
            user_name=user_name,
            user_role=user_role,
            action=action.upper(),
            module=module,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id is not None else None,
            description=description,
            changes_diff=changes_diff,
            ip_address=ip_address,
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry
    except Exception as e:
        logger.error(f"Failed to record audit log: {e}")
        db.rollback()
        return None
