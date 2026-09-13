export interface ContactPerson {
    name: string;
    designation?: string;
    phone?: string;
    email?: string;
}

export interface CustomerDocument {
    title: string;
    url: string;
    file_type?: string;
    uploaded_at?: string;
}

export interface CustomerModel {
    id: number;
    customer_code: string;
    company_name: string;
    customer_type: 'COLLEGE' | 'UNIVERSITY' | 'POLYTECHNIC' | 'RESEARCH_LAB' | 'CORPORATE' | 'OTHER' | string;
    contact_persons: ContactPerson[];
    phone?: string;
    email?: string;
    billing_address?: string;
    shipping_address?: string;
    gstin?: string;
    pan?: string;
    state?: string;
    city?: string;
    notes?: string;
    documents: CustomerDocument[];
    total_business_value: number;
    outstanding_payments: number;
    quotations_count: number;
    orders_count: number;
    created_at: string;
    updated_at: string;
}

export interface CustomerTimelineEvent {
    id: string;
    date: string;
    title: string;
    description: string;
    event_type: 'ACCOUNT_CREATED' | 'QUOTATION_CREATED' | 'QUOTATION_CHECKED_OUT' | 'INVOICE_GENERATED' | 'PAYMENT_RECEIVED' | 'DISCOUNT_REQUESTED' | 'ORDER_DISPATCHED' | 'NOTE_ADDED' | string;
    reference_id?: string;
}

export interface CustomerDetailModel extends CustomerModel {
    previous_quotations: {
        id: number;
        quote_id: string;
        total_amount: number;
        status: string;
        created_at: string;
        valid_until: string;
        items_count: number;
    }[];
    previous_orders: {
        id: number;
        bill_number: string;
        quote_id?: string;
        total_amount: number;
        payment_method: string;
        status: string;
        created_at: string;
        items_count: number;
    }[];
    timeline: CustomerTimelineEvent[];
}

export interface CustomerCreatePayload {
    company_name: string;
    customer_type?: string;
    contact_persons?: ContactPerson[];
    phone?: string;
    email?: string;
    billing_address?: string;
    shipping_address?: string;
    gstin?: string;
    pan?: string;
    state?: string;
    city?: string;
    notes?: string;
    documents?: CustomerDocument[];
}

export interface CustomerUpdatePayload extends Partial<CustomerCreatePayload> {}
