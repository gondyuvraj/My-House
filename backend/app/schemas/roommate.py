from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.schemas.user import LifestylePreferences

class RoommatePostBase(BaseModel):
    post_type: str = "need_roommate" # "need_roommate" (has flat/room) or "looking_for_room" (seeker)
    title: str
    description: str
    city: str
    preferred_areas: List[str] = Field(default_factory=list)
    approx_rent: int = Field(..., gt=0)
    approx_deposit: int = Field(default=0, ge=0)
    available_from: str = "Immediate"
    gender_preference: str = "any" # male, female, any
    furnishing: Optional[str] = "semi-furnished"
    amenities: List[str] = Field(default_factory=list)
    images: List[str] = Field(default_factory=list)
    lifestyle: Optional[LifestylePreferences] = Field(default_factory=LifestylePreferences)

    # Extended Real-World Roommate Features
    property_bhk: Optional[str] = "2BHK" # "1RK", "1BHK", "2BHK", "3BHK", "4BHK", "Villa"
    room_type: Optional[str] = "Private Single Room" # "Private Single Room", "Shared (Twin Sharing)", "Master Bedroom (Attached Bath)", "Living Room"
    occupancy_type: Optional[str] = "single" # "single", "double"
    preferred_occupation: Optional[str] = "any" # "working", "student", "any"
    diet_preference: Optional[str] = "any" # "any", "veg_only", "non_veg_ok", "jain"
    smoking_policy: Optional[str] = "no_smoking" # "no_smoking", "balcony_only", "smoking_ok"
    drinking_policy: Optional[str] = "any" # "no_drinking", "social_ok", "any"
    work_schedule: Optional[str] = "hybrid" # "wfh", "office", "hybrid"
    maintenance_included: Optional[bool] = True
    utility_split_equal: Optional[bool] = True
    min_stay_months: Optional[int] = 3
    notice_period_days: Optional[int] = 30
    contact_mode: Optional[str] = "chat" # "chat", "whatsapp", "call"

class RoommatePostCreate(RoommatePostBase):
    pass

class RoommatePostUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    city: Optional[str] = None
    preferred_areas: Optional[List[str]] = None
    approx_rent: Optional[int] = None
    approx_deposit: Optional[int] = None
    available_from: Optional[str] = None
    gender_preference: Optional[str] = None
    furnishing: Optional[str] = None
    amenities: Optional[List[str]] = None
    images: Optional[List[str]] = None
    lifestyle: Optional[LifestylePreferences] = None
    property_bhk: Optional[str] = None
    room_type: Optional[str] = None
    occupancy_type: Optional[str] = None
    preferred_occupation: Optional[str] = None
    diet_preference: Optional[str] = None
    smoking_policy: Optional[str] = None
    drinking_policy: Optional[str] = None
    work_schedule: Optional[str] = None
    maintenance_included: Optional[bool] = None
    utility_split_equal: Optional[bool] = None
    min_stay_months: Optional[int] = None
    notice_period_days: Optional[int] = None
    contact_mode: Optional[str] = None
    status: Optional[str] = None # active, closed

class RoommatePostResponse(RoommatePostBase):
    id: str
    user_id: str
    user_name: str
    user_avatar: Optional[str] = None
    user_age: Optional[int] = None
    user_gender: Optional[str] = None
    user_occupation: Optional[str] = None
    user_verified: bool = False
    status: str = "active" # active, closed
    compatibility_score: Optional[int] = None
    compatibility_reasons: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime

class PaginatedRoommatesResponse(BaseModel):
    items: List[RoommatePostResponse]
    total: int
    page: int
    limit: int
    pages: int
