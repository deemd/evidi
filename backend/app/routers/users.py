# app/routers/users.py

import os
import httpx
from fastapi import APIRouter, HTTPException, UploadFile, File

from app.db import users_collection
from app.models import (
    LoginRequest,
    RegisterRequest,
    UserProfileUpdate,
    FiltersModel,
    UserOut,
    ResumeUpdate,
    FiltersUpdate,
    ResumeExtracted,
)

router = APIRouter(prefix="/api", tags=["users"])

N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL")


def get_default_filters():
    return {
        "stack": [],
        "experience": [],
        "keywords": [],
        "location": [],
        "jobType": [],
        "excludeKeywords": [],
    }


# LOGIN
@router.post("/login", response_model=UserOut)
def login(data: LoginRequest):
    user = users_collection.find_one({"email": data.email})

    if not user or user.get("pwd") != data.pwd:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    filters = user.get("filters", get_default_filters())

    return UserOut(
        id=user["email"],
        email=user["email"],
        full_name=user.get("full_name"),
        filters=FiltersModel(**filters),
        resume=user.get("resume"),
    )


# REGISTER
@router.post("/register", response_model=UserOut)
def register(data: RegisterRequest):
    existing_user = users_collection.find_one({"email": data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = {
        "email": data.email,
        "full_name": data.full_name,
        "pwd": data.pwd,
        "filters": get_default_filters(),
        "resume": None,
    }

    users_collection.insert_one(new_user)

    return UserOut(
        id=data.email,
        email=data.email,
        full_name=data.full_name,
        filters=FiltersModel(**get_default_filters()),
        resume=None,
    )


# USER DETAILS
@router.get("/users/{email}", response_model=UserOut)
def get_user_profile(email: str):
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


# UPDATE USER PROFILE
@router.put("/users/{email}")
def update_user_profile(email: str, payload: UserProfileUpdate):
    result = users_collection.update_one(
        {"email": email},
        {"$set": {"full_name": payload.full_name}},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"status": "ok"}


# UPDATE USER RESUME
@router.put("/users/{email}/resume")
def update_user_resume(email: str, payload: ResumeUpdate):
    result = users_collection.update_one(
        {"email": email},
        {"$set": {"resume": payload.resume}},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"status": "ok"}


# UPLOAD AND ANALYZE USER RESUME
@router.post("/users/{email}/resume/upload-analyze", response_model=ResumeExtracted)
async def upload_and_analyze_resume(email: str, file: UploadFile = File(...)):
    if not N8N_WEBHOOK_URL:
        raise HTTPException(status_code=599, detail="N8N_WEBHOOK_URL is not configured")

    file_bytes = await file.read()

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            N8N_WEBHOOK_URL,
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

    try:
        resp.raise_for_status()
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=500, detail=f"n8n error: {e.response.text}")

    user = users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found after n8n processing")

    filters_dict = user.get("filters", get_default_filters())
    resume = user.get("resume")

    return ResumeExtracted(
        filters=FiltersModel(**filters_dict),
        resume=resume,
    )


# UPDATE FILTERS
@router.put("/users/{email}/filters")
def update_user_filters(email: str, payload: FiltersUpdate):
    result = users_collection.update_one(
        {"email": email},
        {"$set": {"filters": payload.filters.dict()}},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"status": "ok"}


# GET FILTERS
@router.get("/users/{email}/filters")
def get_user_filters(email: str):
    user = users_collection.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    filters = user.get("filters", get_default_filters())

    return {"filters": filters}
