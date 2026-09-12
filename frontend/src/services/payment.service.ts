import Client from "@/api/Client";

export interface OrderItemInput {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface CreateOrderPayload {
  quotation_id?: string;
  items: OrderItemInput[];
  notes?: string;
}

export interface RazorpayOrderData {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  quotation_id?: string;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  quotation_id?: string;
  items: OrderItemInput[];
}

export class PaymentService {
  public static async createOrder(payload: CreateOrderPayload) {
    const response = await Client.post("/payments/create-order", payload);
    return response.data;
  }

  public static async verifyPayment(payload: VerifyPaymentPayload) {
    const response = await Client.post("/payments/verify", payload);
    return response.data;
  }
}

export default PaymentService;
