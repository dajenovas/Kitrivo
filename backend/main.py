import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.response import api_response
from app.api.v1.router import api_v1_router
from app.seed import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed initial permissions, roles, and admin user
    init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Custom Exception Handlers for standard response format on errors
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=api_response(data=None, message=str(exc.detail), success=False),
        headers=exc.headers
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = jsonable_encoder(exc.errors())
    error_msg = errors[0]["msg"] if errors else "Validation Error"
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=api_response(data=errors, message=f"Validation error: {error_msg}", success=False)
    )

# CORS Middleware Configuration
cors_origins = settings.BACKEND_CORS_ORIGINS if isinstance(settings.BACKEND_CORS_ORIGINS, list) else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads storage directory exists
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), settings.UPLOADS_DIR)
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount(f"/{settings.UPLOADS_DIR}", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Mount /api/v1 Router
app.include_router(api_v1_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health"])
def root():
    return api_response(
        data={
            "version": settings.VERSION,
            "docs": "/docs",
            "api_v1_prefix": settings.API_V1_STR
        },
        message=f"Welcome to {settings.PROJECT_NAME}"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
