from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.response import APIResponse, api_response
from app.api.deps import get_db, get_current_active_user
from app.api.v1.dashboard.schemas import DashboardResponse
from app.api.v1.dashboard.services import get_dashboard_analytics

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard & Analytics"],
    dependencies=[Depends(get_current_active_user)]
)

@router.get("/stats", response_model=APIResponse[DashboardResponse])
def get_dashboard_stats(
    db: Session = Depends(get_db)
):
    """
    Retrieve aggregated dashboard statistics including stats cards, charts, and activity log.
    """
    data = get_dashboard_analytics(db)
    return api_response(data=data, message="Dashboard statistics retrieved successfully")


@router.get("/export")
def export_csv_report(
    report_type: str = "bills",  # bills, quotations, stock, customers
    db: Session = Depends(get_db)
):
    """
    Export reports (Bills, Quotations, Stock, Customers) as formatted CSV stream.
    """
    import csv
    import io
    from fastapi.responses import StreamingResponse
    from app.models.bill import Bill
    from app.models.quotation import Quotation
    from app.models.product import Product
    from app.models.customer import Customer

    output = io.StringIO()
    writer = csv.writer(output)

    if report_type.lower() == "quotations":
        writer.writerow(["Quote ID", "Institution", "Contact Name", "Email", "Phone", "Subtotal", "Tax", "Discount", "Total", "Status", "Valid Until", "Created At"])
        quotes = db.query(Quotation).order_by(Quotation.created_at.desc()).all()
        for q in quotes:
            writer.writerow([q.quote_id, q.institution_name, q.contact_name, q.email, q.phone, q.subtotal, q.tax_amount, q.discount_amount, q.total_amount, q.status, q.valid_until, q.created_at])
        filename = "Quotations_Report.csv"

    elif report_type.lower() == "stock":
        writer.writerow(["SKU / Product ID", "Product Name", "Price", "Stock Quantity", "Min Threshold", "Status"])
        products = db.query(Product).order_by(Product.product_name.asc()).all()
        for p in products:
            writer.writerow([p.product_id, p.product_name, p.price, p.stock_quantity, getattr(p, "min_stock_threshold", 5), p.status])
        filename = "Inventory_Stock_Report.csv"

    elif report_type.lower() == "customers":
        writer.writerow(["Customer Code", "Company / Institution Name", "Type", "Email", "Phone", "GSTIN", "State", "City"])
        customers = db.query(Customer).order_by(Customer.company_name.asc()).all()
        for c in customers:
            writer.writerow([c.customer_code, c.company_name, c.customer_type, c.email, c.phone, c.gstin, c.state, c.city])
        filename = "Customers_Report.csv"

    else:  # default bills
        writer.writerow(["Bill Number", "Quote ID", "Customer Name", "Institution", "Email", "Total Amount", "Amount Paid", "Balance Due", "Payment Status", "Payment Method", "Date"])
        bills = db.query(Bill).order_by(Bill.created_at.desc()).all()
        for b in bills:
            writer.writerow([b.bill_number, b.quote_id or "", b.customer_name, b.institution_name or "", b.email, b.total_amount, getattr(b, "amount_paid", b.total_amount), getattr(b, "balance_due", 0.0), getattr(b, "payment_status", b.status), b.payment_method, b.created_at])
        filename = "Invoices_Bills_Report.csv"

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

