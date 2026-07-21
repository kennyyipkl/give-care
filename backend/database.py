import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

load_dotenv(Path(__file__).parent / ".env", override=True)

DB_DIR = Path(__file__).parent / "db"
DB_PATH = DB_DIR / "pyworkflow.db"

# Detect production environment
IS_PRODUCTION = os.environ.get("IS_PRODUCTION", "").lower() == "true"
RAW_DATABASE_URL = os.environ.get("DATABASE_URL", "")

if IS_PRODUCTION and RAW_DATABASE_URL:
    # Production with PostgreSQL (e.g. Render)
    if RAW_DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = RAW_DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif RAW_DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = RAW_DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
    else:
        DATABASE_URL = f"postgresql+asyncpg://{RAW_DATABASE_URL}"
else:
    # Local dev or Koyeb (SQLite)
    DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{DB_PATH}")

engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def init_db():
    if not IS_PRODUCTION:
        DB_DIR.mkdir(exist_ok=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    async with AsyncSessionLocal() as db:
        yield db