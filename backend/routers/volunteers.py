from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import Column, Integer, String, Text, DateTime, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import relationship
from typing import Optional, List
from datetime import datetime

from database import Base, get_db

router = APIRouter(prefix="/volunteers", tags=["volunteers"])


# ─── Model ───

class Volunteer(Base):
    __tablename__ = "volunteers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    event_title = Column(String(255), nullable=False)
    message = Column(Text, nullable=True)
    status = Column(String(20), default="pending", nullable=False)  # pending / confirmed
    created_at = Column(DateTime, default=func.now(), nullable=False)


# ─── Schemas ───

class VolunteerCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., max_length=255)
    phone: Optional[str] = None
    event_title: str = Field(..., min_length=1, max_length=255)
    message: Optional[str] = None


class VolunteerOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    event_title: str
    message: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class VolunteerList(BaseModel):
    volunteers: List[VolunteerOut]
    total: int


# ─── Routes ───

@router.post("", response_model=VolunteerOut)
async def create_volunteer(data: VolunteerCreate, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select
    entry = Volunteer(
        name=data.name,
        email=data.email,
        phone=data.phone,
        event_title=data.event_title,
        message=data.message,
        status="pending",
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.get("", response_model=VolunteerList)
async def list_volunteers(db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select
    result = await db.execute(select(Volunteer).order_by(Volunteer.created_at.desc()))
    volunteers = result.scalars().all()
    return VolunteerList(volunteers=volunteers, total=len(volunteers))