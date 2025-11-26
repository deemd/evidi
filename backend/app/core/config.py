import os
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # API Configuration
    APP_TITLE: str = "Evidi API"
    APP_DESCRIPTION: str = "Evidi Job Matching Platform API"
    APP_VERSION: str = "1.0.0"
    
    # MongoDB Configuration
    MONGO_URI: str = os.getenv("MONGO_URI")
    DB_NAME: str = "evidi-prod"
    USERS_COLLECTION_NAME: str = "users"
    JOB_OFFERS_COLLECTION_NAME: str = "job_offers"
    JOB_SOURCES_COLLECTION_NAME: str = "job_sources"
    
    # N8N Configuration
    N8N_WEBHOOK_URL: str = "http://localhost:5678/webhook/ai_pdf_summariser"
    
    # CORS Configuration
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5678",
        "https://test-vercel-pi-five.vercel.app",
        "https://evidi-frontend.vercel.app"
    ]
    
    # Environment
    ENVIRONMENT: str = "development"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()