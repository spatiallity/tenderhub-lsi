from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://lsi:lsi_password@localhost:5432/lsi_tender"
    INAPROC_API_KEY: str = ""
    INAPROC_BASE_URL: str = "https://data.inaproc.id"
    USE_DUMMY_DATA: bool = True
    CACHE_TTL_MINUTES: int = 15

    # CORS — comma-separated list of allowed origins
    # Dev default is permissive; production should set this explicitly via env var
    CORS_ORIGINS: str = (
        "http://localhost:5173,"
        "http://localhost:5174,"
        "http://localhost:3000,"
        "http://127.0.0.1:5173,"
        "http://127.0.0.1:5174"
    )

    # Supabase JWT verification
    # Get from: Supabase Dashboard → Settings → API → JWT Secret
    SUPABASE_JWT_SECRET: str = ""

    # Supabase REST API — for role lookups
    # Get from: Supabase Dashboard → Settings → API
    SUPABASE_URL: str = ""           # e.g. https://aedojcjkhorogsgwasab.supabase.co
    SUPABASE_SERVICE_KEY: str = ""   # service_role key (not anon key)

    # Set to true in local development to bypass JWT checks
    SKIP_AUTH: bool = False

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
