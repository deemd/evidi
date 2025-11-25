from fastapi import APIRouter, HTTPException, UploadFile, File
from app.models.user import (
    UserOut,
    UserProfileUpdate,
    ResumeUpdate,
    FiltersUpdate,
    FiltersModel,
    ResumeExtracted
)
from app.db.database import get_users_collection
from app.db.utils import get_default_filters
from app.core.config import settings
import httpx

router = APIRouter()


@router.get("/{email}", response_model=UserOut)
def get_user_profile(email: str):
    """Get user profile by email."""
    users_collection = get_users_collection()
    user = users_collection.find_one({"email": email})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    filters = user.get("filters", get_default_filters())

    return UserOut(
        id=user["email"],
        email=user["email"],
        full_name=user.get("full_name"),
        filters=FiltersModel(**filters),
        resume=user.get("resume"),
    )


@router.put("/{email}")
def update_user_profile(email: str, payload: UserProfileUpdate):
    """Update user profile information."""
    users_collection = get_users_collection()
    
    result = users_collection.update_one(
        {"email": email},
        {"$set": {"full_name": payload.full_name}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"status": "ok"}


@router.put("/{email}/resume")
def update_user_resume(email: str, payload: ResumeUpdate):
    """Update user resume text."""
    users_collection = get_users_collection()
    
    result = users_collection.update_one(
        {"email": email},
        {"$set": {"resume": payload.resume}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"status": "ok"}


@router.post("/{email}/resume/upload-analyze", response_model=ResumeExtracted)
async def upload_and_analyze_resume(email: str, file: UploadFile = File(...)):
    """Upload and analyze resume PDF via n8n webhook."""
    if not settings.N8N_WEBHOOK_URL:
        raise HTTPException(status_code=599, detail="N8N_WEBHOOK_URL is not configured")

    # Read the uploaded file bytes
    file_bytes = await file.read()

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    # Forward the file to n8n as multipart/form-data
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            settings.N8N_WEBHOOK_URL,
            data={
                "email": email,
                "filename": file.filename,
            },
            files={
                "file": (
                    file.filename,
                    file_bytes,
                    "application/octet-stream",
                )
            },
        )

    # If n8n fails, bubble up an error
    try:
        resp.raise_for_status()
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=500, detail=f"n8n error: {e.response.text}")

    # n8n has updated MongoDB, retrieve updated user
    users_collection = get_users_collection()
    user = users_collection.find_one({"email": email})
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found after n8n processing"
        )

    filters_dict = user.get("filters", get_default_filters())
    resume = user.get("resume")

    return ResumeExtracted(
        filters=FiltersModel(**filters_dict),
        resume=resume,
    )


@router.put("/{email}/filters")
def update_user_filters(email: str, payload: FiltersUpdate):
    """Update user job filters."""
    users_collection = get_users_collection()
    
    result = users_collection.update_one(
        {"email": email},
        {"$set": {"filters": payload.filters.dict()}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"status": "ok"}


@router.get("/{email}/filters")
def get_user_filters(email: str):
    """Get user job filters."""
    users_collection = get_users_collection()
    user = users_collection.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    filters = user.get("filters", get_default_filters())

    return {"filters": filters}