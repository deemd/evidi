# app/routers/jobs.py

from fastapi import APIRouter

from app.db import job_offers_collection, job_sources_collection
from app.models import JobOut, JobSourceOut

router = APIRouter(prefix="/api", tags=["jobs"])


# GET JOB OFFERS
@router.get("/job-offers", response_model=list[JobOut])
def get_job_offers():
    job_offers: list[JobOut] = []

    for doc in job_offers_collection.find():
        job_offers.append(
            JobOut(
                id=str(doc.get("id") or doc.get("_id")),
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
@router.get("/job-sources", response_model=list[JobSourceOut])
def get_job_sources():
    sources: list[JobSourceOut] = []
    for doc in job_sources_collection.find():
        sources.append(
            JobSourceOut(
                id=str(doc.get("id") or doc.get("_id")),
                name=doc["name"],
                type=doc["type"],
                url=doc["url"],
                enabled=bool(doc["enabled"]),
                lastSync=doc.get("lastSync"),
            )
        )
    return sources