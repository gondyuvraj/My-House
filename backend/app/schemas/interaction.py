from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Visit Request ---
class VisitRequestCreate(BaseModel):
    listing_id: str
    visit_date: str # YYYY-MM-DD
    visit_time_slot: str # e.g. "10:00 AM - 11:00 AM"
    notes: Optional[str] = None

class VisitRequestStatusUpdate(BaseModel):
    status: str # "accepted", "declined", "completed", "cancelled"

class VisitRequestResponse(BaseModel):
    id: str
    listing_id: str
    listing_title: str
    listing_image: Optional[str] = None
    listing_city: Optional[str] = None
    listing_area: Optional[str] = None
    seeker_id: str
    seeker_name: str
    seeker_phone: Optional[str] = None
    owner_id: str
    owner_name: Optional[str] = None
    visit_date: str
    visit_time_slot: str
    notes: Optional[str] = None
    status: str # "pending", "accepted", "declined", "completed", "cancelled"
    created_at: datetime
    updated_at: datetime

# --- Review ---
class ReviewCreate(BaseModel):
    target_id: str # listing_id or user_id
    target_type: str = "listing" # "listing" or "roommate"
    rating: int = Field(..., ge=1, le=5)
    comment: str

class ReviewResponse(BaseModel):
    id: str
    target_id: str
    target_type: str
    author_id: str
    author_name: str
    author_avatar: Optional[str] = None
    rating: int
    comment: str
    created_at: datetime

# --- Report ---
class ReportCreate(BaseModel):
    reported_type: str # "listing" or "user"
    reported_id: str
    reason: str
    details: Optional[str] = None

class ReportStatusUpdate(BaseModel):
    status: str # "pending", "resolved", "dismissed"

class ReportResponse(BaseModel):
    id: str
    reporter_id: str
    reporter_name: str
    reported_type: str
    reported_id: str
    reported_title: Optional[str] = None
    reason: str
    details: Optional[str] = None
    status: str # "pending", "resolved", "dismissed"
    created_at: datetime

# --- Notification ---
class NotificationResponse(BaseModel):
    id: str
    user_id: str
    type: str # "message", "visit_request", "visit_status", "price_drop", "match", "report"
    title: str
    message: str
    link: Optional[str] = None
    read: bool = False
    created_at: datetime

# --- Chat & Messaging ---
class MessageCreate(BaseModel):
    receiver_id: str
    content: str
    media_url: Optional[str] = None

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    sender_name: str
    sender_avatar: Optional[str] = None
    receiver_id: str
    content: str
    media_url: Optional[str] = None
    is_read: bool = False
    created_at: datetime

class ConversationResponse(BaseModel):
    id: str
    other_user_id: str
    other_user_name: str
    other_user_avatar: Optional[str] = None
    other_user_online: bool = False
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None
    unread_count: int = 0

