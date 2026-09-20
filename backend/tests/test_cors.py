from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_cors_preflight_workers_dev():
    headers = {
        "Origin": "https://kitrivo.dajenovas.workers.dev",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
    }
    response = client.options("/api/v1/auth/login", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "https://kitrivo.dajenovas.workers.dev"
    assert response.headers.get("access-control-allow-credentials") == "true"

def test_cors_preflight_any_workers_subdomain():
    headers = {
        "Origin": "https://custom-subdomain.workers.dev",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
    }
    response = client.options("/api/v1/auth/login", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "https://custom-subdomain.workers.dev"

def test_cors_preflight_vercel_app():
    headers = {
        "Origin": "https://kitrivo.vercel.app",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
    }
    response = client.options("/api/v1/auth/login", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "https://kitrivo.vercel.app"
