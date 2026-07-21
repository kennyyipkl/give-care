import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import init_db, AsyncSessionLocal, IS_RENDER
from routers import auth, events, photos, dashboard, volunteers


@asynccontextmanager
async def lifespan(_: FastAPI):
    await init_db()
    # Seed admin account
    async with AsyncSessionLocal() as db:
        await auth.seed_admin(db)
    yield


app = FastAPI(title="Lifewire Event - Give Care API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files (local dev only; production uses base64 stored in DB)
if not IS_RENDER:
    uploads_dir = Path(__file__).parent / "uploads"
    uploads_dir.mkdir(exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# Include routers
app.include_router(auth.router)
app.include_router(events.router)
app.include_router(photos.router)
app.include_router(dashboard.router)
app.include_router(volunteers.router)


@app.get("/health")
async def health_check():
    return {"status": "ok"}
