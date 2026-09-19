export interface QuoteItemPayload {
    product_id: string;
    product_name: string;
    model_number?: string;
    price: number;
    quantity: number;
    total: number;
}

export interface QuotationCreatePayload {
    items: QuoteItemPayload[];
    institution_name?: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    billing_address?: string;
    notes?: string;
    subtotal?: number;
    tax_amount?: number;
    discount_amount?: number;
    total_amount?: number;
    valid_until?: string; // ISO date string
}

export interface QuotationUpdatePayload {
    items?: QuoteItemPayload[];
    institution_name?: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    billing_address?: string;
    notes?: string;
    discount_amount?: number;
    valid_until?: string;
}

export interface QuotationCheckoutPayload {
    customer_name: string;
    institution_name?: string;
    email: string;
    phone: string;
    shipping_address: string;
    payment_method?: string;
    notes?: string;
}

export interface QuotationModel {
    id: number;
    quote_id: string;
    user_id?: number;
    items: QuoteItemPayload[];
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    valid_until: string;
    status: string;
    is_valid: boolean;
    institution_name?: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    billing_address?: string;
    notes?: string;
    bill_number?: string;
    converted_bill_id?: number;
    created_at: string;
    updated_at: string;
}

export interface ConvertToBillResponse {
    bill_id: number;
    bill_number: string;
    total_amount: number;
}

export interface SendEmailPayload {
    to_email: string;
    custom_message?: string;
}