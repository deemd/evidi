from pydantic import BaseModel
from typing import Optional


class JobOut(BaseModel):
    """Job offer output model."""
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
    """Job source output model."""
    id: str
    name: str
    type: str
    url: str
    enabled: bool
    lastSync: Optional[str] = None