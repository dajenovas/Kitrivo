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
from app.api.v1.auth.service import build_user_profile

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
        admin_user.profile_picture = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        db.commit()
        token = create_access_token(admin_user.id)
        global auth_headers
        auth_headers = {"Authorization": f"Bearer {token}"}
    finally:
        db.close()

def test_build_user_profile_includes_profile_picture():
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.email == "admin@example.com").first()
        profile = build_user_profile(admin_user, db)
        assert profile.profile_picture is not None
        assert profile.profile_picture.startswith("data:image/png;base64")
    finally:
        db.close()

def test_update_profile_api_returns_profile_picture():
    pic_data = "data:image/jpeg;base64,testdata"
    response = client.put(
        "/api/v1/auth/me/profile",
        json={"full_name": "Admin User Updated", "profile_picture": pic_data},
        headers=auth_headers
    )
    assert response.status_code == 200
    json_resp = response.json()
    assert json_resp["success"] is True
    assert json_resp["data"]["profile_picture"] == pic_data

def test_update_profile_creates_audit_log():
    from app.models.audit_log import AuditLog
    response = client.put(
        "/api/v1/auth/me/profile",
        json={"full_name": "John Doe Audit Test"},
        headers=auth_headers
    )
    assert response.status_code == 200

    db = SessionLocal()
    try:
        log_entry = db.query(AuditLog).filter(
            AuditLog.module == "User Profile",
            AuditLog.action == "UPDATE"
        ).order_by(AuditLog.id.desc()).first()
        assert log_entry is not None
        assert "John Doe Audit Test" in log_entry.description
        assert log_entry.changes_diff.get("full_name") == "John Doe Audit Test"
    finally:
        db.close()
