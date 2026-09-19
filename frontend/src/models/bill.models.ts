
export interface BillItemModel {
    product_id?: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    total: number;
}

export interface BillModel {
    id: number;
    bill_number: string;
    quote_id?: string;
    user_id?: number;
    customer_id?: number;
    customer_name: string;
    institution_name?: string;
    email: string;
    phone?: string;
    billing_address?: string;
    items: BillItemModel[];
    subtotal: number;
    tax_amount: number;
    cgst_amount?: number;
    sgst_amount?: number;
    igst_amount?: number;
    is_interstate?: string;
    discount_amount: number;
    total_amount: number;
    amount_paid?: number;
    balance_due?: number;
    payment_method: string;
    payment_id?: string;
    status: string;
    payment_status?: string;
    created_at: string;
    updated_at: string;
}

export interface PaymentCreatePayload {
    amount: number;
    payment_method: string;
    transaction_reference?: string;
    notes?: string;
}

export interface PaymentRecordModel {
    id: number;
    bill_id: number;
    amount: number;
    payment_method: string;
    transaction_reference?: string;
    payment_date: string;
    notes?: string;
    created_at: string;
}

export interface BillCreatePayload {
    quote_id?: string;
    customer_name: string;
    institution_name?: string;
    email: string;
    phone?: string;
    billing_address?: string;
    items: BillItemModel[];
    subtotal: number;
    tax_amount?: number;
    discount_amount?: number;
    total_amount: number;
    payment_method?: string;
    payment_id?: string;
}