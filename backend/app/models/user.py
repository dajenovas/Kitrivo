from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.association import user_roles

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    employee_id = Column(String(100), unique=True, index=True, nullable=True)
    full_name = Column(String(255), nullable=True)
    profile_picture = Column(Text, nullable=True)

    hashed_password = Column(String(255), nullable=False)
    
    is_active = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    roles = relationship("Role", secondary=user_roles, back_populates="users")
