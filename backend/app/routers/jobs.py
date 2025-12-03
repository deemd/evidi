import os
import httpx
from fastapi import APIRouter, HTTPException, UploadFile, File

from app.db import job_offers_collection, job_sources_collection
from app.models import JobOut, JobSourceOut, JobSourceCreate
from bson import ObjectId

router = APIRouter(prefix="/api", tags=["jobs"])

N8N_WEBHOOK_LOAD_NEW_JOBS = os.getenv("N8N_WEBHOOK_LOAD_NEW_JOBS")


# GET JOB OFFERS
@router.get("/users/{email}/job-offers", response_model=list[JobOut])
def get_job_offers(email: str):
    job_offers: list[JobOut] = []

    filtered_job_offers = job_offers_collection.find({"user_id": email})

    for doc in filtered_job_offers:
        job_offers.append(
            JobOut(
                id=str(doc.get("_id")),
                title=doc["title"],
                company=doc["company"],
                location=doc["location"],
                type=doc["type"],
                salary=doc["salary"],
                description=doc["description"],
                requirements=doc.get("requirements", []),
                stack=doc.get("stack", []),
                experience=doc["experience"],
                postedDate=doc["postedDate"],
                source=doc["source"],
                url=doc["url"],
                isMatch=doc["isMatch"],
                matchScore=doc["matchScore"],
                aiSummary=doc["aiSummary"],
            )
        )

    return job_offers


# JOB SOURCES
@router.get("/users/{email}/job-sources", response_model=list[JobSourceOut])
def get_job_sources(email: str):
    job_sources: list[JobSourceOut] = []
    
    filtered_job_sources = job_sources_collection.find({"user_id": email})

    for doc in filtered_job_sources:
        job_sources.append(
            JobSourceOut(
                id=str(doc.get("_id")),
                name=doc["name"],
                type=doc["type"],
                url=doc["url"],
                enabled=bool(doc["enabled"]),
                lastSync=doc.get("lastSync"),
            )
        )

    return job_sources

# TRIGGER LOAD NEW JOBS FROM APIFY/N8N
@router.post("/job-offers/load-new")
async def load_new_job_offers(user_email: str):
    if not N8N_WEBHOOK_LOAD_NEW_JOBS:
        raise HTTPException(
            status_code=599,
            detail="N8N_WEBHOOK_LOAD_NEW_JOBS is not configured",
        )

    if not user_email:
        raise HTTPException(
            status_code=400,
            detail="'user_email' must be provided",
        )

    payload = {
        "user_email": user_email
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(N8N_WEBHOOK_LOAD_NEW_JOBS, json=payload)

    try:
        resp.raise_for_status()
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=500,
            detail=f"n8n error: {e.response.text}",
        )

    return {"status": "ok"}

# CREATE JOB SOURCE
@router.post("/job-sources", response_model=JobSourceOut)
def create_job_source(payload: JobSourceCreate):
    """
    Create a job source.

    Example body:
    {
      "name": "LinkedIn Jobs RSS",
      "type": "API",
      "url": "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?...",
      "enabled": true,
      "lastSync": null,
      "user_id": "a@gmail.com"
    }
    """
    doc = {
        "name": payload.name,
        "type": payload.type,
        "url": payload.url,
        "enabled": payload.enabled,
        "lastSync": payload.lastSync,
        "user_id": payload.user_id,
    }

    result = job_sources_collection.insert_one(doc)

    return JobSourceOut(
        id=str(result.inserted_id),
        name=payload.name,
        type=payload.type,
        url=payload.url,
        enabled=payload.enabled,
        lastSync=payload.lastSync,
    )


# DELETE JOB SOURCE
@router.delete("/job-sources/{source_id}")
def delete_job_source(source_id: str):
    """
    Delete a job source by its unique ID (MongoDB _id as exposed in JobSourceOut.id).
    """
    try:
        obj_id = ObjectId(source_id)
    except Exception:
        # If it's not a valid ObjectId, we treat it as not found
        raise HTTPException(status_code=400, detail="Invalid job source id")

    result = job_sources_collection.delete_one({"_id": obj_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job source not found")

    return {"status": "ok"}
