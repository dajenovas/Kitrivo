import os
import sys

# Ensure backend root directory is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from main import app
from app.core.database import Base, engine, SessionLocal
from app.core.security import create_access_token
from app.seed import seed_db
from app.models.user import User

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
    yield
    with engine.connect() as conn:
        if engine.name == "postgresql":
            from sqlalchemy import text
            conn.execute(text("DROP SCHEMA public CASCADE;"))
            conn.execute(text("CREATE SCHEMA public;"))
            conn.commit()
        else:
            Base.metadata.drop_all(bind=engine)


def test_unauthenticated_request_returns_401():
    # Attempt request without Authorization header
    response = client.get("/api/v1/products")
    assert response.status_code == 401


def test_list_products():
    response = client.get("/api/v1/products", headers=auth_headers)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    data = res_data["data"]
    assert "items" in data
    assert data["total"] >= 2
    
    # Check category JOIN details in response
    first_product = data["items"][0]
    assert "category" in first_product
    assert first_product["category"] is not None
    assert "name" in first_product["category"]
    assert "images" in first_product
    assert len(first_product["images"]) >= 3


def test_get_product_by_id_and_sku():
    # Test fetch by business SKU
    response = client.get("/api/v1/products/PRD-DIG-001", headers=auth_headers)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    product = res["data"]
    assert product["product_id"] == "PRD-DIG-001"
    assert product["product_name"] == "Advanced Digital IC Trainer Kit"
    assert product["category"]["name"] == "Digital Trainers"
    assert product["specifications"]["Logic Family"] == "TTL / CMOS"

    # Test fetch by database numeric ID
    db_id = product["id"]
    response_by_id = client.get(f"/api/v1/products/{db_id}", headers=auth_headers)
    assert response_by_id.status_code == 200
    assert response_by_id.json()["data"]["product_id"] == "PRD-DIG-001"


def test_create_product_min_images_validation_fails():
    cat_res = client.get("/api/v1/products/categories", headers=auth_headers)
    cat_id = cat_res.json()["data"][0]["id"]

    invalid_payload = {
        "product_id": "PRD-FAIL-001",
        "product_name": "Test Product Invalid Images",
        "category_id": cat_id,
        "hsn_code": "1234.56.78",
        "price": 5000.0,
        "status": "ACTIVE",
        "images": [
            "https://example.com/img1.jpg",
            "https://example.com/img2.jpg"
        ],
        "specifications": {"Feature": "Value"},
        "dimensions": {
            "height": 10,
            "height_unit": "cm",
            "width": 10,
            "width_unit": "cm",
            "length": 10,
            "length_unit": "cm",
            "weight": 1,
            "weight_unit": "kg"
        }
    }

    response = client.post("/api/v1/products", json=invalid_payload, headers=auth_headers)
    assert response.status_code == 422


def test_create_product_success():
    cat_res = client.get("/api/v1/products/categories", headers=auth_headers)
    cat_id = cat_res.json()["data"][0]["id"]

    valid_payload = {
        "product_id": "PRD-OSC-003",
        "product_name": "Digital Storage Oscilloscope 100MHz",
        "category_id": cat_id,
        "hsn_code": "9030.20.00",
        "model_number": "DSO-1102X",
        "description": "2 Channel 100MHz Digital Storage Oscilloscope with 1GSa/s sampling rate.",
        "price": 32000.0,
        "status": "ACTIVE",
        "images": [
            "https://example.com/img1.jpg",
            "https://example.com/img2.jpg",
            "https://example.com/img3.jpg"
        ],
        "specifications": {
            "Bandwidth": "100 MHz",
            "Channels": "2 Analog Channels",
            "Sample Rate": "1 GSa/s",
            "Memory Depth": "14 Mpts"
        },
        "catalog_document": {
            "title": "DSO-1102X Datasheet",
            "url": "https://example.com/dso-1102x.pdf",
            "file_type": "pdf"
        },
        "warranty_service": {
            "warranty_period": "3 Years",
            "service_type": "Onsite",
            "terms": "3 Years manufacturer warranty"
        },
        "dimensions": {
            "height": 15.0,
            "height_unit": "cm",
            "width": 31.0,
            "width_unit": "cm",
            "length": 12.0,
            "length_unit": "cm",
            "weight": 3.5,
            "weight_unit": "kg"
        }
    }

    response = client.post("/api/v1/products", json=valid_payload, headers=auth_headers)
    assert response.status_code == 201
    res = response.json()
    assert res["success"] is True
    data = res["data"]
    assert data["product_id"] == "PRD-OSC-003"
    assert len(data["images"]) == 3
    assert data["specifications"]["Bandwidth"] == "100 MHz"


def test_update_product():
    response = client.put(
        "/api/v1/products/PRD-OSC-003",
        json={"price": 31000.0, "status": "OUTOFSTOCK"},
        headers=auth_headers
    )
    assert response.status_code == 200
    res = response.json()
    assert res["data"]["price"] == 31000.0
    assert res["data"]["status"] == "OUTOFSTOCK"


def test_delete_product():
    response = client.delete("/api/v1/products/PRD-OSC-003", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["success"] is True

    # Verify deleted product returns 404
    get_res = client.get("/api/v1/products/PRD-OSC-003", headers=auth_headers)
    assert get_res.status_code == 404
