from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.association import role_permissions

class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    code = Column(String(100), unique=True, index=True, nullable=False)
    module = Column(String(50), nullable=True, index=True)  # Module grouping (e.g. User, Role, Permission, Dashboard)
    description = Column(String(255), nullable=True)
    
    # UI Navigation & Menu specific fields
    is_menu = Column(Boolean, default=False, nullable=False)
    icon = Column(Text, nullable=True)  # Raw SVG string or icon class identifier
    path = Column(String(255), nullable=True)  # Frontend URL route path
    sort_order = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship to roles
    roles = relationship("Role", secondary=role_permissions, back_populates="permissions")
