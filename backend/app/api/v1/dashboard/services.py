from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_, extract

from app.models.bill import Bill
from app.models.quotation import Quotation
from app.models.product import Product, ProductCategory
from app.api.v1.dashboard.schemas import (
    DashboardResponse, StatCard, ChartPoint, RankingItem, RecentTransaction
)

def get_dashboard_analytics(db: Session) -> DashboardResponse:
    now = datetime.now(timezone.utc)
    current_year = now.year
    current_month = now.month

    # 1. Gather raw aggregations from Database
    # Paid Bills
    paid_bills = db.query(Bill).filter(Bill.status == "PAID").all()
    total_revenue = sum(b.total_amount for b in paid_bills) if paid_bills else 0.0

    # Total Quotations
    total_quotes_count = db.query(Quotation).count()
    active_quotes_count = db.query(Quotation).filter(Quotation.status == "GENERATED").count()

    # Total Bills
    total_bills_count = db.query(Bill).count()
    paid_bills_count = len(paid_bills)

    # Products and Stock
    total_products_count = db.query(Product).count()
    out_of_stock_count = db.query(Product).filter(
        or_(
            Product.stock_quantity <= 0,
            Product.status == "OUT_OF_STOCK",
            Product.status == "OUTOFSTOCK"
        )
    ).count()
    total_stock_units = db.query(func.sum(Product.stock_quantity)).scalar() or 0

    # Calculate month-over-month changes for current month vs previous month
    prev_month_dt = now.replace(day=1) - timedelta(days=1)
    prev_year = prev_month_dt.year
    prev_month = prev_month_dt.month

    # Revenue MoM
    this_month_rev = sum(
        b.total_amount for b in paid_bills
        if b.created_at and b.created_at.year == current_year and b.created_at.month == current_month
    )
    prev_month_rev = sum(
        b.total_amount for b in paid_bills
        if b.created_at and b.created_at.year == prev_year and b.created_at.month == prev_month
    )
    if prev_month_rev > 0:
        rev_pct = ((this_month_rev - prev_month_rev) / prev_month_rev) * 100
        rev_change_str = f"{rev_pct:+.1f}%"
        rev_change_type = "up" if rev_pct >= 0 else "down"
    elif this_month_rev > 0:
        rev_change_str = "+100%"
        rev_change_type = "up"
    else:
        rev_change_str = "+0%"
        rev_change_type = "neutral"

    # Quotations MoM
    this_month_quotes = db.query(Quotation).filter(
        extract("year", Quotation.created_at) == current_year,
        extract("month", Quotation.created_at) == current_month
    ).count()
    prev_month_quotes = db.query(Quotation).filter(
        extract("year", Quotation.created_at) == prev_year,
        extract("month", Quotation.created_at) == prev_month
    ).count()
    if prev_month_quotes > 0:
        q_pct = ((this_month_quotes - prev_month_quotes) / prev_month_quotes) * 100
        q_change_str = f"{q_pct:+.1f}%"
        q_change_type = "up" if q_pct >= 0 else "down"
    elif this_month_quotes > 0:
        q_change_str = "+100%"
        q_change_type = "up"
    else:
        q_change_str = "+0%"
        q_change_type = "neutral"

    # Bills MoM
    this_month_bills = db.query(Bill).filter(
        extract("year", Bill.created_at) == current_year,
        extract("month", Bill.created_at) == current_month
    ).count()
    prev_month_bills = db.query(Bill).filter(
        extract("year", Bill.created_at) == prev_year,
        extract("month", Bill.created_at) == prev_month
    ).count()
    if prev_month_bills > 0:
        b_pct = ((this_month_bills - prev_month_bills) / prev_month_bills) * 100
        b_change_str = f"{b_pct:+.1f}%"
        b_change_type = "up" if b_pct >= 0 else "down"
    elif this_month_bills > 0:
        b_change_str = "+100%"
        b_change_type = "up"
    else:
        b_change_str = "+0%"
        b_change_type = "neutral"

    # Construct 4 Live Stats Cards
    stats: List[StatCard] = [
        StatCard(
            id="revenue",
            title="Total Revenue",
            value=f"₹{total_revenue:,.2f}",
            numeric_value=total_revenue,
            change_percentage=rev_change_str,
            change_type=rev_change_type,
            subtitle="Live calculation from paid invoices",
            icon_type="revenue"
        ),
        StatCard(
            id="quotations",
            title="Total Quotations",
            value=str(total_quotes_count),
            numeric_value=float(total_quotes_count),
            change_percentage=q_change_str,
            change_type=q_change_type,
            subtitle=f"{active_quotes_count} currently active & valid",
            icon_type="quotation"
        ),
        StatCard(
            id="bills",
            title="Total Invoices",
            value=str(total_bills_count),
            numeric_value=float(total_bills_count),
            change_percentage=b_change_str,
            change_type=b_change_type,
            subtitle=f"{paid_bills_count} paid & settled orders",
            icon_type="invoice"
        ),
        StatCard(
            id="stock",
            title="Catalog & Inventory",
            value=f"{total_products_count} Products",
            numeric_value=float(total_products_count),
            change_percentage=f"{out_of_stock_count} out of stock",
            change_type="neutral" if out_of_stock_count == 0 else "down",
            subtitle=f"{total_stock_units} physical units in stock",
            icon_type="product"
        )
    ]

    # 2. Live Monthly Trend Chart Data (Past 6 Months)
    chart_data: List[ChartPoint] = []
    months_labels = []
    for i in range(5, -1, -1):
        d = now - timedelta(days=i * 30)
        months_labels.append((d.strftime("%b %Y"), d.year, d.month))

    for month_str, yr, mn in months_labels:
        month_paid_bills = [
            b for b in paid_bills
            if b.created_at and b.created_at.year == yr and b.created_at.month == mn
        ]
        month_quotes = db.query(Quotation).filter(
            extract("year", Quotation.created_at) == yr,
            extract("month", Quotation.created_at) == mn
        ).count()

        rev = sum(b.total_amount for b in month_paid_bills)
        b_cnt = db.query(Bill).filter(
            extract("year", Bill.created_at) == yr,
            extract("month", Bill.created_at) == mn
        ).count()

        chart_data.append(
            ChartPoint(
                month=month_str,
                revenue=round(rev, 2),
                quotations=month_quotes,
                bills=b_cnt
            )
        )

    # 3. Top Products Ranking List (Live Data from DB Products / Sales)
    ranking_list: List[RankingItem] = []
    
    # Calculate live sales from paid bills if available
    product_sales: Dict[str, Dict[str, Any]] = {}
    for b in paid_bills:
        if b.items and isinstance(b.items, list):
            for item in b.items:
                if isinstance(item, dict):
                    p_name = item.get("product_name") or item.get("title") or "Item"
                    qty = int(item.get("quantity") or 1)
                    tot = float(item.get("total") or (float(item.get("price", 0)) * qty))
                    if p_name not in product_sales:
                        product_sales[p_name] = {"quantity_sold": 0, "total_revenue": 0.0}
                    product_sales[p_name]["quantity_sold"] += qty
                    product_sales[p_name]["total_revenue"] += tot

    products_db = db.query(Product).all()
    
    if product_sales:
        sorted_sales = sorted(product_sales.items(), key=lambda x: x[1]["total_revenue"], reverse=True)[:5]
        max_rev = sorted_sales[0][1]["total_revenue"] if sorted_sales[0][1]["total_revenue"] > 0 else 1.0
        for rank_idx, (p_name, s_data) in enumerate(sorted_sales, start=1):
            matching_prod = next((p for p in products_db if p.product_name == p_name), None)
            cat_name = matching_prod.category.name if (matching_prod and matching_prod.category) else "Lab Equipment"
            first_img = None
            if matching_prod and isinstance(matching_prod.images, list) and len(matching_prod.images) > 0:
                first_img = matching_prod.images[0] if isinstance(matching_prod.images[0], str) else matching_prod.images[0].get("url")

            pct = round((s_data["total_revenue"] / max_rev) * 100, 1)
            ranking_list.append(
                RankingItem(
                    rank=rank_idx,
                    id=str(matching_prod.id) if matching_prod else f"sale-{rank_idx}",
                    title=p_name,
                    category=cat_name,
                    quantity_sold=s_data["quantity_sold"],
                    total_revenue=round(s_data["total_revenue"], 2),
                    percentage=pct,
                    image=first_img
                )
            )
    elif products_db:
        # If no sales recorded yet in paid bills, show top products by catalog price/stock
        sorted_prods = sorted(products_db, key=lambda p: p.price, reverse=True)[:5]
        max_price = sorted_prods[0].price if sorted_prods[0].price > 0 else 1.0
        for rank_idx, prod in enumerate(sorted_prods, start=1):
            cat_name = prod.category.name if prod.category else "Lab Equipment"
            first_img = None
            if isinstance(prod.images, list) and len(prod.images) > 0:
                first_img = prod.images[0] if isinstance(prod.images[0], str) else prod.images[0].get("url")

            ranking_list.append(
                RankingItem(
                    rank=rank_idx,
                    id=str(prod.id),
                    title=prod.product_name,
                    category=cat_name,
                    quantity_sold=0,
                    total_revenue=0.0,
                    percentage=round((prod.price / max_price) * 100, 1),
                    image=first_img
                )
            )

    # 4. Live Recent Transactions List (Latest Bills & Quotations from DB)
    all_recent: List[Dict[str, Any]] = []

    latest_bills = db.query(Bill).order_by(desc(Bill.created_at)).limit(5).all()
    for b in latest_bills:
        date_str = b.created_at.strftime("%b %d, %Y") if b.created_at else "Recently"
        all_recent.append({
            "created_at": b.created_at,
            "item": RecentTransaction(
                id=b.id,
                ref_number=b.bill_number,
                type="INVOICE",
                customer_name=b.customer_name,
                institution_name=b.institution_name or "Direct Client",
                date=date_str,
                amount=b.total_amount,
                status=b.status
            )
        })

    latest_quotes = db.query(Quotation).order_by(desc(Quotation.created_at)).limit(5).all()
    for q in latest_quotes:
        date_str = q.created_at.strftime("%b %d, %Y") if q.created_at else "Recently"
        all_recent.append({
            "created_at": q.created_at,
            "item": RecentTransaction(
                id=q.id,
                ref_number=q.quote_id,
                type="QUOTATION",
                customer_name=q.contact_name or "Prospect Client",
                institution_name=q.institution_name or "Educational Inst.",
                date=date_str,
                amount=q.total_amount,
                status=q.status
            )
        })

    # Sort combined recent items by created_at desc
    all_recent.sort(key=lambda x: x["created_at"] or datetime.min, reverse=True)
    recent_transactions: List[RecentTransaction] = [x["item"] for x in all_recent[:8]]

    return DashboardResponse(
        stats=stats,
        chart_data=chart_data,
        ranking_list=ranking_list,
        recent_transactions=recent_transactions
    )
