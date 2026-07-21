import os
import uuid
import shutil
import base64
import imghdr
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy import select, func, or_
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db, IS_PRODUCTION
from models import Event, Photo, User
from schemas import (
    PhotoCreate,
    PhotoOut,
    PhotoList,
    StoryGenerateRequest,
    StoryGenerateResponse,
    DonateRequest,
    DonateResponse,
)
from routers.auth import get_admin_user, get_optional_user

router = APIRouter(prefix="/photos", tags=["photos"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
if not IS_PRODUCTION:
    UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}


def generate_story(event_title: str, event_description: str, photo_title: str, donation_purpose: str) -> str:
    """Generate a warm, donation-driven story based on event and photo context."""
    templates = [
        f"This photo captures a heartfelt moment during the {event_title} event. {event_description} "
        f"Here we see '{photo_title}' — a powerful reminder of the difference we can make together. "
        f"{donation_purpose} Your generous support helps us reach more people in need and create lasting change in our community.",

        f"'{photo_title}' — a snapshot of compassion in action at the {event_title} event. "
        f"{event_description} This image reflects the spirit of giving and the joy of helping others. "
        f"{donation_purpose} By donating, you become part of this beautiful story of hope and kindness.",

        f"Through the lens of the {event_title} event, we see '{photo_title}' — volunteers and "
        f"beneficiaries coming together in a moment of genuine connection. {event_description} "
        f"{donation_purpose} Every contribution, no matter how small, helps us spread more care and "
        f"compassion to those who need it most. Join us in making a difference.",
    ]
    import random
    return random.choice(templates)


@router.get("", response_model=PhotoList)
async def list_photos(
    event_id: int = None,
    include_removed: bool = False,
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Photo, Event.title.label("event_title"))
        .join(Event, Photo.event_id == Event.id)
    )
    if event_id is not None:
        query = query.where(Photo.event_id == event_id)
    if not include_removed:
        query = query.where(Photo.is_removed == False)
    query = query.order_by(Photo.upload_date.desc())

    result = await db.execute(query)
    rows = result.all()
    photos = []
    for row in rows:
        photo = row[0]
        photo.event_title = row.event_title
        photos.append(photo)
    return PhotoList(photos=photos, total=len(photos))


@router.get("/all/gallery", response_model=PhotoList)
async def gallery_photos(
    search: str = Query(None, description="Search by title, uploaded_by, or event title"),
    db: AsyncSession = Depends(get_db),
):
    """Public gallery: list all non-removed photos across all events with optional search."""
    query = (
        select(Photo, Event.title.label("event_title"))
        .join(Event, Photo.event_id == Event.id)
        .where(Photo.is_removed == False)
    )
    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Photo.title.ilike(search_term),
                Photo.uploaded_by.ilike(search_term),
                Event.title.ilike(search_term),
            )
        )
    query = query.order_by(Photo.upload_date.desc())

    result = await db.execute(query)
    rows = result.all()
    photos = []
    for row in rows:
        photo = row[0]
        photo.event_title = row.event_title
        photos.append(photo)
    return PhotoList(photos=photos, total=len(photos))


@router.get("/{photo_id}", response_model=PhotoOut)
async def get_photo(photo_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Photo).where(Photo.id == photo_id))
    photo = result.scalar_one_or_none()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    # Increment view count
    photo.view_count += 1
    await db.commit()
    await db.refresh(photo)
    return photo


@router.post("", response_model=PhotoOut, status_code=201)
async def create_photo(
    event_id: int = Form(...),
    title: str = Form(...),
    uploaded_by: str = Form(...),
    story: str = Form(...),
    file: UploadFile = File(None),
    image_data: str = Form(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a photo. Accepts either:
    - `file` (multipart upload) — for local dev
    - `image_data` (base64 string) — for production / any environment
    """
    # Verify event exists
    event_result = await db.execute(select(Event).where(Event.id == event_id))
    event = event_result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    photo_args = {
        "event_id": event_id,
        "title": title,
        "uploaded_by": uploaded_by,
        "story": story,
    }

    if image_data:
        # --- Base64 path (production-friendly) ---
        # Strip data URL prefix if present
        raw = image_data
        if "," in raw:
            raw = raw.split(",")[1]
        # Decode to validate it's real image data
        try:
            img_bytes = base64.b64decode(raw)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid base64 image data")

        # Detect extension from bytes
        img_type = imghdr.what(None, h=img_bytes)
        if img_type not in ("jpeg", "png", "gif", "webp"):
            raise HTTPException(status_code=400, detail=f"Invalid image type '{img_type}'. Allowed: jpeg, png, gif, webp")

        ext = f".{img_type}" if img_type else ".jpg"
        unique_name = f"{uuid.uuid4().hex}{ext}"
        photo_args["filename"] = unique_name
        photo_args["image_data"] = image_data

        # Also save to disk for local dev fallback
        if not IS_PRODUCTION:
            file_path = UPLOAD_DIR / unique_name
            with open(file_path, "wb") as f:
                f.write(img_bytes)

    elif file:
        # --- File upload path (local dev) ---
        # Validate file extension
        ext = Path(file.filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"File type '{ext}' not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

        unique_name = f"{uuid.uuid4().hex}{ext}"
        file_path = UPLOAD_DIR / unique_name
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        photo_args["filename"] = unique_name
    else:
        raise HTTPException(status_code=400, detail="Either 'file' or 'image_data' is required")

    photo = Photo(**photo_args)
    db.add(photo)
    await db.commit()
    await db.refresh(photo)
    return photo


@router.post("/generate-story", response_model=StoryGenerateResponse)
async def generate_photo_story(data: StoryGenerateRequest):
    story = generate_story(
        event_title=data.event_title,
        event_description=data.event_description,
        photo_title=data.photo_title,
        donation_purpose=data.donation_purpose,
    )
    return StoryGenerateResponse(story=story)


@router.post("/{photo_id}/share", response_model=PhotoOut)
async def share_photo(photo_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Photo).where(Photo.id == photo_id))
    photo = result.scalar_one_or_none()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    photo.share_count += 1
    await db.commit()
    await db.refresh(photo)
    return photo


@router.post("/{photo_id}/donate", response_model=DonateResponse)
async def donate_photo(
    photo_id: int,
    data: DonateRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Photo).where(Photo.id == photo_id))
    photo = result.scalar_one_or_none()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    photo.donate_count += 1
    photo.donation_amount += data.amount
    await db.commit()
    return DonateResponse(
        message="Thank you for supporting this meaningful cause.",
        amount=data.amount,
    )


@router.put("/{photo_id}/remove", response_model=PhotoOut)
async def remove_photo(
    photo_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Admin: remove (hide) a photo from public gallery."""
    result = await db.execute(select(Photo).where(Photo.id == photo_id))
    photo = result.scalar_one_or_none()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    photo.is_removed = True
    await db.commit()
    await db.refresh(photo)
    return photo


@router.put("/{photo_id}/restore", response_model=PhotoOut)
async def restore_photo(
    photo_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Admin: restore a previously removed photo."""
    result = await db.execute(select(Photo).where(Photo.id == photo_id))
    photo = result.scalar_one_or_none()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    photo.is_removed = False
    await db.commit()
    await db.refresh(photo)
    return photo