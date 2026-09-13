export interface StatCardData {
    id: string;
    title: string;
    value: string;
    numeric_value: number;
    change_percentage: string;
    change_type: 'up' | 'down' | 'neutral';
    subtitle: string;
    icon_type: 'revenue' | 'quotation' | 'invoice' | 'product';
}

export interface ChartPointData {
    month: string;
    revenue: number;
    quotations: number;
    bills: number;
}

export interface RankingItemData {
    rank: number;
    id: string;
    title: string;
    category: string;
    quantity_sold: number;
    total_revenue: number;
    percentage: number;
    image?: string | null;
}

export interface RecentTransactionData {
    id: number;
    ref_number: string;
    type: 'INVOICE' | 'QUOTATION';
    customer_name: string;
    institution_name?: string | null;
    date: string;
    amount: number;
    status: string;
}

export interface DashboardAnalyticsResponse {
    stats: StatCardData[];
    chart_data: ChartPointData[];
    ranking_list: RankingItemData[];
    recent_transactions: RecentTransactionData[];
}
