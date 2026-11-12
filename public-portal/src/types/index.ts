export type Availability = 'in_stock' | 'low_stock' | 'out_of_stock' | 'made_to_order' | 'unknown';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface SpecItem {
  label: string;
  value: string;
}

export interface VariantGroup {
  name: string;
  options: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  price: number | null;
  currency: string;
  images: string[];
  modelUrl: string | null;
  category: Category | null;
  availability: Availability;
  specs: SpecItem[];
  variants: VariantGroup[];
  featured: boolean;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  overview: string;
  objectives: string[];
  category: Category | null;
  images: string[];
  completedOn: string | null;
  location: string | null;
  client: string | null;
  services: string[];
  specs: SpecItem[];
  featured: boolean;
}

export interface CartItem {
  lineId: string;
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  unitPrice: number | null;
  currency: string;
  quantity: number;
  options: Record<string, string>;
  customization: string;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
}

export interface OrderRequest {
  reference: string;
  mode: 'order' | 'quote';
  customer: CustomerDetails;
  deliveryAddress: string;
  customizationRequirements: string;
  notes: string;
  items: CartItem[];
}

export interface OrderReceipt {
  reference: string;
  mode: 'order' | 'quote';
  placedAt: string;
  customer: CustomerDetails;
  deliveryAddress: string;
  notes: string;
  items: CartItem[];
  subtotal: number;
  currency: string;
  hasUnpricedItems: boolean;
}

export type InquiryType = 'general' | 'product' | 'project' | 'quote' | 'support';

export interface InquiryRequest {
  type: InquiryType;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}
