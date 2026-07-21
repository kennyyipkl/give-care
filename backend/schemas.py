from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ─── Auth Schemas ───

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    email: str = Field(..., max_length=255)
    password: str = Field(..., min_length=6, max_length=255)
    display_name: str = Field(..., min_length=1, max_length=100)


class UserLogin(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    display_name: str
    is_admin: bool
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ─── Event Schemas ───

class EventCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    date: str = Field(..., min_length=1, max_length=50)
    description: str = Field(..., min_length=1)
    donation_purpose: str = Field(..., min_length=1)
    status: str = Field(default="Upcoming")


class EventUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None
    description: Optional[str] = None
    donation_purpose: Optional[str] = None
    status: Optional[str] = None


class EventOut(BaseModel):
    id: int
    title: str
    date: str
    description: str
    donation_purpose: str
    status: str
    created_at: datetime
    updated_at: datetime
    photo_count: int = 0

    class Config:
        from_attributes = True


class EventList(BaseModel):
    events: List[EventOut]
    total: int


# ─── Photo Schemas ───

class PhotoCreate(BaseModel):
    event_id: int
    title: str = Field(..., min_length=1, max_length=255)
    uploaded_by: str = Field(..., min_length=1, max_length=100)
    story: str = Field(..., min_length=1)


class StoryGenerateRequest(BaseModel):
    event_title: str
    event_description: str
    photo_title: str
    donation_purpose: str


class StoryGenerateResponse(BaseModel):
    story: str


class PhotoOut(BaseModel):
    id: int
    event_id: int
    user_id: Optional[int] = None
    title: str
    uploaded_by: str
    story: str
    filename: str
    upload_date: datetime
    view_count: int
    share_count: int
    donate_count: int
    donation_amount: float = 0.0
    is_removed: bool
    event_title: Optional[str] = None

    class Config:
        from_attributes = True


class PhotoList(BaseModel):
    photos: List[PhotoOut]
    total: int


# ─── Donation Schema ───

class DonateRequest(BaseModel):
    amount: float = Field(default=1.0, gt=0, description="Donation amount in HKD")


class DonateResponse(BaseModel):
    message: str
    amount: float = 0.0


# ─── Dashboard Schemas ───

class TopPhoto(BaseModel):
    id: int
    title: str
    filename: str
    view_count: int
    share_count: int
    donate_count: int = 0
    donation_amount: float = 0.0

    class Config:
        from_attributes = True


class DashboardOut(BaseModel):
    total_events: int
    total_photos: int
    total_donations: int
    total_donation_amount: float = 0.0
    most_viewed_photo: Optional[TopPhoto] = None
    most_shared_photo: Optional[TopPhoto] = None


# ─── Admin: User List Schema ───

class UserListOut(BaseModel):
    users: List[UserOut]
    total: int