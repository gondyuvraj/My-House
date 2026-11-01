from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class GeoLocation(BaseModel):
    type: str = "Point"
    coordinates: List[float] # [lng, lat]

class ListingBase(BaseModel):
    title: str
    description: str
    type: str = "PG" # PG, Room, 1RK, 1BHK, 2BHK, 3BHK, 4BHK, Shared room
    gender_preference: str = "any" # male, female, any
    rent: int = Field(..., gt=0)
    deposit: int = Field(default=0, ge=0)
    maintenance: int = Field(default=0, ge=0)
    available_from: str # YYYY-MM-DD or immediate
    city: str
    area: str
    full_address: str
    lat: float
    lng: float
    furnishing: str = "semi-furnished" # unfurnished, semi-furnished, fully-furnished
    amenities: List[str] = Field(default_factory=list)
    house_rules: List[str] = Field(default_factory=list)
    nearby_places: List[str] = Field(default_factory=list)
    contact_preference: str = "both" # call, chat, both
    images: List[str] = Field(default_factory=list)

class ListingCreate(ListingBase):
    pass

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    gender_preference: Optional[str] = None
    rent: Optional[int] = None
    deposit: Optional[int] = None
    maintenance: Optional[int] = None
    available_from: Optional[str] = None
    city: Optional[str] = None
    area: Optional[str] = None
    full_address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    furnishing: Optional[str] = None
    amenities: Optional[List[str]] = None
    house_rules: Optional[List[str]] = None
    nearby_places: Optional[List[str]] = None
    contact_preference: Optional[str] = None
    images: Optional[List[str]] = None
    status: Optional[str] = None # active, inactive

class ListingResponse(ListingBase):
    id: str
    owner_id: str
    owner_name: str
    owner_avatar: Optional[str] = None
    owner_phone: Optional[str] = None
    owner_verified: bool = False
    owner_calling_hours: Optional[str] = "9:00 AM - 8:00 PM"
    owner_languages: List[str] = Field(default_factory=lambda: ["English", "Hindi"])
    owner_host_type: Optional[str] = "Individual Owner"
    owner_provides_agreement: Optional[bool] = True
    status: str = "active" # active, inactive, pending, rejected
    views_count: int = 0
    favorites_count: int = 0
    inquiries_count: int = 0
    avg_rating: float = 0.0
    reviews_count: int = 0
    distance_km: Optional[float] = None
    is_favorited: Optional[bool] = False
    created_at: datetime
    updated_at: datetime

class PaginatedListingsResponse(BaseModel):
    items: List[ListingResponse]
    total: int
    page: int
    limit: int
    pages: int

