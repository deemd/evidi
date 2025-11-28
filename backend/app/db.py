import os

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.collection import Collection

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
USERS_COLLECTION_NAME = os.getenv("USERS_COLLECTION_NAME")
JOB_OFFERS_COLLECTION_NAME = os.getenv("JOB_OFFERS_COLLECTION_NAME")
JOB_SOURCES_COLLECTION_NAME = os.getenv("JOB_SOURCES_COLLECTION_NAME")

if not MONGO_URI:
    raise RuntimeError("MONGO_URI is not set")
if not DB_NAME:
    raise RuntimeError("DB_NAME is not set")

client = MongoClient(MONGO_URI)

db = client[DB_NAME]

# Expose typed collections you can import in main.py
users_collection: Collection = db[USERS_COLLECTION_NAME]
job_offers_collection: Collection = db[JOB_OFFERS_COLLECTION_NAME]
job_sources_collection: Collection = db[JOB_SOURCES_COLLECTION_NAME]