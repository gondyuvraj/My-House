from fastapi import APIRouter, Depends, HTTPException, Query, status
from datetime import datetime, timezone
from bson import ObjectId
from typing import List, Optional

from app.database import get_database
from app.utils.dependencies import require_admin
from app.schemas.user import UserResponse
from app.schemas.listing import ListingResponse
from app.schemas.interaction import ReportResponse, ReportStatusUpdate
from app.routes.auth import format_user_doc
from app.routes.listings import format_listing_doc

router = APIRouter(prefix="/admin", tags=["Admin Moderation"])

@router.get("/stats")
async def get_admin_stats(
    admin: dict = Depends(require_admin),
    db = Depends(get_database)
):
    total_users = await db.users.count_documents({})
    total_listings = await db.listings.count_documents({})
    active_listings = await db.listings.count_documents({"status": "active"})
    total_roommate_posts = await db.roommate_posts.count_documents({})
    total_visits = await db.visit_requests.count_documents({})
    pending_reports = await db.reports.count_documents({"status": "pending"})

    # City breakdown
    pipeline = [
        {"$group": {"_id": "$city", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 6}
    ]
    city_data = await db.listings.aggregate(pipeline).to_list(length=6)
    cities_stat = [{"city": c["_id"] or "Unknown", "listings": c["count"]} for c in city_data]

    # Type breakdown
    type_pipeline = [
        {"$group": {"_id": "$type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    type_data = await db.listings.aggregate(type_pipeline).to_list(length=10)
    types_stat = [{"name": t["_id"] or "Other", "value": t["count"]} for t in type_data]

    return {
        "total_users": total_users,
        "total_listings": total_listings,
        "active_listings": active_listings,
        "total_roommates": total_roommate_posts,
        "total_visits": total_visits,
        "pending_reports": pending_reports,
        "city_stats": cities_stat,
        "type_stats": types_stat
    }

@router.get("/users", response_model=List[UserResponse])
async def list_admin_users(
    q: Optional[str] = None,
    limit: int = 100,
    admin: dict = Depends(require_admin),
    db = Depends(get_database)
):
    query = {}
    if q:
        query["$or"] = [
            {"email": {"$regex": q, "$options": "i"}},
            {"full_name": {"$regex": q, "$options": "i"}},
            {"city": {"$regex": q, "$options": "i"}}
        ]
    cursor = db.users.find(query).sort("created_at", -1).limit(limit)
    users = await cursor.to_list(length=limit)
    return [format_user_doc(u) for u in users]

@router.put("/users/{user_id}/status")
async def toggle_user_block(
    user_id: str,
    block: bool = Query(...),
    admin: dict = Depends(require_admin),
    db = Depends(get_database)
):
    try:
        obj_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    target = await db.users.find_one({"_id": obj_id})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    if target.get("role") == "admin":
        raise HTTPException(status_code=400, detail="Cannot block an administrator.")

    await db.users.update_one(
        {"_id": obj_id},
        {"$set": {"is_blocked": block, "updated_at": datetime.now(timezone.utc)}}
    )
    return {"message": f"User {'blocked' if block else 'unblocked'} successfully", "is_blocked": block}

@router.get("/listings", response_model=List[ListingResponse])
async def list_admin_listings(
    status_filter: Optional[str] = None,
    admin: dict = Depends(require_admin),
    db = Depends(get_database)
):
    query = {}
    if status_filter and status_filter != "all":
        query["status"] = status_filter
    cursor = db.listings.find(query).sort("created_at", -1).limit(100)
    items = await cursor.to_list(length=100)
    return [format_listing_doc(i) for i in items]

@router.put("/listings/{listing_id}/moderate")
async def moderate_listing(
    listing_id: str,
    status: str = Query(..., pattern="^(active|pending|rejected)$"),
    admin: dict = Depends(require_admin),
    db = Depends(get_database)
):
    try:
        obj_id = ObjectId(listing_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid listing ID")

    await db.listings.update_one(
        {"_id": obj_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc)}}
    )
    return {"message": f"Listing status updated to {status}", "status": status}

@router.get("/reports", response_model=List[ReportResponse])
async def list_reports(
    admin: dict = Depends(require_admin),
    db = Depends(get_database)
):
    cursor = db.reports.find({}).sort("created_at", -1).limit(100)
    docs = await cursor.to_list(length=100)
    result = []
    for d in docs:
        d["id"] = str(d["_id"])
        result.append(d)
    return result

@router.put("/reports/{report_id}/status")
async def update_report_status(
    report_id: str,
    status_update: ReportStatusUpdate,
    admin: dict = Depends(require_admin),
    db = Depends(get_database)
):
    try:
        obj_id = ObjectId(report_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid report ID")

    await db.reports.update_one(
        {"_id": obj_id},
        {"$set": {"status": status_update.status, "updated_at": datetime.now(timezone.utc)}}
    )
    return {"message": f"Report marked as {status_update.status}"}
