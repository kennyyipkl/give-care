from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models import Event, Photo
from schemas import EventCreate, EventUpdate, EventOut, EventList

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=EventList)
async def list_events(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).order_by(Event.created_at.desc()))
    events = result.scalars().all()

    events_out = []
    for event in events:
        photo_count_result = await db.execute(
            select(func.count(Photo.id)).where(
                Photo.event_id == event.id,
                Photo.is_removed == False,
            )
        )
        photo_count = photo_count_result.scalar() or 0
        event_out = EventOut.model_validate(event)
        event_out.photo_count = photo_count
        events_out.append(event_out)

    return EventList(events=events_out, total=len(events_out))


@router.get("/{event_id}", response_model=EventOut)
async def get_event(event_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    photo_count_result = await db.execute(
        select(func.count(Photo.id)).where(
            Photo.event_id == event_id,
            Photo.is_removed == False,
        )
    )
    photo_count = photo_count_result.scalar() or 0
    event_out = EventOut.model_validate(event)
    event_out.photo_count = photo_count
    return event_out


@router.post("", response_model=EventOut, status_code=201)
async def create_event(data: EventCreate, db: AsyncSession = Depends(get_db)):
    event = Event(**data.model_dump())
    db.add(event)
    await db.commit()
    await db.refresh(event)
    event_out = EventOut.model_validate(event)
    event_out.photo_count = 0
    return event_out


@router.put("/{event_id}", response_model=EventOut)
async def update_event(event_id: int, data: EventUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(event, key, value)

    await db.commit()
    await db.refresh(event)

    photo_count_result = await db.execute(
        select(func.count(Photo.id)).where(
            Photo.event_id == event_id,
            Photo.is_removed == False,
        )
    )
    photo_count = photo_count_result.scalar() or 0
    event_out = EventOut.model_validate(event)
    event_out.photo_count = photo_count
    return event_out


@router.delete("/{event_id}", status_code=204)
async def delete_event(event_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    await db.delete(event)
    await db.commit()