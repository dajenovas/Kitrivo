from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class StockTransaction(Base):
    __tablename__ = "stock_transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    change_amount = Column(Integer, nullable=False)  # Positive for addition, negative for deduction
    previous_quantity = Column(Integer, nullable=False)
    new_quantity = Column(Integer, nullable=False)
    transaction_type = Column(String(50), nullable=False)  # STOCK_ADD, STOCK_ADJUST, PAYMENT_DEDUCTION
    reference_id = Column(String(100), nullable=True)  # Payment ID, Order ID, or User Note
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    product = relationship("Product", backref="stock_transactions")
