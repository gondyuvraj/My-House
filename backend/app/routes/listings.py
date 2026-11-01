from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
import math

from app.database import get_database
from app.schemas.listing import (
    ListingCreate, ListingUpdate, ListingResponse, PaginatedListingsResponse
)
from app.utils.dependencies import get_current_user, get_optional_current_user

router = APIRouter(prefix="/listings", tags=["Listings"])

def calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def format_listing_doc(doc: dict, is_favorited: bool = False, distance: Optional[float] = None) -> dict:
    coords = doc.get("location", {}).get("coordinates", [73.8567, 18.5204]) # [lng, lat]
    return {
        "id": str(doc["_id"]),
        "owner_id": str(doc.get("owner_id", "")),
        "owner_name": doc.get("owner_name", "Host"),
        "owner_avatar": doc.get("owner_avatar"),
        "owner_phone": doc.get("owner_phone"),
        "owner_verified": doc.get("owner_verified", False),
        "owner_calling_hours": doc.get("owner_calling_hours", "9:00 AM - 8:00 PM"),
        "owner_languages": doc.get("owner_languages", ["English", "Hindi"]),
        "owner_host_type": doc.get("owner_host_type", "Individual Owner"),
        "owner_provides_agreement": doc.get("owner_provides_agreement", True),
        "title": doc.get("title", ""),
        "description": doc.get("description", ""),
        "type": doc.get("type", "PG"),
        "gender_preference": doc.get("gender_preference", "any"),
        "rent": doc.get("rent", 0),
        "deposit": doc.get("deposit", 0),
        "maintenance": doc.get("maintenance", 0),
        "available_from": str(doc.get("available_from", "Immediate")),
        "city": doc.get("city", ""),
        "area": doc.get("area", ""),
        "full_address": doc.get("full_address", ""),
        "lng": coords[0],
        "lat": coords[1],
        "furnishing": doc.get("furnishing", "semi-furnished"),
        "amenities": doc.get("amenities", []),
        "house_rules": doc.get("house_rules", []),
        "nearby_places": doc.get("nearby_places", []),
        "contact_preference": doc.get("contact_preference", "both"),
        "images": doc.get("images", []),
        "status": doc.get("status", "active"),
        "views_count": doc.get("views_count", 0),
        "favorites_count": doc.get("favorites_count", 0),
        "inquiries_count": doc.get("inquiries_count", 0),
        "avg_rating": round(float(doc.get("avg_rating", 4.5)), 1),
        "reviews_count": int(doc.get("reviews_count", 0)),
        "distance_km": distance,
        "is_favorited": is_favorited,
        "created_at": doc.get("created_at", datetime.now(timezone.utc)),
        "updated_at": doc.get("updated_at", datetime.now(timezone.utc))
    }

@router.get("/featured", response_model=List[ListingResponse])
async def get_featured_listings(
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db = Depends(get_database)
):
    query = {"status": "active"}
    cursor = db.listings.find(query).sort([("avg_rating", -1), ("views_count", -1)]).limit(8)
    items = await cursor.to_list(length=8)
    
    fav_ids = set()
    if current_user:
        favs = await db.favorites.find({"user_id": current_user["id"]}).to_list(length=50)
        fav_ids = {str(f["listing_id"]) for f in favs}
        
    return [format_listing_doc(doc, is_favorited=(str(doc["_id"]) in fav_ids)) for doc in items]

@router.get("/autocomplete")
async def autocomplete_locations(
    query: str = Query("", min_length=1),
    db = Depends(get_database)
):
    # Matches city or area
    regex = {"$regex": query, "$options": "i"}
    cities = await db.listings.distinct("city", {"city": regex, "status": "active"})
    areas = await db.listings.distinct("area", {"area": regex, "status": "active"})
    
    results = []
    for c in cities[:5]:
        results.append({"type": "city", "label": c, "value": c})
    for a in areas[:8]:
        results.append({"type": "area", "label": a, "value": a})
    return results

@router.get("/my/listings", response_model=List[ListingResponse])
async def get_my_listings(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    cursor = db.listings.find({"owner_id": current_user["id"]}).sort("created_at", -1)
    docs = await cursor.to_list(length=100)
    return [format_listing_doc(d) for d in docs]

@router.get("", response_model=PaginatedListingsResponse)
async def list_listings(
    q: Optional[str] = None,
    city: Optional[str] = None,
    area: Optional[str] = None,
    type: Optional[str] = None,
    gender: Optional[str] = None,
    furnishing: Optional[str] = None,
    min_rent: Optional[int] = None,
    max_rent: Optional[int] = None,
    amenities: Optional[str] = None, # comma-separated
    verified_only: Optional[bool] = False,
    sort_by: Optional[str] = "newest", # newest, price_asc, price_desc, rating, nearest
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db = Depends(get_database)
):
    filter_query = {"status": "active"}

    if q:
        filter_query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"area": {"$regex": q, "$options": "i"}},
            {"city": {"$regex": q, "$options": "i"}}
        ]

    if city and city.lower() != "all":
        filter_query["city"] = {"$regex": f"^{city}$", "$options": "i"}

    if area:
        filter_query["area"] = {"$regex": area, "$options": "i"}

    if type and type.lower() != "all":
        filter_query["type"] = type

    if gender and gender.lower() != "any":
        filter_query["$or"] = [
            {"gender_preference": gender.lower()},
            {"gender_preference": "any"}
        ]

    if furnishing and furnishing.lower() != "all":
        filter_query["furnishing"] = furnishing

    if min_rent is not None or max_rent is not None:
        rent_filter = {}
        if min_rent is not None:
            rent_filter["$gte"] = min_rent
        if max_rent is not None:
            rent_filter["$lte"] = max_rent
        filter_query["rent"] = rent_filter

    if amenities:
        amenity_list = [a.strip() for a in amenities.split(",") if a.strip()]
        if amenity_list:
            filter_query["amenities"] = {"$all": amenity_list}

    if verified_only:
        filter_query["owner_verified"] = True

    sort_criteria = [("created_at", -1)]
    if sort_by == "price_asc":
        sort_criteria = [("rent", 1)]
    elif sort_by == "price_desc":
        sort_criteria = [("rent", -1)]
    elif sort_by == "rating":
        sort_criteria = [("avg_rating", -1)]

    total = await db.listings.count_documents(filter_query)
    skip = (page - 1) * limit
    
    cursor = db.listings.find(filter_query).sort(sort_criteria).skip(skip).limit(limit)
    raw_items = await cursor.to_list(length=limit)

    # Get user favorite listing IDs
    user_favs = set()
    if current_user:
        fav_records = await db.favorites.find({"user_id": current_user["id"]}).to_list(length=200)
        user_favs = {str(f["listing_id"]) for f in fav_records}

    formatted = []
    for item in raw_items:
        dist = None
        if lat is not None and lng is not None:
            coords = item.get("location", {}).get("coordinates", [0, 0])
            dist = calculate_haversine(lat, lng, coords[1], coords[0])
        is_fav = str(item["_id"]) in user_favs
        formatted.append(format_listing_doc(item, is_favorited=is_fav, distance=dist))

    # If sorted by nearest and location provided
    if sort_by == "nearest" and lat is not None and lng is not None:
        formatted.sort(key=lambda x: x["distance_km"] if x["distance_km"] is not None else 999999)

    return {
        "items": formatted,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": max(1, math.ceil(total / limit))
    }

@router.get("/{listing_id}", response_model=ListingResponse)
async def get_listing_detail(
    listing_id: str,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db = Depends(get_database)
):
    try:
        obj_id = ObjectId(listing_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid listing ID format")

    doc = await db.listings.find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Increment view count in background
    await db.listings.update_one({"_id": obj_id}, {"$inc": {"views_count": 1}})
    doc["views_count"] = doc.get("views_count", 0) + 1

    is_fav = False
    if current_user:
        fav = await db.favorites.find_one({"user_id": current_user["id"], "listing_id": listing_id})
        is_fav = bool(fav)

    return format_listing_doc(doc, is_favorited=is_fav)

@router.get("/{listing_id}/similar", response_model=List[ListingResponse])
async def get_similar_listings(
    listing_id: str,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db = Depends(get_database)
):
    try:
        obj_id = ObjectId(listing_id)
    except Exception:
        return []

    source = await db.listings.find_one({"_id": obj_id})
    if not source:
        return []

    query = {
        "_id": {"$ne": obj_id},
        "city": source.get("city"),
        "status": "active"
    }
    cursor = db.listings.find(query).limit(4)
    items = await cursor.to_list(length=4)

    fav_ids = set()
    if current_user:
        favs = await db.favorites.find({"user_id": current_user["id"]}).to_list(length=50)
        fav_ids = {str(f["listing_id"]) for f in favs}

    return [format_listing_doc(d, is_favorited=(str(d["_id"]) in fav_ids)) for d in items]

@router.post("", response_model=ListingResponse)
async def create_listing(
    listing_in: ListingCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    now = datetime.now(timezone.utc)
    doc = listing_in.model_dump()
    
    # Store GeoJSON structure for geospatial query indexing
    doc["location"] = {
        "type": "Point",
        "coordinates": [listing_in.lng, listing_in.lat] # [longitude, latitude]
    }
    del doc["lat"]
    del doc["lng"]

    doc["owner_id"] = current_user["id"]
    doc["owner_name"] = current_user.get("full_name", "Host")
    doc["owner_avatar"] = current_user.get("avatar_url")
    doc["owner_phone"] = current_user.get("phone")
    doc["owner_verified"] = current_user.get("is_phone_verified", False) or current_user.get("is_email_verified", False)
    doc["status"] = "active"
    doc["views_count"] = 0
    doc["favorites_count"] = 0
    doc["inquiries_count"] = 0
    doc["avg_rating"] = 5.0
    doc["reviews_count"] = 0
    doc["created_at"] = now
    doc["updated_at"] = now

    result = await db.listings.insert_one(doc)
    doc["_id"] = result.inserted_id

    # If user was only seeker, update role to include lister/owner
    if current_user.get("role") == "seeker":
        await db.users.update_one({"_id": ObjectId(current_user["id"])}, {"$set": {"role": "owner"}})

    return format_listing_doc(doc)

@router.put("/{listing_id}", response_model=ListingResponse)
async def update_listing(
    listing_id: str,
    listing_in: ListingUpdate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    try:
        obj_id = ObjectId(listing_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid listing ID format")

    doc = await db.listings.find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Listing not found")

    if doc.get("owner_id") != current_user["id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="You do not have permission to edit this listing.")

    update_fields = {k: v for k, v in listing_in.model_dump().items() if v is not None}
    
    if "lat" in update_fields or "lng" in update_fields:
        coords = doc.get("location", {}).get("coordinates", [73.8567, 18.5204])
        new_lat = update_fields.pop("lat", coords[1])
        new_lng = update_fields.pop("lng", coords[0])
        update_fields["location"] = {"type": "Point", "coordinates": [new_lng, new_lat]}

    update_fields["updated_at"] = datetime.now(timezone.utc)
    await db.listings.update_one({"_id": obj_id}, {"$set": update_fields})

    updated_doc = await db.listings.find_one({"_id": obj_id})
    return format_listing_doc(updated_doc)

@router.delete("/{listing_id}")
async def delete_listing(
    listing_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    try:
        obj_id = ObjectId(listing_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid listing ID format")

    doc = await db.listings.find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Listing not found")

    if doc.get("owner_id") != current_user["id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Permission denied")

    await db.listings.delete_one({"_id": obj_id})
    await db.favorites.delete_many({"listing_id": listing_id})
    return {"message": "Listing deleted successfully"}

