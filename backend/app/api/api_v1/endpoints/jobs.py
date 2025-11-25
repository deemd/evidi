from fastapi import APIRouter
from app.models.job import JobOut, JobSourceOut
from app.db.database import get_job_offers_collection, get_job_sources_collection

router = APIRouter()


@router.get("/offers", response_model=list[JobOut])
def get_job_offers():
    """Get all job offers."""
    job_offers_collection = get_job_offers_collection()
    job_offers = []
    
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


@router.get("/sources", response_model=list[JobSourceOut])
def get_job_sources():
    """Get all job sources."""
    job_sources_collection = get_job_sources_collection()
    sources = []
    
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