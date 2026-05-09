import asyncio
from logging.config import fileConfig
from sqlalchemy.engine import Connection
from alembic import context

from app.core.config import settings
from app.core.database import Base, engine as app_engine
from app.models import *  # Import all models

config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations() -> None:
    # Reuse the app engine (already configured with ``statement_cache_size=0``
    # and matching SSL / server_settings for Supabase's pgbouncer pooler).
    # A fresh ``async_engine_from_config`` would fall back to asyncpg defaults
    # and blow up with ``DuplicatePreparedStatementError`` against pgbouncer.
    async with app_engine.connect() as connection:
        await connection.run_sync(do_run_migrations)

def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
