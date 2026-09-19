from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class PaymentRecord(Base):
    __tablename__ = "payment_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    bill_id = Column(Integer, ForeignKey("bills.id", ondelete="CASCADE"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True, index=True)
    
    amount = Column(Float, nullable=False)
    payment_method = Column(String(50), default="DIRECT", nullable=False)  # CASH, UPI, BANK_TRANSFER, CHEQUE, CREDIT_CARD, DIRECT
    transaction_reference = Column(String(100), nullable=True)
    payment_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    notes = Column(Text, nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    bill = relationship("Bill", backref="payment_records")
    customer = relationship("Customer", backref="payment_records")
    created_by = relationship("User", backref="recorded_payments")
