from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class ProductCategory(Base):
    __tablename__ = "product_category"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), nullable=False, index=True)
    code = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    products = relationship("Product", back_populates="category", cascade="all, delete-orphan")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(String(100), unique=True, index=True, nullable=False)  # Business Product ID / SKU
    product_name = Column(String(255), index=True, nullable=False)
    category_id = Column(Integer, ForeignKey("product_category.id", ondelete="SET NULL"), nullable=True, index=True)
    hsn_code = Column(String(50), nullable=True)
    model_number = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    price = Column(Float, default=0.0, nullable=False)
    stock_quantity = Column(Integer, default=0, nullable=False)  # Stock level; <= 0 triggers OUT_OF_STOCK
    status = Column(String(50), default="OUT_OF_STOCK", nullable=False, index=True)  # ACTIVE, OUT_OF_STOCK, INACTIVE, DISCONTINUED
    
    # Flexible JSON fields
    images = Column(JSON, nullable=False, default=list)  # Minimum 3 images enforced via schema
    specifications = Column(JSON, nullable=False, default=dict)  # Dynamic product specs e.g. {"Input Voltage": "230V AC", ...}
    catalog_document = Column(JSON, nullable=True)  # Document | PDF | Image metadata e.g. {"url": "...", "title": "..."}
    lab_manual = Column(JSON, nullable=True)  # Lab Manual PDF metadata e.g. {"url": "...", "title": "..."}
    demo_video = Column(JSON, nullable=True)  # Demo Video file metadata e.g. {"url": "...", "title": "..."}
    warranty_service = Column(JSON, nullable=True)  # Warranty & service details
    dimensions = Column(JSON, nullable=False, default=dict)  # height, width, length, weight all with units

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship to ProductCategory
    category = relationship("ProductCategory", back_populates="products", lazy="joined")
