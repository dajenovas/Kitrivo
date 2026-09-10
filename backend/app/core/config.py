import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "FastAPI RBAC & User Management API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # JWT Security Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
    ALGORITHM: str = "HS256"
    
    # Token Expiration Settings
    ACCESS_TOKEN_EXPIRE_SECONDS: int = 3600      # 1 hour (3600 seconds)
    REFRESH_TOKEN_EXPIRE_SECONDS: int = 86400    # 1 day (86400 seconds)
    
    # PostgreSQL Settings
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", "5432"))
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "root")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "fastapi_rbac_db")
    
    # Database Connection URL
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"postgresql://{os.getenv('POSTGRES_USER', 'postgres')}:{os.getenv('POSTGRES_PASSWORD', 'root')}@{os.getenv('POSTGRES_SERVER', 'localhost')}:{os.getenv('POSTGRES_PORT', '5432')}/{os.getenv('POSTGRES_DB', 'fastapi_rbac_db')}"
    )

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

settings = Settings()
