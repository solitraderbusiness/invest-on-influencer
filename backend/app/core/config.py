import os
from typing import Any, Dict, List, Optional, Union

from pydantic import AnyHttpUrl, PostgresDsn
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Instagram Influencer Investment Analysis"
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database Configuration
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "influencer_analysis")
    SQLALCHEMY_DATABASE_URI: Optional[PostgresDsn] = None

    @validator("SQLALCHEMY_DATABASE_URI", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        return PostgresDsn.build(
            scheme="postgresql",
            user=values.get("POSTGRES_USER"),
            password=values.get("POSTGRES_PASSWORD"),
            host=values.get("POSTGRES_SERVER"),
            path=f"/{values.get('POSTGRES_DB') or ''}",
        )
    
    # Instagram Scraper Configuration
    PROXY_LIST: List[str] = []
    PROXY_ROTATION_INTERVAL: int = 10  # minutes
    REQUEST_TIMEOUT: int = 30  # seconds
    REQUEST_RETRY_COUNT: int = 3
    USER_AGENT_ROTATION: bool = True
    
    # Scoring Engine Configuration
    ENGAGEMENT_RATE_WEIGHT: float = 0.3
    FOLLOWER_GROWTH_WEIGHT: float = 0.2
    CONTENT_QUALITY_WEIGHT: float = 0.15
    AUDIENCE_QUALITY_WEIGHT: float = 0.2
    BRAND_ALIGNMENT_WEIGHT: float = 0.15

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()