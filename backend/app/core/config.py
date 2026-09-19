import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "FastAPI RBAC & User Management API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # JWT Security Settings
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    
    # Token Expiration Settings
    ACCESS_TOKEN_EXPIRE_SECONDS: int = 3600      # 1 hour
    REFRESH_TOKEN_EXPIRE_SECONDS: int = 86400    # 1 day
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: Union[List[str], str] = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "https://kitrivo.jenovas.dev"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        return ["*"]
    
    # Database Connection URL (SQLite or PostgreSQL)
    DATABASE_URL: str = "sqlite:///./app.db"
    
    # Uploads Storage Directory
    UPLOADS_DIR: str = "uploads"

    # Razorpay Payment Gateway Credentials
    RAZORPAY_KEY_ID: str = "rzp_test_TbSFJthcl7A9jF"
    RAZORPAY_KEY_SECRET: str = "TxHllkzu0J44PBQqTguCdRZa"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
