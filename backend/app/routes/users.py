from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone
from bson import ObjectId

from app.database import get_database
from app.schemas.user import UserUpdate, UserResponse
from app.utils.dependencies import get_current_user, get_optional_current_user
from app.services.matching import calculate_compatibility
from app.routes.auth import format_user_doc

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/profile", response_model=UserResponse)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    return format_user_doc(current_user)

@router.put("/profile", response_model=UserResponse)
async def update_my_profile(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    update_data = {k: v for k, v in user_update.model_dump().items() if v is not None}
    if not update_data:
        return format_user_doc(current_user)
    
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.users.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": update_data}
    )

    # Propagate avatar updates to user's listings and roommate posts
    if "avatar_url" in update_data:
        new_avatar = update_data["avatar_url"]
        await db.listings.update_many(
            {"owner_id": current_user["id"]},
            {"$set": {"owner_avatar": new_avatar}}
        )
        await db.roommate_posts.update_many(
            {"user_id": current_user["id"]},
            {"$set": {"user_avatar": new_avatar}}
        )

    # Propagate name updates to user's listings and roommate posts
    if "full_name" in update_data:
        new_name = update_data["full_name"]
        await db.listings.update_many(
            {"owner_id": current_user["id"]},
            {"$set": {"owner_name": new_name}}
        )
        await db.roommate_posts.update_many(
            {"user_id": current_user["id"]},
            {"$set": {"user_name": new_name}}
        )
    
    updated_user = await db.users.find_one({"_id": ObjectId(current_user["id"])})
    return format_user_doc(updated_user)

@router.get("/{user_id}", response_model=UserResponse)
async def get_user_public_profile(user_id: str, db = Depends(get_database)):
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = None
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return format_user_doc(user)

@router.get("/{user_id}/compatibility")
async def get_user_compatibility(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    if user_id == current_user["id"]:
        return {"score": 100, "reasons": ["This is your own profile!"]}
    
    try:
        target_user = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        target_user = None
    
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found")
    
    score, reasons = calculate_compatibility(
        user_lifestyle=current_user.get("lifestyle"),
        user_city=current_user.get("city"),
        user_gender=current_user.get("gender"),
        user_budget_min=current_user.get("budget_min"),
        user_budget_max=current_user.get("budget_max"),
        target_lifestyle=target_user.get("lifestyle"),
        target_city=target_user.get("city"),
        target_gender=target_user.get("gender"),
        target_gender_preference="any",
        target_rent=target_user.get("budget_max")
    )
    
    return {
        "score": score,
        "reasons": reasons,
        "target_user_name": target_user.get("full_name"),
        "target_user_city": target_user.get("city")
    }

