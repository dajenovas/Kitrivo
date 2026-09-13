from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    user_email = Column(String(255), nullable=True, index=True)
    user_name = Column(String(255), nullable=True)
    user_role = Column(String(100), nullable=True)
    
    action = Column(String(50), nullable=False, index=True)  # CREATE, UPDATE, DELETE, LOGIN, PASSWORD_RESET, STATUS_CHANGE
    module = Column(String(100), nullable=False, index=True)  # Users, Roles, Permissions, Products, Stock, Quotations, Customers, Companies, Auth, Payments
    entity_type = Column(String(100), nullable=True, index=True)  # Customer, Product, Quotation, User, etc.
    entity_id = Column(String(100), nullable=True, index=True)
    
    description = Column(Text, nullable=False)
    changes_diff = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    user = relationship("User")
