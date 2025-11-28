from pydantic import BaseModel, EmailStr

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