from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)
    bill_number = Column(String(50), unique=True, index=True, nullable=False)
    quote_id = Column(String(50), index=True, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    customer_name = Column(String(255), nullable=False)
    institution_name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    billing_address = Column(Text, nullable=True)

    items = Column(JSON, nullable=False)  # List of dicts: product_id, product_name, quantity, unit_price, total
    subtotal = Column(Float, default=0.0, nullable=False)
    tax_amount = Column(Float, default=0.0, nullable=False)
    discount_amount = Column(Float, default=0.0, nullable=False)
    total_amount = Column(Float, default=0.0, nullable=False)

    payment_method = Column(String(50), default="DIRECT", nullable=False)  # RAZORPAY, CREDIT_CARD, BANK_TRANSFER, CASH_ON_DELIVERY, DIRECT
    payment_id = Column(String(100), nullable=True)
    status = Column(String(30), default="PAID", nullable=False)  # PAID, PENDING, CANCELLED

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship("User", backref="bills")
