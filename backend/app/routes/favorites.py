from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone
from bson import ObjectId
from typing import List

from app.database import get_database
from app.schemas.listing import ListingResponse
from app.utils.dependencies import get_current_user
from app.routes.listings import format_listing_doc

router = APIRouter(prefix="/favorites", tags=["Favorites / Wishlist"])

@router.get("", response_model=List[ListingResponse])
async def get_my_favorites(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    cursor = db.favorites.find({"user_id": current_user["id"]}).sort("created_at", -1)
    fav_records = await cursor.to_list(length=100)
    
    listing_ids = []
    for r in fav_records:
        try:
            listing_ids.append(ObjectId(r["listing_id"]))
        except Exception:
            pass
            
    if not listing_ids:
        return []
        
    listings_cursor = db.listings.find({"_id": {"$in": listing_ids}})
    listings = await listings_cursor.to_list(length=len(listing_ids))
    
    return [format_listing_doc(l, is_favorited=True) for l in listings]

@router.post("/{listing_id}")
async def toggle_favorite(
    listing_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    try:
        obj_id = ObjectId(listing_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid listing ID format")

    listing = await db.listings.find_one({"_id": obj_id})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    existing = await db.favorites.find_one({"user_id": current_user["id"], "listing_id": listing_id})
    
    if existing:
        await db.favorites.delete_one({"_id": existing["_id"]})
        await db.listings.update_one({"_id": obj_id}, {"$inc": {"favorites_count": -1}})
        return {"favorited": False, "message": "Removed from wishlist"}
    else:
        await db.favorites.insert_one({
            "user_id": current_user["id"],
            "listing_id": listing_id,
            "created_at": datetime.now(timezone.utc)
        })
        await db.listings.update_one({"_id": obj_id}, {"$inc": {"favorites_count": 1}})
        return {"favorited": True, "message": "Added to wishlist"}

