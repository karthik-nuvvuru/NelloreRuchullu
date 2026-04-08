"""File upload routes."""
from __future__ import annotations

import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.staticfiles import StaticFiles

from app.core.security import require_role
from app.config import settings

router = APIRouter(prefix="/uploads", tags=["Uploads"])

# Ensure upload directory exists
UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Serve uploaded files
os.makedirs(UPLOAD_DIR, exist_ok=True)


ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    _: str = Depends(require_role("admin", "vendor")),
) -> dict:
    """Upload an image file."""
    # Validate file type
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Read and validate file size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 5MB"
        )

    # Generate unique filename
    unique_id = str(uuid.uuid4())
    filename = f"{unique_id}{ext}"
    filepath = UPLOAD_DIR / filename

    # Write file
    with open(filepath, "wb") as f:
        f.write(contents)

    # Return the URL path (relative)
    return {
        "url": f"/uploads/{filename}",
        "filename": filename,
    }
