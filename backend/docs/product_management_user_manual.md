# Product Management Module - User & Architecture Manual

## 1. Overview & Architecture

The **Product Management Module** is a core component of the quotation and e-commerce management application. It provides complete lifecycle management for electronic items, trainer kits, test instruments, and services.

### Key Architectural Highlights
- **FastAPI & SQLAlchemy 2.0 ORM**: Fully integrated with the existing database session management (`get_db`) and declarative base.
- **Hierarchical Categories**: Supports unlimited nested parent-child categories.
- **Master HSN & GST Configuration**: Decoupled HSN master table with rate calculations for CGST, SGST, IGST, and Cess.
- **Multi-Tier Pricing**: Supports COST, SELLING, DEALER, DISTRIBUTOR, EDUCATIONAL, and SPECIAL pricing tiers.
- **Dynamic Specifications**: Schema-less technical parameters attached per category or globally without fixed database columns.
- **Media & Document Management**: Supports multiple images, primary image toggling, and document attachments (datasheets, user manuals, test reports).
- **Publication Rules**: Product activation (`status: ACTIVE`) enforces validation of a minimum 3 images and mandatory category specifications.
- **Soft Deletion & Quotation Safety**: Preserves historical quotation integrity by soft-deleting products (`is_deleted = True`).
- **Catalog Management**: Dynamic product catalog creation with custom display pricing and visibility toggles.

---

## 2. Entity Model & Schema Summary

```
                      +-------------------+
                      |     Category      |<---+ (parent_id)
                      +-------------------+
                               |
                               v
+---------------+     +-------------------+     +-------------------------+
|   HSNMaster   |     |      Product      |---->| SpecificationDefinition |
+---------------+     +-------------------+     +-------------------------+
        |                      |                             |
        v                      v                             v
+---------------+     +-------------------+     +-------------------------+
|  ProductTax   |     | ProductMedia (3+) |     | ProductSpecification    |
+---------------+     +-------------------+     +-------------------------+
                               |
            +------------------+------------------+
            |                  |                  |
            v                  v                  v
    +---------------+  +---------------+  +-------------------+
    | ProductPrice  |  |ProductDocument|  |ProductWarranty/Pkg|
    +---------------+  +---------------+  +-------------------+
```

---

## 3. Comprehensive API Endpoints Reference

### Core Product Management
- `POST /api/v1/products` — Create new product with optional inline tax, pricing, specs, media, warranty, and packaging.
- `GET /api/v1/products` — List summary view of products with pagination, keyword search, category, brand, HSN, price range, and status filtering.
- `GET /api/v1/products/{product_id}` — **MANDATORY**: Detailed product view containing all nested relationships (category, tax, prices, specifications, media, documents, warranty, packaging, relationships, catalog associations).
- `PUT /api/v1/products/{product_id}` — Update basic product information.
- `DELETE /api/v1/products/{product_id}` — Soft delete product.

### Nested Sub-Resource Management
- **Images / Media**:
  - `POST /api/v1/products/{product_id}/images`
  - `GET /api/v1/products/{product_id}/images`
  - `PUT /api/v1/products/{product_id}/images/{image_id}`
  - `PUT /api/v1/products/{product_id}/images/{image_id}/set-primary`
  - `DELETE /api/v1/products/{product_id}/images/{image_id}`

- **Documents**:
  - `POST /api/v1/products/{product_id}/documents`
  - `GET /api/v1/products/{product_id}/documents`
  - `PUT /api/v1/products/{product_id}/documents/{document_id}`
  - `DELETE /api/v1/products/{product_id}/documents/{document_id}`

- **Dynamic Specifications**:
  - `POST /api/v1/products/{product_id}/specifications`
  - `GET /api/v1/products/{product_id}/specifications`
  - `PUT /api/v1/products/{product_id}/specifications/{specification_id}`
  - `DELETE /api/v1/products/{product_id}/specifications/{specification_id}`

- **Pricing Tiers**:
  - `POST /api/v1/products/{product_id}/prices`
  - `GET /api/v1/products/{product_id}/prices`
  - `PUT /api/v1/products/{product_id}/prices/{price_id}`
  - `DELETE /api/v1/products/{product_id}/prices/{price_id}`

- **Tax, Warranty & Packaging**:
  - `POST /api/v1/products/{product_id}/tax`
  - `POST /api/v1/products/{product_id}/warranty`
  - `POST /api/v1/products/{product_id}/packaging`

- **Relationships**:
  - `POST /api/v1/products/{product_id}/relationships`
  - `GET /api/v1/products/{product_id}/relationships`
  - `DELETE /api/v1/products/{product_id}/relationships/{relationship_id}`

### Master Data Management
- **Categories**: `POST`, `GET`, `GET /tree`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}` under `/api/v1/categories`.
- **HSN Master**: `POST`, `GET`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}` under `/api/v1/hsn`.
- **Specifications Definitions**: `POST`, `GET`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}` under `/api/v1/specifications/definitions`.
- **Catalogs**: `POST`, `GET`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}` and `/products` mapping endpoints under `/api/v1/catalogs`.

---

## 4. Key Workflows & Business Validation Rules

### 1. Product Publication / Activation Rule
When a product's status is updated to `ACTIVE` (or created with `status: ACTIVE`):
1. **Media Check**: The product must have at least **3 uploaded image records** in `product_media`.
2. **Specification Check**: All specification definitions marked as `is_required = True` for the product's category must be assigned to the product.

### 2. Primary Image Management
- Each product supports multiple images.
- Only one image can be flagged with `is_primary = True`. Setting an image as primary automatically unsets `is_primary` on all other images for that product.

### 3. Self-Referencing Guard
- Products cannot be added as relationships to themselves (`product_id != related_product_id`).

### 4. Catalog Management
- Products can be assigned to multiple catalogs with section tags, custom display prices, and display visibility toggles (`show_price`, `show_hsn`, `show_specifications`, `show_image`).

---

## 5. Security & RBAC Permissions

All endpoints enforce fine-grained JWT security and RBAC permissions:
- `PRODUCT_READ`, `PRODUCT_CREATE`, `PRODUCT_UPDATE`, `PRODUCT_DELETE`
- `CATEGORY_READ`, `CATEGORY_CREATE`, `CATEGORY_UPDATE`, `CATEGORY_DELETE`
- `HSN_READ`, `HSN_CREATE`, `HSN_UPDATE`, `HSN_DELETE`
- `SPECIFICATION_READ`, `SPECIFICATION_CREATE`, `SPECIFICATION_UPDATE`, `SPECIFICATION_DELETE`
- `CATALOG_READ`, `CATALOG_CREATE`, `CATALOG_UPDATE`, `CATALOG_DELETE`
