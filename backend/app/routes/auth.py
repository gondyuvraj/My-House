from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import secrets
import logging
import re

from app.database import get_database
from app.config import settings
from app.schemas.user import (
    UserRegister, UserLogin, TokenResponse, UserResponse,
    ForgotPasswordRequest, ResetPasswordRequest, VerifyOTPRequest,
    QuickOtpRequest
)
from app.utils.security import (
    get_password_hash, verify_password,
    create_access_token, create_refresh_token, decode_token
)
from app.utils.dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory store for dev reset tokens and OTPs
RESET_TOKENS = {}
DEV_OTPS = {}

def format_user_doc(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "full_name": user.get("full_name", ""),
        "phone": user.get("phone"),
        "role": user.get("role", "seeker"),
        "avatar_url": user.get("avatar_url"),
        "age": user.get("age"),
        "gender": user.get("gender", "other"),
        "occupation": user.get("occupation", "working"),
        "city": user.get("city", "Pune"),
        "bio": user.get("bio", ""),
        "languages": user.get("languages", ["English", "Hindi"]),
        "budget_min": user.get("budget_min", 5000),
        "budget_max": user.get("budget_max", 25000),
        "lifestyle": user.get("lifestyle", {}),
        "host_type": user.get("host_type", "individual"),
        "id_verification_type": user.get("id_verification_type", "aadhaar"),
        "id_number_masked": user.get("id_number_masked", "XXXX-XXXX-4589" if user.get("is_phone_verified") else None),
        "emergency_contact_name": user.get("emergency_contact_name", "Primary Kin / Caretaker"),
        "emergency_contact_relation": user.get("emergency_contact_relation", "Parent / Guardian"),
        "emergency_contact_phone": user.get("emergency_contact_phone", "+91 98220 99887"),
        "contact_preference": user.get("contact_preference", "both"),
        "calling_hours": user.get("calling_hours", "9:00 AM - 8:00 PM"),
        "whatsapp_number": user.get("whatsapp_number", user.get("phone")),
        "properties_managed": user.get("properties_managed", "1-2 Properties"),
        "provides_rental_agreement": user.get("provides_rental_agreement", True),
        "upi_id": user.get("upi_id", f"{user.get('email', 'owner').split('@')[0]}@okaxis"),
        "permanent_address": user.get("permanent_address", f"{user.get('city', 'Pune')}, Maharashtra, India"),
        "police_verification_status": user.get("police_verification_status", "verified"),
        "is_email_verified": user.get("is_email_verified", False),
        "is_phone_verified": user.get("is_phone_verified", False),
        "is_blocked": user.get("is_blocked", False),
        "created_at": user.get("created_at", datetime.now(timezone.utc)),
        "updated_at": user.get("updated_at", datetime.now(timezone.utc))
    }

@router.post("/register", response_model=TokenResponse)
async def register(user_in: UserRegister, db = Depends(get_database)):
    # Restrict customer registration strictly to host ('owner') or seeker
    role = "owner" if user_in.role == "owner" else "seeker"

    email_val = (user_in.email or "").strip().lower()
    phone_val = (user_in.phone or "").strip()

    if not email_val and not phone_val:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide at least an Email address or Mobile Number."
        )

    clean_digits = re.sub(r'\D', '', phone_val)
    if clean_digits.startswith('91') and len(clean_digits) > 10:
        clean_digits = clean_digits[2:]

    # Check existing email
    if email_val:
        existing_email = await db.users.find_one({"email": email_val})
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists."
            )
    else:
        # Fallback generated email for phone-only registered users
        email_val = f"user_{clean_digits or secrets.token_hex(4)}@myhouse.in"

    # Check existing mobile number if provided
    if clean_digits and len(clean_digits) >= 8:
        existing_phone = await db.users.find_one({
            "$or": [
                {"phone": phone_val},
                {"phone": {"$regex": f"{clean_digits}$"}}
            ]
        })
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this mobile number already exists. Please sign in."
            )

    now = datetime.now(timezone.utc)
    user_doc = {
        "email": email_val,
        "hashed_password": get_password_hash(user_in.password),
        "full_name": user_in.full_name,
        "phone": phone_val or (f"+91 {clean_digits}" if clean_digits else None),
        "role": role,
        "avatar_url": f"https://api.dicebear.com/7.x/avataaars/svg?seed={email_val}",
        "age": 24,
        "gender": "other",
        "occupation": "working",
        "city": user_in.city or "Pune",
        "bio": "New to My House community!",
        "languages": ["English", "Hindi"],
        "budget_min": 6000,
        "budget_max": 25000,
        "lifestyle": {
            "smoking": "never",
            "drinking": "never",
            "food_preference": "any",
            "sleep_schedule": "flexible",
            "cleanliness": 4,
            "guests_allowed": True,
            "pets_allowed": False,
            "noise_level": "moderate",
            "work_from_home": False
        },
        "is_email_verified": bool(email_val and "@myhouse.in" not in email_val),
        "is_phone_verified": bool(clean_digits),
        "is_blocked": False,
        "created_at": now,
        "updated_at": now
    }
    
    res = await db.users.insert_one(user_doc)
    user_doc["_id"] = res.inserted_id

    access_token = create_access_token({"sub": str(res.inserted_id), "role": user_doc["role"]})
    refresh_token = create_refresh_token({"sub": str(res.inserted_id)})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": format_user_doc(user_doc)
    }

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db = Depends(get_database)):
    ident = (credentials.identifier or credentials.email or credentials.phone or "").strip()
    if not ident:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter your email or mobile number."
        )

    clean_digits = re.sub(r'\D', '', ident)
    if clean_digits.startswith('91') and len(clean_digits) > 10:
        clean_digits = clean_digits[2:]

    # Search user by email OR phone number
    query_conditions = [{"email": ident.lower()}]
    if len(clean_digits) >= 8:
        query_conditions.append({"phone": ident})
        query_conditions.append({"phone": {"$regex": f"{clean_digits}$"}})

    user = await db.users.find_one({"$or": query_conditions})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No account found with this email or mobile number."
        )
    
    if user.get("is_blocked", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support."
        )

    # Check OTP or Password verification
    if credentials.otp:
        valid_otp = credentials.otp.strip() in ["123456", DEV_OTPS.get(str(user["_id"]))]
        if not valid_otp:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid OTP code. Dev code is 123456."
            )
    elif credentials.password:
        if not verify_password(credentials.password, user.get("hashed_password", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password."
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a password or OTP to authenticate."
        )

    access_token = create_access_token({"sub": str(user["_id"]), "role": user.get("role", "seeker")})
    refresh_token = create_refresh_token({"sub": str(user["_id"])})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": format_user_doc(user)
    }

@router.post("/send-quick-otp")
async def send_quick_otp(req: QuickOtpRequest, db = Depends(get_database)):
    ident = req.phone_or_email.strip()
    if not ident:
        raise HTTPException(status_code=400, detail="Mobile number or email is required.")
    
    # Store standard developer OTP
    otp = "123456"
    print("\n" + "="*50)
    print(f"[DEV NOTIFICATION] QUICK LOGIN/REGISTER OTP")
    print(f"Target: {ident} (Purpose: {req.purpose})")
    print(f"OTP Code: {otp}")
    print("="*50 + "\n")
    return {"message": f"Verification code sent to {ident}! Use code: 123456", "otp_code": otp}

@router.post("/refresh")
async def refresh_token_endpoint(refresh_token: str, db = Depends(get_database)):
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token."
        )
    
    user_id = payload.get("sub")
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user or user.get("is_blocked", False):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account is invalid.")
    
    new_access_token = create_access_token({"sub": str(user["_id"]), "role": user.get("role", "seeker")})
    return {"access_token": new_access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return format_user_doc(current_user)

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, db = Depends(get_database)):
    user = await db.users.find_one({"email": req.email.lower()})
    if not user:
        # Avoid user enumeration in production, return generic success
        return {"message": "If this email is registered, a password reset link has been generated."}
    
    token = secrets.token_urlsafe(32)
    RESET_TOKENS[token] = {
        "email": req.email.lower(),
        "expires": datetime.now(timezone.utc) + timedelta(hours=1)
    }
    
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    print("\n" + "="*60)
    print(f"[DEV NOTIFICATION] PASSWORD RESET REQUEST")
    print(f"Target Email: {req.email.lower()}")
    print(f"Reset Link: {reset_url}")
    print("="*60 + "\n")
    
    return {"message": "If this email is registered, a password reset link has been generated.", "dev_reset_token": token}

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, db = Depends(get_database)):
    token_data = RESET_TOKENS.get(req.token)
    if not token_data or datetime.now(timezone.utc) > token_data["expires"]:
        raise HTTPException(status_code=400, detail="Password reset token is invalid or has expired.")
    
    new_hash = get_password_hash(req.new_password)
    await db.users.update_one(
        {"email": token_data["email"]},
        {"$set": {"hashed_password": new_hash, "updated_at": datetime.now(timezone.utc)}}
    )
    del RESET_TOKENS[req.token]
    return {"message": "Your password has been successfully updated. You may now log in."}

@router.post("/send-otp")
async def send_otp(current_user: dict = Depends(get_current_user)):
    otp = "123456" # Standard dev simulated OTP
    DEV_OTPS[current_user["id"]] = otp
    print("\n" + "="*50)
    print(f"[DEV NOTIFICATION] VERIFICATION OTP")
    print(f"User: {current_user['email']} (ID: {current_user['id']})")
    print(f"OTP Code: {otp}")
    print("="*50 + "\n")
    return {"message": f"Verification OTP sent to {current_user.get('phone') or current_user['email']} (Dev OTP: 123456)"}

@router.post("/verify-otp")
async def verify_otp(req: VerifyOTPRequest, current_user: dict = Depends(get_current_user), db = Depends(get_database)):
    stored_otp = DEV_OTPS.get(current_user["id"], "123456")
    if req.otp.strip() != stored_otp:
        raise HTTPException(status_code=400, detail="Invalid verification code. Enter 123456 for demo verification.")
    
    await db.users.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {
            "is_phone_verified": True,
            "is_email_verified": True,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    return {"message": "Phone and email have been successfully verified!", "verified": True}

