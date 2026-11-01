from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
import math

from app.database import get_database
from app.schemas.roommate import (
    RoommatePostCreate, RoommatePostUpdate, RoommatePostResponse, PaginatedRoommatesResponse
)
from app.utils.dependencies import get_current_user, get_optional_current_user
from app.services.matching import calculate_compatibility

router = APIRouter(prefix="/roommates", tags=["Roommate Finder"])

def format_roommate_doc(doc: dict, current_user: Optional[dict] = None) -> dict:
    score, reasons = None, None
    if current_user and str(doc.get("user_id")) != current_user.get("id"):
        score, reasons = calculate_compatibility(
            user_lifestyle=current_user.get("lifestyle"),
            user_city=current_user.get("city"),
            user_gender=current_user.get("gender"),
            user_budget_min=current_user.get("budget_min"),
            user_budget_max=current_user.get("budget_max"),
            target_lifestyle=doc.get("lifestyle"),
            target_city=doc.get("city"),
            target_gender=doc.get("user_gender"),
            target_gender_preference=doc.get("gender_preference", "any"),
            target_rent=doc.get("approx_rent")
        )
    elif not current_user:
        # Default mock baseline compatibility for guests
        score = 85
        reasons = ["Good lifestyle alignment", "Matching budget bracket", "Cleanliness & habits compatible"]

    return {
        "id": str(doc["_id"]),
        "post_type": doc.get("post_type", "need_roommate"),
        "title": doc.get("title", ""),
        "description": doc.get("description", ""),
        "city": doc.get("city", ""),
        "preferred_areas": doc.get("preferred_areas", []),
        "approx_rent": doc.get("approx_rent", 0),
        "approx_deposit": doc.get("approx_deposit", 0),
        "available_from": str(doc.get("available_from", "Immediate")),
        "gender_preference": doc.get("gender_preference", "any"),
        "furnishing": doc.get("furnishing", "semi-furnished"),
        "amenities": doc.get("amenities", []),
        "images": doc.get("images", []),
        "lifestyle": doc.get("lifestyle", {}),
        "property_bhk": doc.get("property_bhk", "2BHK"),
        "room_type": doc.get("room_type", "Private Single Room"),
        "occupancy_type": doc.get("occupancy_type", "single"),
        "preferred_occupation": doc.get("preferred_occupation", "any"),
        "diet_preference": doc.get("diet_preference", "any"),
        "smoking_policy": doc.get("smoking_policy", "no_smoking"),
        "drinking_policy": doc.get("drinking_policy", "any"),
        "work_schedule": doc.get("work_schedule", "hybrid"),
        "maintenance_included": doc.get("maintenance_included", True),
        "utility_split_equal": doc.get("utility_split_equal", True),
        "min_stay_months": doc.get("min_stay_months", 3),
        "notice_period_days": doc.get("notice_period_days", 30),
        "contact_mode": doc.get("contact_mode", "chat"),
        "user_id": str(doc.get("user_id", "")),
        "user_name": doc.get("user_name", "Anonymous"),
        "user_avatar": doc.get("user_avatar"),
        "user_age": doc.get("user_age", 24),
        "user_gender": doc.get("user_gender", "other"),
        "user_occupation": doc.get("user_occupation", "working"),
        "user_verified": doc.get("user_verified", False),
        "status": doc.get("status", "active"),
        "compatibility_score": score,
        "compatibility_reasons": reasons,
        "created_at": doc.get("created_at", datetime.now(timezone.utc)),
        "updated_at": doc.get("updated_at", datetime.now(timezone.utc))
    }

@router.get("/recommended", response_model=List[RoommatePostResponse])
async def get_recommended_roommates(
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db = Depends(get_database)
):
    query = {"status": "active"}
    if current_user:
        query["user_id"] = {"$ne": current_user["id"]}
        if current_user.get("city"):
            query["city"] = {"$regex": f"^{current_user['city']}$", "$options": "i"}

    cursor = db.roommate_posts.find(query).limit(10)
    items = await cursor.to_list(length=10)
    
    formatted = [format_roommate_doc(d, current_user) for d in items]
    # Sort by compatibility score descending
    formatted.sort(key=lambda x: x["compatibility_score"] or 0, reverse=True)
    return formatted[:6]

@router.get("", response_model=PaginatedRoommatesResponse)
async def list_roommate_posts(
    post_type: Optional[str] = None, # need_roommate, looking_for_room
    city: Optional[str] = None,
    gender: Optional[str] = None,
    max_rent: Optional[int] = None,
    sort_by: Optional[str] = "score", # score, newest, rent_asc, rent_desc
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db = Depends(get_database)
):
    filter_query = {"status": "active"}

    if post_type and post_type.lower() != "all":
        filter_query["post_type"] = post_type

    if city and city.lower() != "all":
        filter_query["city"] = {"$regex": f"^{city}$", "$options": "i"}

    if gender and gender.lower() != "any":
        filter_query["$or"] = [
            {"gender_preference": gender.lower()},
            {"gender_preference": "any"}
        ]

    if max_rent is not None:
        filter_query["approx_rent"] = {"$lte": max_rent}

    total = await db.roommate_posts.count_documents(filter_query)
    skip = (page - 1) * limit
    
    # Fetch all matching or paginated
    cursor = db.roommate_posts.find(filter_query).sort("created_at", -1).skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)

    formatted = [format_roommate_doc(item, current_user) for item in items]

    if sort_by == "score":
        formatted.sort(key=lambda x: x["compatibility_score"] or 0, reverse=True)
    elif sort_by == "rent_asc":
        formatted.sort(key=lambda x: x["approx_rent"])
    elif sort_by == "rent_desc":
        formatted.sort(key=lambda x: x["approx_rent"], reverse=True)

    return {
        "items": formatted,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": max(1, math.ceil(total / limit))
    }

@router.get("/{post_id}", response_model=RoommatePostResponse)
async def get_roommate_post(
    post_id: str,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db = Depends(get_database)
):
    try:
        obj_id = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid post ID format")

    doc = await db.roommate_posts.find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Roommate post not found")

    return format_roommate_doc(doc, current_user)

@router.post("", response_model=RoommatePostResponse)
async def create_roommate_post(
    post_in: RoommatePostCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    now = datetime.now(timezone.utc)
    doc = post_in.model_dump()
    
    doc["user_id"] = current_user["id"]
    doc["user_name"] = current_user.get("full_name", "User")
    doc["user_avatar"] = current_user.get("avatar_url")
    doc["user_age"] = current_user.get("age", 24)
    doc["user_gender"] = current_user.get("gender", "other")
    doc["user_occupation"] = current_user.get("occupation", "working")
    doc["user_verified"] = current_user.get("is_phone_verified", False) or current_user.get("is_email_verified", False)
    doc["status"] = "active"
    doc["created_at"] = now
    doc["updated_at"] = now

    # If post didn't provide custom lifestyle, inherit user's questionnaire
    if not doc.get("lifestyle"):
        doc["lifestyle"] = current_user.get("lifestyle", {})

    result = await db.roommate_posts.insert_one(doc)
    doc["_id"] = result.inserted_id

    return format_roommate_doc(doc, current_user)

@router.put("/{post_id}", response_model=RoommatePostResponse)
async def update_roommate_post(
    post_id: str,
    post_in: RoommatePostUpdate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    try:
        obj_id = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid post ID format")

    doc = await db.roommate_posts.find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Roommate post not found")

    if doc.get("user_id") != current_user["id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Permission denied")

    update_fields = {k: v for k, v in post_in.model_dump().items() if v is not None}
    update_fields["updated_at"] = datetime.now(timezone.utc)
    
    await db.roommate_posts.update_one({"_id": obj_id}, {"$set": update_fields})
    updated_doc = await db.roommate_posts.find_one({"_id": obj_id})
    return format_roommate_doc(updated_doc, current_user)

@router.delete("/{post_id}")
async def delete_roommate_post(
    post_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    try:
        obj_id = ObjectId(post_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid post ID format")

    doc = await db.roommate_posts.find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Roommate post not found")

    if doc.get("user_id") != current_user["id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Permission denied")

    await db.roommate_posts.delete_one({"_id": obj_id})
    return {"message": "Roommate post deleted successfully"}

