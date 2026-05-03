from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://lsi:lsi_password@localhost:5432/lsi_tender"
    INAPROC_API_KEY: str = ""
    INAPROC_BASE_URL: str = "https://data.inaproc.id"
    USE_DUMMY_DATA: bool = True
    CACHE_TTL_MINUTES: int = 15
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
