from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from typing import List, Dict, Any
import os
import uuid
from pathlib import Path
from datetime import datetime, timezone
from bson import ObjectId

from app.config import settings
from app.database import get_database
from app.utils.dependencies import get_current_user
from app.utils.validators import validate_image_file

router = APIRouter(prefix="/uploads", tags=["File Uploads"])

UPLOAD_DIR_PATH = Path(__file__).resolve().parent.parent.parent / settings.UPLOAD_DIR
UPLOAD_DIR_PATH.mkdir(parents=True, exist_ok=True)

@router.post("", response_model=List[str])
async def upload_images(
    files: List[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user)
):
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Cannot upload more than 10 images at once.")

    saved_urls = []
    for file in files:
        validate_image_file(file, max_size_mb=settings.MAX_FILE_SIZE_MB)
        ext = os.path.splitext(file.filename)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        destination = UPLOAD_DIR_PATH / unique_filename

        content = await file.read()
        if len(content) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
            raise HTTPException(status_code=400, detail=f"File {file.filename} exceeds {settings.MAX_FILE_SIZE_MB}MB limit.")

        with open(destination, "wb") as f:
            f.write(content)

        file_url = f"/uploads/{unique_filename}"
        saved_urls.append(file_url)

    return saved_urls

@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
) -> Dict[str, Any]:
    validate_image_file(file, max_size_mb=settings.MAX_FILE_SIZE_MB)
    ext = os.path.splitext(file.filename or "")[1].lower() or ".jpg"
    unique_filename = f"avatar_{current_user['id']}_{uuid.uuid4().hex[:8]}{ext}"
    destination = UPLOAD_DIR_PATH / unique_filename

    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File exceeds {settings.MAX_FILE_SIZE_MB}MB limit.")

    with open(destination, "wb") as f:
        f.write(content)

    file_url = f"/uploads/{unique_filename}"
    now = datetime.now(timezone.utc)

    # 1. Update user document
    await db.users.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {"avatar_url": file_url, "updated_at": now}}
    )

    # 2. Propagate to user's listings if owner
    await db.listings.update_many(
        {"owner_id": current_user["id"]},
        {"$set": {"owner_avatar": file_url}}
    )

    # 3. Propagate to user's roommate posts
    await db.roommate_posts.update_many(
        {"user_id": current_user["id"]},
        {"$set": {"user_avatar": file_url}}
    )

    return {
        "status": "success",
        "avatar_url": file_url,
        "message": "Profile picture updated successfully!"
    }


