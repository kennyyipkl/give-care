from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models import Event, Photo
from schemas import DashboardOut, TopPhoto

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardOut)
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    # Total events
    events_result = await db.execute(select(func.count(Event.id)))
    total_events = events_result.scalar() or 0

    # Total non-removed photos
    photos_result = await db.execute(
        select(func.count(Photo.id)).where(Photo.is_removed == False)
    )
    total_photos = photos_result.scalar() or 0

    # Total donation clicks
    donations_result = await db.execute(
        select(func.coalesce(func.sum(Photo.donate_count), 0)).where(Photo.is_removed == False)
    )
    total_donations = donations_result.scalar() or 0

    # Total donation amount
    amount_result = await db.execute(
        select(func.coalesce(func.sum(Photo.donation_amount), 0)).where(Photo.is_removed == False)
    )
    total_donation_amount = float(amount_result.scalar() or 0)

    # Most viewed photo
    most_viewed_result = await db.execute(
        select(Photo)
        .where(Photo.is_removed == False)
        .order_by(Photo.view_count.desc())
        .limit(1)
    )
    most_viewed = most_viewed_result.scalar_one_or_none()

    # Most shared photo
    most_shared_result = await db.execute(
        select(Photo)
        .where(Photo.is_removed == False)
        .order_by(Photo.share_count.desc())
        .limit(1)
    )
    most_shared = most_shared_result.scalar_one_or_none()

    return DashboardOut(
        total_events=total_events,
        total_photos=total_photos,
        total_donations=total_donations,
        total_donation_amount=total_donation_amount,
        most_viewed_photo=TopPhoto.model_validate(most_viewed) if most_viewed else None,
        most_shared_photo=TopPhoto.model_validate(most_shared) if most_shared else None,
    )