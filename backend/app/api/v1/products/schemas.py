from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict, field_validator


class ProductStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    OUT_OF_STOCK = "OUT_OF_STOCK"
    OUTOFSTOCK = "OUTOFSTOCK"
    DISCONTINUED = "DISCONTINUED"


class DimensionsSchema(BaseModel):
    height: float = Field(..., description="Height value", ge=0)
    height_unit: str = Field("cm", description="Unit e.g. cm, mm, m, in")
    width: float = Field(..., description="Width value", ge=0)
    width_unit: str = Field("cm", description="Unit e.g. cm, mm, m, in")
    length: float = Field(..., description="Length value", ge=0)
    length_unit: str = Field("cm", description="Unit e.g. cm, mm, m, in")
    weight: float = Field(..., description="Weight value", ge=0)
    weight_unit: str = Field("kg", description="Unit e.g. kg, g, lbs")


class CatalogDocumentSchema(BaseModel):
    title: Optional[str] = Field(None, description="Catalog document title")
    url: str = Field(..., description="Document / PDF / Image URL")
    file_type: Optional[str] = Field("pdf", description="Document type e.g. pdf, doc, image")


class LabManualSchema(BaseModel):
    title: Optional[str] = Field(None, description="Lab manual title")
    url: str = Field(..., description="Lab manual PDF URL")
    file_type: Optional[str] = Field("pdf", description="File format e.g. pdf")


class DemoVideoSchema(BaseModel):
    title: Optional[str] = Field(None, description="Demo video title")
    url: str = Field(..., description="Demo video file URL (mp4, webm, etc.)")
    file_type: Optional[str] = Field("mp4", description="Video file format")


class WarrantyServiceSchema(BaseModel):
    warranty_period: str = Field(..., description="e.g. 12 Months, 2 Years")
    service_type: Optional[str] = Field("Onsite", description="Service type e.g. Onsite, Carry-in")
    terms: Optional[str] = Field(None, description="Warranty terms & service details")


# Category Schemas
class ProductCategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    code: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None


class ProductCategoryCreate(ProductCategoryBase):
    pass


class ProductCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=150)
    code: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None


class ProductCategoryResponse(ProductCategoryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Product Schemas
class ProductCreate(BaseModel):
    product_id: str = Field(..., min_length=1, max_length=100, description="Business SKU or Product ID e.g. PRD-1001")
    product_name: str = Field(..., min_length=1, max_length=255, description="Product Name")
    category_id: int = Field(..., description="ID of the associated ProductCategory")
    hsn_code: Optional[str] = Field(None, description="HSN Code")
    model_number: Optional[str] = Field(None, description="Model Number")
    description: Optional[str] = Field(None, description="Product Description")
    price: float = Field(..., ge=0, description="Product Price")
    stock_quantity: int = Field(0, ge=0, description="Initial stock quantity")
    status: Optional[ProductStatus] = Field(None, description="Status: ACTIVE, OUT_OF_STOCK, etc. (computed automatically if omitted)")
    
    images: List[str] = Field(..., description="List of image URLs. Minimum 3 images required.")
    specifications: Dict[str, Any] = Field(default_factory=dict, description="Dynamic Key-Value Product Specifications")
    
    catalog_document: Optional[CatalogDocumentSchema] = Field(None, description="Catalog document / PDF / image metadata")
    lab_manual: Optional[LabManualSchema] = Field(None, description="Lab manual PDF file metadata")
    demo_video: Optional[DemoVideoSchema] = Field(None, description="Demo video file metadata")
    warranty_service: Optional[WarrantyServiceSchema] = Field(None, description="Warranty and service terms")
    dimensions: DimensionsSchema = Field(..., description="Product dimensions with units")

    @field_validator("images")
    @classmethod
    def validate_min_images(cls, v: List[str]) -> List[str]:
        if not v or len(v) < 3:
            raise ValueError("Product must have a minimum of 3 images.")
        return v


class ProductUpdate(BaseModel):
    product_id: Optional[str] = Field(None, max_length=100)
    product_name: Optional[str] = Field(None, max_length=255)
    category_id: Optional[int] = None
    hsn_code: Optional[str] = None
    model_number: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    status: Optional[ProductStatus] = None
    images: Optional[List[str]] = None
    specifications: Optional[Dict[str, Any]] = None
    catalog_document: Optional[CatalogDocumentSchema] = None
    lab_manual: Optional[LabManualSchema] = None
    demo_video: Optional[DemoVideoSchema] = None
    warranty_service: Optional[WarrantyServiceSchema] = None
    dimensions: Optional[DimensionsSchema] = None

    @field_validator("images")
    @classmethod
    def validate_min_images(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if v is not None and len(v) < 3:
            raise ValueError("Product must have a minimum of 3 images.")
        return v


class ProductResponse(BaseModel):
    id: int
    product_id: str
    product_name: str
    category_id: Optional[int]
    category: Optional[ProductCategoryResponse] = None
    hsn_code: Optional[str] = None
    model_number: Optional[str] = None
    description: Optional[str] = None
    price: float
    stock_quantity: int = 0
    status: str
    images: List[str]
    specifications: Dict[str, Any]
    catalog_document: Optional[Dict[str, Any]] = None
    lab_manual: Optional[Dict[str, Any]] = None
    demo_video: Optional[Dict[str, Any]] = None
    warranty_service: Optional[Dict[str, Any]] = None
    dimensions: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)



class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    skip: int
    limit: int
