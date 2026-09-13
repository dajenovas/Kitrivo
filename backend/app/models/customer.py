from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_code = Column(String(50), unique=True, index=True, nullable=False)  # e.g. CUST-2026-0001
    company_name = Column(String(255), index=True, nullable=False)  # Institution / College / University / Company
    customer_type = Column(String(50), default="COLLEGE", nullable=False, index=True)  # COLLEGE, UNIVERSITY, POLYTECHNIC, RESEARCH_LAB, CORPORATE, OTHER

    # Dynamic list of contact persons: [{"name": "...", "designation": "...", "phone": "...", "email": "..."}]
    contact_persons = Column(JSON, nullable=False, default=list)
    
    phone = Column(String(50), nullable=True, index=True)
    email = Column(String(255), nullable=True, index=True)
    
    billing_address = Column(Text, nullable=True)
    shipping_address = Column(Text, nullable=True)
    
    gstin = Column(String(50), nullable=True, index=True)
    pan = Column(String(50), nullable=True)
    
    state = Column(String(100), nullable=True, index=True)
    city = Column(String(100), nullable=True, index=True)
    notes = Column(Text, nullable=True)

    # Documents array: [{"title": "...", "url": "...", "file_type": "...", "uploaded_at": "..."}]
    documents = Column(JSON, nullable=False, default=list)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    quotations = relationship("Quotation", back_populates="customer", cascade="all, delete-orphan")
    bills = relationship("Bill", back_populates="customer", cascade="all, delete-orphan")
