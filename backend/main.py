import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
import httpx

# Default filters structure
def get_default_filters():
    return {
        "stack": [],
        "experience": [],
        "keywords": [],
        "location": [],
        "jobType": [],
        "excludeKeywords": []
    }



# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
USERS_COLLECTION_NAME = os.getenv("USERS_COLLECTION_NAME")
JOB_OFFERS_COLLECTION_NAME = os.getenv("JOB_OFFERS_COLLECTION_NAME")
JOB_SOURCES_COLLECTION_NAME = os.getenv("JOB_SOURCES_COLLECTION_NAME")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
users_collection = db[USERS_COLLECTION_NAME]
job_offers_collection = db[JOB_OFFERS_COLLECTION_NAME]
job_sources_collection = db[JOB_SOURCES_COLLECTION_NAME]

# N8N Webhook URL
N8N_WEBHOOK_URL = 'https://webhook-processor-production-3263.up.railway.app/webhook/2b5039b5-64a4-4caa-afc7-579bf1f6e1a5' # os.getenv("N8N_WEBHOOK_URL")

# FastAPI init
app = FastAPI(
    title="Evidi test FastAPI",
    description="Evidi API",
    version="1.0.0",
)



# CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5678",
    "https://test-vercel-pi-five.vercel.app",
    "https://evidi-frontend.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# MODELS
class LoginRequest(BaseModel):
    email: EmailStr
    pwd: str

class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    pwd: str

class UserProfileUpdate(BaseModel):
    full_name: str

class FiltersModel(BaseModel):
    stack: list[str] = []
    experience: list[str] = []
    keywords: list[str] = []
    location: list[str] = []
    jobType: list[str] = []
    excludeKeywords: list[str] = []

class UserOut(BaseModel):
    id: str                # email is the ID
    email: EmailStr
    full_name: str | None = None
    filters: FiltersModel = FiltersModel()
    resume: str | None = None

class ResumeUpdate(BaseModel):
    resume: str | None = None

class FiltersUpdate(BaseModel):
    filters: FiltersModel

class JobOut(BaseModel):
    id: str
    title: str
    company: str
    location: str
    type: str
    salary: str
    description: str
    requirements: list[str]
    stack: list[str]
    experience: str
    postedDate: str
    source: str
    url: str
    isMatch: bool
    matchScore: int
    aiSummary: str

class JobSourceOut(BaseModel):
    id: str
    name: str
    type: str
    url: str
    enabled: bool
    lastSync: str | None = None

class ResumeExtracted(BaseModel):
    filters: FiltersModel
    resume: str | None = None


# LOGIN
@app.post("/api/login", response_model=UserOut)
def login(data: LoginRequest):
    user = users_collection.find_one({"email": data.email})

    if not user or user.get("pwd") != data.pwd:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    filters = user.get("filters", get_default_filters())

    return UserOut(
        id=user["email"],                      # ✔ email = user ID
        email=user["email"],
        full_name=user.get("full_name"),
        filters=FiltersModel(**filters),
        resume=user.get("resume"),
    )

# REGISTER
@app.post("/api/register", response_model=UserOut)
def register(data: RegisterRequest):
    existing_user = users_collection.find_one({"email": data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = {
        "email": data.email,
        "full_name": data.full_name,
        "pwd": data.pwd,
        "filters": get_default_filters(),
        "resume": None
    }

    users_collection.insert_one(new_user)

    return UserOut(
        id=data.email,                         # ✔ email = ID
        email=data.email,
        full_name=data.full_name,
        filters=FiltersModel(**get_default_filters()),
        resume=None,
    )

# USER DETAILS
@app.get("/api/users/{email}", response_model=UserOut)
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
@app.put("/api/users/{email}")
def update_user_profile(email: str, payload: UserProfileUpdate):
    result = users_collection.update_one(
        {"email": email},
        {"$set": {"full_name": payload.full_name}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"status": "ok"}

# UPDATE USER RESUME
@app.put("/api/users/{email}/resume")
def update_user_resume(email: str, payload: ResumeUpdate):
    result = users_collection.update_one(
        {"email": email},
        {"$set": {"resume": payload.resume}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"status": "ok"}

# UPLOAD AND ANALYZE USER RESUME
@app.post("/api/users/{email}/resume/upload-analyze", response_model=ResumeExtracted)
async def upload_and_analyze_resume(email: str, file: UploadFile = File(...)):
    if not N8N_WEBHOOK_URL:
        raise HTTPException(status_code=599, detail="N8N_WEBHOOK_URL is not configured")

    # Read the uploaded file bytes
    file_bytes = await file.read()

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    # Forward the file directly to n8n as multipart/form-data
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

    # If n8n fails, bubble up an error
    try:
        resp.raise_for_status()
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=500, detail=f"n8n error: {e.response.text}")

    # At this point, n8n has updated MongoDB (filters, maybe resume)

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
@app.put("/api/users/{email}/filters")
def update_user_filters(email: str, payload: FiltersUpdate):
    result = users_collection.update_one(
        {"email": email},                      # ✔ identify by email
        {"$set": {"filters": payload.filters.dict()}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"status": "ok"}

# GET FILTERS
@app.get("/api/users/{email}/filters")
def get_user_filters(email: str):
    user = users_collection.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    filters = user.get("filters", get_default_filters())

    return {"filters": filters}

# JOB OFFERS
@app.get("/api/job-offers", response_model=list[JobOut])
def get_job_offers():
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

# JOB SOURCES
@app.get("/api/job-sources", response_model=list[JobSourceOut])
def get_job_sources():
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



# ROOT PAGE
@app.get("/", response_class=HTMLResponse)
def read_root():    
    return """
    <html>
        <head>
            <title>Evidi API</title>
        </head>
        <body>
            <h1>Welcome to Evidi test FastAPI</h1>
            <p>Use the /docs endpoint to explore the API documentation.</p>
        </body>
    </html>
    """



# UVICORN
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=True)
