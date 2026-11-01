from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class LifestylePreferences(BaseModel):
    smoking: str = "never" # never, occasionally, regular
    drinking: str = "never" # never, occasionally, regular
    food_preference: str = "any" # veg, non-veg, vegan, any
    sleep_schedule: str = "flexible" # early_bird, night_owl, flexible
    cleanliness: int = Field(default=3, ge=1, le=5) # 1-5 scale
    guests_allowed: bool = True
    pets_allowed: bool = False
    noise_level: str = "moderate" # quiet, moderate, lively
    work_from_home: bool = False

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: str = "seeker" # seeker, owner, admin
    avatar_url: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = "other" # male, female, other
    occupation: Optional[str] = "working" # student, working, other
    city: Optional[str] = "Pune"
    bio: Optional[str] = None
    languages: List[str] = Field(default_factory=list)
    budget_min: Optional[int] = 5000
    budget_max: Optional[int] = 25000
    lifestyle: Optional[LifestylePreferences] = Field(default_factory=LifestylePreferences)

    # Real-world Owner, Host & Resident Contact Fields
    host_type: Optional[str] = "individual" # individual, property_manager, pg_operator, flatmate
    id_verification_type: Optional[str] = "aadhaar" # aadhaar, pan, passport, driving_license
    id_number_masked: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    contact_preference: Optional[str] = "both" # both, whatsapp, call, chat
    calling_hours: Optional[str] = "9:00 AM - 8:00 PM"
    whatsapp_number: Optional[str] = None
    properties_managed: Optional[str] = "1 Property"
    provides_rental_agreement: Optional[bool] = True
    upi_id: Optional[str] = None
    permanent_address: Optional[str] = None
    police_verification_status: Optional[str] = "verified" # verified, pending, not_initiated

class UserRegister(BaseModel):
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    password: str
    role: Optional[str] = "seeker" # "seeker" or "owner" (Admin registration disabled)
    city: Optional[str] = "Pune"

class UserLogin(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    identifier: Optional[str] = None
    password: Optional[str] = None
    otp: Optional[str] = None

class QuickOtpRequest(BaseModel):
    phone_or_email: str
    purpose: Optional[str] = "login"

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class VerifyOTPRequest(BaseModel):
    otp: str # 6-digit OTP

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    occupation: Optional[str] = None
    city: Optional[str] = None
    bio: Optional[str] = None
    languages: Optional[List[str]] = None
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    lifestyle: Optional[LifestylePreferences] = None

    # Real-world fields update
    host_type: Optional[str] = None
    id_verification_type: Optional[str] = None
    id_number_masked: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    contact_preference: Optional[str] = None
    calling_hours: Optional[str] = None
    whatsapp_number: Optional[str] = None
    properties_managed: Optional[str] = None
    provides_rental_agreement: Optional[bool] = None
    upi_id: Optional[str] = None
    permanent_address: Optional[str] = None
    police_verification_status: Optional[str] = None

class UserResponse(UserBase):
    id: str
    is_email_verified: bool = False
    is_phone_verified: bool = False
    is_blocked: bool = False
    created_at: datetime
    updated_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse
