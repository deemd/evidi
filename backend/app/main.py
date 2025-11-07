"""
backend/app/main.py

FastAPI entrypoint for the Job Response Assistant backend.

Provides:
- GET /            -> simple health check / hello endpoint
- GET /test-mongo  -> read all test documents from test_collection
- POST /test-mongo -> insert a test document
- POST /webhook/n8n -> minimal endpoint for n8n job payloads
"""

from datetime import datetime
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel

from app.db import database

app = FastAPI(title="Job Response Backend")


class InsertItem(BaseModel):
    """Schema for inserting a test document."""

    name: str


@app.get("/")
def read_root() -> dict[str, str]:
    """Return a simple health check message."""
    return {"message": "Hello World!", "service": "job-response-backend"}


@app.get("/test-mongo")
def get_test_items() -> dict[str, Any]:
    """Return all documents from the test_collection."""
    try:
        coll = database.test_collection()
        docs = list(coll.find({}, {"_id": 0}))
        return {"items": docs}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/test-mongo")
def add_test_item(item: InsertItem) -> dict[str, Any]:
    """Insert a document into test_collection."""
    try:
        coll = database.test_collection()
        payload = {"name": item.name, "created_at": datetime.utcnow()}
        result = coll.insert_one(payload)
        return {"inserted_id": str(result.inserted_id)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/webhook/n8n")
async def n8n_webhook(request: Request) -> dict[str, Any]:
    """
    Receive job data from n8n via POST and store it in MongoDB.
    """
    payload = await request.json()
    try:
        ingested = database.get_db()["ingested_jobs"]
        payload["_received_at"] = datetime.utcnow()
        result = ingested.insert_one(payload)
        return {"status": "ok", "inserted_id": str(result.inserted_id)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
