from fastapi import APIRouter, Depends, HTTPException, Query, status
from datetime import datetime, timezone
from bson import ObjectId
from typing import List, Optional

from app.database import get_database
from app.utils.dependencies import get_current_user
from app.schemas.interaction import (
    VisitRequestCreate, VisitRequestStatusUpdate, VisitRequestResponse,
    ReviewCreate, ReviewResponse, ReportCreate, ReportResponse, NotificationResponse
)
from app.services.notifications import create_notification

router = APIRouter(tags=["Interactions & Visits & Reviews"])

# ----------------- VISIT REQUESTS -----------------
@router.post("/visits", response_model=VisitRequestResponse)
async def schedule_visit(
    visit_in: VisitRequestCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    try:
        obj_id = ObjectId(visit_in.listing_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid listing ID format")

    listing = await db.listings.find_one({"_id": obj_id})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    owner_id = str(listing.get("owner_id"))
    if owner_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="You cannot request a visit for your own property.")

    now = datetime.now(timezone.utc)
    visit_doc = {
        "listing_id": visit_in.listing_id,
        "listing_title": listing.get("title", ""),
        "listing_image": listing.get("images", [None])[0] if listing.get("images") else None,
        "listing_city": listing.get("city"),
        "listing_area": listing.get("area"),
        "seeker_id": current_user["id"],
        "seeker_name": current_user.get("full_name", "Seeker"),
        "seeker_phone": current_user.get("phone"),
        "owner_id": owner_id,
        "owner_name": listing.get("owner_name"),
        "visit_date": visit_in.visit_date,
        "visit_time_slot": visit_in.visit_time_slot,
        "notes": visit_in.notes,
        "status": "pending",
        "created_at": now,
        "updated_at": now
    }

    result = await db.visit_requests.insert_one(visit_doc)
    visit_doc["id"] = str(result.inserted_id)

    # Increment listing inquiries count
    await db.listings.update_one({"_id": obj_id}, {"$inc": {"inquiries_count": 1}})

    # Notify owner
    await create_notification(
        db,
        user_id=owner_id,
        n_type="visit_request",
        title="New Visit Request",
        message=f"{current_user.get('full_name')} requested a visit for '{listing.get('title')}' on {visit_in.visit_date} ({visit_in.visit_time_slot})",
        link="/dashboard/lister"
    )

    return visit_doc

@router.get("/visits/my", response_model=List[VisitRequestResponse])
async def get_my_visits(
    role: Optional[str] = "all", # seeker, owner, all
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    user_id = current_user["id"]
    if role == "seeker":
        query = {"seeker_id": user_id}
    elif role == "owner":
        query = {"owner_id": user_id}
    else:
        query = {"$or": [{"seeker_id": user_id}, {"owner_id": user_id}]}

    cursor = db.visit_requests.find(query).sort("created_at", -1)
    docs = await cursor.to_list(length=100)

    result = []
    for d in docs:
        d["id"] = str(d["_id"])
        result.append(d)
    return result

@router.put("/visits/{visit_id}/status", response_model=VisitRequestResponse)
async def update_visit_status(
    visit_id: str,
    status_in: VisitRequestStatusUpdate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    try:
        obj_id = ObjectId(visit_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid visit ID")

    doc = await db.visit_requests.find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Visit request not found")

    user_id = current_user["id"]
    if doc.get("owner_id") != user_id and doc.get("seeker_id") != user_id and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Permission denied")

    now = datetime.now(timezone.utc)
    new_status = status_in.status.lower()
    await db.visit_requests.update_one(
        {"_id": obj_id},
        {"$set": {"status": new_status, "updated_at": now}}
    )

    doc["status"] = new_status
    doc["updated_at"] = now
    doc["id"] = str(doc["_id"])

    # Notify seeker about owner's decision
    if user_id == doc.get("owner_id"):
        await create_notification(
            db,
            user_id=doc["seeker_id"],
            n_type="visit_status",
            title=f"Visit Request {new_status.capitalize()}",
            message=f"The owner has {new_status} your visit request for {doc.get('listing_title')}.",
            link="/dashboard/seeker"
        )

    return doc

# ----------------- REVIEWS -----------------
@router.post("/reviews", response_model=ReviewResponse)
async def create_review(
    review_in: ReviewCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    now = datetime.now(timezone.utc)
    review_doc = {
        "target_id": review_in.target_id,
        "target_type": review_in.target_type, # "listing" or "roommate"
        "author_id": current_user["id"],
        "author_name": current_user.get("full_name", "Anonymous"),
        "author_avatar": current_user.get("avatar_url"),
        "rating": review_in.rating,
        "comment": review_in.comment,
        "created_at": now
    }

    result = await db.reviews.insert_one(review_doc)
    review_doc["id"] = str(result.inserted_id)

    # Recalculate average rating if it's a listing
    if review_in.target_type == "listing":
        try:
            listing_obj_id = ObjectId(review_in.target_id)
            cursor = db.reviews.find({"target_id": review_in.target_id, "target_type": "listing"})
            all_reviews = await cursor.to_list(length=500)
            avg = sum(r["rating"] for r in all_reviews) / len(all_reviews)
            await db.listings.update_one(
                {"_id": listing_obj_id},
                {"$set": {"avg_rating": round(avg, 1), "reviews_count": len(all_reviews)}}
            )
        except Exception:
            pass

    return review_doc

@router.get("/reviews/{target_type}/{target_id}", response_model=List[ReviewResponse])
async def get_target_reviews(
    target_type: str,
    target_id: str,
    db = Depends(get_database)
):
    cursor = db.reviews.find({"target_id": target_id, "target_type": target_type}).sort("created_at", -1)
    docs = await cursor.to_list(length=100)
    result = []
    for d in docs:
        d["id"] = str(d["_id"])
        result.append(d)
    return result

# ----------------- REPORTS -----------------
@router.post("/reports", response_model=ReportResponse)
async def submit_report(
    report_in: ReportCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    now = datetime.now(timezone.utc)

    # Fetch title of reported item if listing
    reported_title = "Item"
    if report_in.reported_type == "listing":
        try:
            l = await db.listings.find_one({"_id": ObjectId(report_in.reported_id)})
            if l:
                reported_title = l.get("title", "Listing")
        except Exception:
            pass

    report_doc = {
        "reporter_id": current_user["id"],
        "reporter_name": current_user.get("full_name", "User"),
        "reported_type": report_in.reported_type,
        "reported_id": report_in.reported_id,
        "reported_title": reported_title,
        "reason": report_in.reason,
        "details": report_in.details,
        "status": "pending",
        "created_at": now
    }
    result = await db.reports.insert_one(report_doc)
    report_doc["id"] = str(result.inserted_id)
    return report_doc

# ----------------- NOTIFICATIONS -----------------
@router.get("/notifications", response_model=List[NotificationResponse])
async def get_my_notifications(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    cursor = db.notifications.find({"user_id": current_user["id"]}).sort("created_at", -1).limit(50)
    docs = await cursor.to_list(length=50)
    result = []
    for d in docs:
        d["id"] = str(d["_id"])
        result.append(d)
    return result

@router.put("/notifications/{notif_id}/read")
async def mark_notification_read(
    notif_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    try:
        obj_id = ObjectId(notif_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid notification ID")

    await db.notifications.update_one(
        {"_id": obj_id, "user_id": current_user["id"]},
        {"$set": {"read": True}}
    )
    return {"message": "Notification marked as read"}

@router.put("/notifications/read-all")
async def mark_all_notifications_read(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    await db.notifications.update_many(
        {"user_id": current_user["id"], "read": False},
        {"$set": {"read": True}}
    )
    return {"message": "All notifications marked as read"}

