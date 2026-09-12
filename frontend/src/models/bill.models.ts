
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
    customer_name: string;
    institution_name?: string;
    email: string;
    phone?: string;
    billing_address?: string;
    items: BillItemModel[];
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    payment_method: string;
    payment_id?: string;
    status: string;
    created_at: string;
    updated_at: string;
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