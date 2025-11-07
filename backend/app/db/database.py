"""
backend/app/db/database.py

Central MongoDB connection helper used by the FastAPI app.
Uses pymongo (synchronous) and loads the MONGO_URI and DB_NAME
from the backend/.env file via python-dotenv.
"""

import os
from typing import Any

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.database import Database

# Ensure we load the .env file located two levels up from this file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env"))

MONGO_URI: str | None = os.getenv("MONGO_URI")
DB_NAME: str | None = os.getenv("DB_NAME", "job_response_db")

if not MONGO_URI:
    raise RuntimeError(
        "MONGO_URI is not set. Check backend/.env or environment variables."
    )

# Create the client (lazily connects on first operation)
_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)


def get_db() -> Database:
    """Return a pymongo Database instance for the configured DB_NAME."""
    return _client[DB_NAME]  # type: ignore[return-value]


def test_collection() -> Any:
    """Return a reference to the test_collection."""
    return get_db()["test_collection"]
