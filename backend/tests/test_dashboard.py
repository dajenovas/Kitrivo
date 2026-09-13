import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from main import app
from app.core.database import Base, engine, SessionLocal
from app.core.security import create_access_token
from app.seed import seed_db
from app.models.user import User
from app.models.bill import Bill
from app.models.quotation import Quotation
from app.models.product import Product

client = TestClient(app)
auth_headers = {}

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    with engine.connect() as conn:
        if engine.name == "postgresql":
            from sqlalchemy import text
            conn.execute(text("DROP SCHEMA public CASCADE;"))
            conn.execute(text("CREATE SCHEMA public;"))
            conn.commit()
        else:
            Base.metadata.drop_all(bind=engine)
            
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_db(db)
        admin_user = db.query(User).filter(User.email == "admin@example.com").first()
        token = create_access_token(admin_user.id)
        global auth_headers
        auth_headers = {"Authorization": f"Bearer {token}"}
    finally:
        db.close()

def test_dashboard_stats_live_data():
    response = client.get("/api/v1/dashboard/stats", headers=auth_headers)
    assert response.status_code == 200
    json_resp = response.json()
    assert json_resp["success"] is True
    data = json_resp["data"]
    
    # Check stats array is returned
    assert "stats" in data
    assert len(data["stats"]) == 4

    # Verify live numbers match DB
    db = SessionLocal()
    try:
        total_products = db.query(Product).count()
        total_quotes = db.query(Quotation).count()
        total_bills = db.query(Bill).count()
        paid_bills = db.query(Bill).filter(Bill.status == "PAID").all()
        expected_revenue = sum(b.total_amount for b in paid_bills) if paid_bills else 0.0

        stats_map = {s["id"]: s for s in data["stats"]}
        assert stats_map["revenue"]["numeric_value"] == expected_revenue
        assert stats_map["quotations"]["numeric_value"] == float(total_quotes)
        assert stats_map["bills"]["numeric_value"] == float(total_bills)
        assert stats_map["stock"]["numeric_value"] == float(total_products)
    finally:
        db.close()

def test_payment_verify_with_quotation_id():
    db = SessionLocal()
    try:
        product = db.query(Product).first()
        product.stock_quantity = 10
        product.status = "ACTIVE"
        
        quote = db.query(Quotation).first()
        if not quote:
            from datetime import timedelta, timezone, datetime
            quote = Quotation(
                quote_id="QT-TEST-9999",
                items=[{"product_id": product.id, "quantity": 1}],
                subtotal=100.0,
                tax_amount=18.0,
                total_amount=118.0,
                valid_until=datetime.now(timezone.utc) + timedelta(days=7),
                status="GENERATED"
            )
            db.add(quote)
            db.commit()
            db.refresh(quote)

        quote_id = quote.quote_id
        db.commit()

        payload = {
            "razorpay_order_id": "order_test123",
            "razorpay_payment_id": "pay_test_999",
            "razorpay_signature": "test_dummy_signature",
            "quotation_id": quote_id,
            "items": [
                {
                    "product_id": product.id,
                    "product_name": product.product_name,
                    "quantity": 1,
                    "unit_price": product.price,
                    "total": product.price
                }
            ]
        }
        response = client.post("/api/v1/payments/verify", json=payload, headers=auth_headers)
        assert response.status_code == 200
        json_resp = response.json()
        assert json_resp["success"] is True
        assert json_resp["data"]["status"] == "SUCCESS"
    finally:
        db.close()
