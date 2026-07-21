import datetime
import base64
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, func, Float
from sqlalchemy.orm import relationship
from database import Base, IS_RENDER


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    display_name = Column(String(100), nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    is_approved = Column(Boolean, default=False, nullable=False)  # New: admin must approve before login
    created_at = Column(DateTime, default=func.now(), nullable=False)

    photos = relationship("Photo", back_populates="user")


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    date = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    donation_purpose = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="Upcoming")  # Upcoming / Active / Closed
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    photos = relationship("Photo", back_populates="event", cascade="all, delete-orphan")


class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(255), nullable=False)
    uploaded_by = Column(String(100), nullable=False)
    story = Column(Text, nullable=False)
    filename = Column(String(500), nullable=False)
    upload_date = Column(DateTime, default=func.now(), nullable=False)
    view_count = Column(Integer, default=0, nullable=False)
    share_count = Column(Integer, default=0, nullable=False)
    donate_count = Column(Integer, default=0, nullable=False)
    donation_amount = Column(Float, default=0.0, nullable=False)
    is_removed = Column(Boolean, default=False, nullable=False)
    image_data = Column(Text, nullable=True)  # base64 encoded image (used in production, falls back to filename in dev)

    event = relationship("Event", back_populates="photos")
    user = relationship("User", back_populates="photos")

    @property
    def image_url(self) -> str:
        """Return the appropriate image URL depending on environment."""
        if self.image_data:
            # Extract MIME type from the data or default to image/jpeg
            if self.image_data.startswith("data:"):
                return self.image_data
            return f"data:image/jpeg;base64,{self.image_data}"
        return f"/api/uploads/{self.filename}"
