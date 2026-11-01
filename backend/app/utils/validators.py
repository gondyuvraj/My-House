from fastapi import UploadFile, HTTPException
import os

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}

def validate_image_file(file: UploadFile, max_size_mb: int = 10):
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file extension {ext}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid content type {file.content_type}. Must be an image (JPEG, PNG, WEBP)."
        )

def sanitize_string(val: str) -> str:
    if not val:
        return ""
    # Strip dangerous HTML script tags
    cleaned = val.replace("<script>", "").replace("</script>", "")
    return cleaned.strip()

