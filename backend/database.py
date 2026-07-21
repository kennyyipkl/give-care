import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

load_dotenv(Path(__file__).parent / ".env", override=True)

DB_DIR = Path(__file__).parent / "db"
DB_PATH = DB_DIR / "pyworkflow.db"

# Detect production (Render) vs local dev
IS_RENDER = os.environ.get("RENDER", "").lower() == "true"
RAW_DATABASE_URL = os.environ.get("DATABASE_URL", "")

if IS_RENDER:
    # Render PostgreSQL: asyncpg needs the URL to start with postgresql+asyncpg://
    # Render gives postgresql://user:pass@host/db — we need to add +asyncpg
    if RAW_DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = RAW_DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif RAW_DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = RAW_DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
    else:
        DATABASE_URL = f"postgresql+asyncpg://{RAW_DATABASE_URL}"
else:
    DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{DB_PATH}")

engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def init_db():
    if not IS_RENDER:
        DB_DIR.mkdir(exist_ok=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    async with AsyncSessionLocal() as db:
        yield db