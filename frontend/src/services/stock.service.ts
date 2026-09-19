import Client from "@/api/Client";

export interface StockOverviewItem {
  product_id: number;
  sku: string;
  product_name: string;
  category_name?: string;
  price: number;
  stock_quantity: number;
  status: string;
  updated_at: string;
}

export interface StockSummaryResponse {
  total_products: number;
  total_stock_units: number;
  out_of_stock_count: number;
  low_stock_count: number;
  items: StockOverviewItem[];
}

export interface StockAdjustmentPayload {
  product_id: number;
  quantity_change: number;
  is_absolute?: boolean;
  notes?: string;
}

export interface StockTransaction {
  id: number;
  product_id: number;
  product_name?: string;
  change_amount: number;
  previous_quantity: number;
  new_quantity: number;
  transaction_type: string;
  reference_id?: string;
  notes?: string;
  created_at: string;
}

export class StockService {
  public static async getStockSummary(params?: { q?: string; category_id?: number; status?: string }) {
    const response = await Client.get("/stock", { params });
    return response.data;
  }

  public static async adjustStock(payload: StockAdjustmentPayload) {
    const response = await Client.post("/stock/adjust", payload);
    return response.data;
  }

  public static async getTransactions(limit: number = 50) {
    const response = await Client.get("/stock/transactions", { params: { limit } });
    return response.data;
  }

  public static async getLowStockAlerts() {
    const response = await Client.get("/stock/alerts");
    return response.data;
  }
}

export default StockService;
