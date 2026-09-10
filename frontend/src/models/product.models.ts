export type ProductStatus = "ACTIVE" | "INACTIVE" | "OUTOFSTOCK" | "DISCONTINUED";

export interface Dimensions {
  height: number;
  height_unit: string;
  width: number;
  width_unit: string;
  length: number;
  length_unit: string;
  weight: number;
  weight_unit: string;
}

export interface CatalogDocument {
  title?: string;
  url: string;
  file_type?: string;
}

export interface WarrantyService {
  warranty_period: string;
  service_type?: string;
  terms?: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  code: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: number;
  product_id: string;
  product_name: string;
  category_id?: number;
  category?: ProductCategory;
  hsn_code?: string;
  model_number?: string;
  description?: string;
  price: number;
  status: ProductStatus;
  images: string[];
  specifications: Record<string, any>;
  catalog_document?: CatalogDocument;
  warranty_service?: WarrantyService;
  dimensions: Dimensions;
  created_at: string;
  updated_at: string;
}

export interface ProductCreatePayload {
  product_id: string;
  product_name: string;
  category_id: number;
  hsn_code?: string;
  model_number?: string;
  description?: string;
  price: number;
  status?: ProductStatus;
  images: string[];
  specifications?: Record<string, any>;
  catalog_document?: CatalogDocument;
  warranty_service?: WarrantyService;
  dimensions: Dimensions;
}

export interface ProductUpdatePayload {
  product_id?: string;
  product_name?: string;
  category_id?: number;
  hsn_code?: string;
  model_number?: string;
  description?: string;
  price?: number;
  status?: ProductStatus;
  images?: string[];
  specifications?: Record<string, any>;
  catalog_document?: CatalogDocument;
  warranty_service?: WarrantyService;
  dimensions?: Dimensions;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  skip: number;
  limit: number;
}
