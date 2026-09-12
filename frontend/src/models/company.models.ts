export interface Company {
  id: number;
  company_name: string;
  logo_url?: string | null;
  gst_number?: string | null;
  pan_number?: string | null;
  address?: string | null;
  billing_address?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyCreatePayload {
  company_name: string;
  logo_url?: string;
  gst_number?: string;
  pan_number?: string;
  address?: string;
  billing_address?: string;
  email?: string;
  phone?: string;
  website?: string;
  is_active?: boolean;
}

export interface CompanyUpdatePayload {
  company_name?: string;
  logo_url?: string;
  gst_number?: string;
  pan_number?: string;
  address?: string;
  billing_address?: string;
  email?: string;
  phone?: string;
  website?: string;
  is_active?: boolean;
}
