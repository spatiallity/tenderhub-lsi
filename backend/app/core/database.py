import ssl
import uuid
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

is_sqlite = settings.DATABASE_URL.startswith("sqlite")

if is_sqlite:
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        connect_args={"check_same_thread": False},
    )
else:
    # Create SSL context for Supabase direct connection
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE

    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        pool_pre_ping=True,
        pool_size=5,           # Keep small to avoid exhaustion
        max_overflow=10,
        pool_timeout=10,       # Fail fast if no connection available
        pool_recycle=600,      # Recycle every 10 minutes
        connect_args={
            "ssl": ssl_ctx,
            "statement_cache_size": 0,
            "prepared_statement_cache_size": 0,
            "prepared_statement_name_func": lambda: f"__asyncpg_{uuid.uuid4().hex}__",
            "command_timeout": 15,   # Kill queries that take >15s
            "server_settings": {
                "application_name": "tenderhub_backend",
                "jit": "off",
                "statement_timeout": "15000",  # 15s statement timeout at DB level
            },
        },
    )

AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()  # Commit any pending transactions
        except Exception:
            await session.rollback()  # Rollback on error
            raise
        finally:
            await session.close()  # Always close the session


async def create_tables():
    from app.models import expert, keyword, watchlist  # noqa: F401
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
