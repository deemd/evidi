from pydantic import BaseModel, EmailStr
from typing import Optional


class FiltersModel(BaseModel):
    """User filters for job matching."""
    stack: list[str] = []
    experience: list[str] = []
    keywords: list[str] = []
    location: list[str] = []
    jobType: list[str] = []
    excludeKeywords: list[str] = []


class LoginRequest(BaseModel):
    """Login request payload."""
    email: EmailStr
    pwd: str


class RegisterRequest(BaseModel):
    """Registration request payload."""
    full_name: str
    email: EmailStr
    pwd: str


class UserProfileUpdate(BaseModel):
    """User profile update payload."""
    full_name: str


class ResumeUpdate(BaseModel):
    """Resume update payload."""
    resume: Optional[str] = None


class FiltersUpdate(BaseModel):
    """Filters update payload."""
    filters: FiltersModel


class UserOut(BaseModel):
    """User output model."""
    id: str  # email is the ID
    email: EmailStr
    full_name: Optional[str] = None
    filters: FiltersModel = FiltersModel()
    resume: Optional[str] = None


class ResumeExtracted(BaseModel):
    """Resume extraction result."""
    filters: FiltersModel
    resume: Optional[str] = None