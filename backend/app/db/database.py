from pymongo import MongoClient
# from pymongo.database import Database
from pymongo.collection import Collection
from app.core.config import settings

# Global MongoDB client (Vercel-friendly: lazy initialization)
_client = None
_db = None


def get_database():
    """Get MongoDB database (creates connection on first call)."""
    global _client, _db
    
    if _db is None:
        _client = MongoClient(settings.MONGO_URI)
        _db = _client[settings.DB_NAME]
        print(f"✅ Connected to MongoDB: {settings.DB_NAME}")
    
    return _db


def get_users_collection() -> Collection:
    """Get users collection."""
    db = get_database()
    return db[settings.USERS_COLLECTION_NAME]


def get_job_offers_collection() -> Collection:
    """Get job offers collection."""
    db = get_database()
    return db[settings.JOB_OFFERS_COLLECTION_NAME]


def get_job_sources_collection() -> Collection:
    """Get job sources collection."""
    db = get_database()
    return db[settings.JOB_SOURCES_COLLECTION_NAME]


# class MongoDB:
#     """MongoDB connection manager."""
    
#     def __init__(self):
#         self.client: MongoClient = None
#         self.db: Database = None
    
#     def connect(self):
#         """Initialize MongoDB connection."""
#         self.client = MongoClient(settings.MONGO_URI)
#         self.db = self.client[settings.DB_NAME]
#         print(f"✅ Connected to MongoDB: {settings.DB_NAME}")
    
#     def close(self):
#         """Close MongoDB connection."""
#         if self.client:
#             self.client.close()
#             print("✅ MongoDB connection closed")
    
#     def get_collection(self, collection_name: str) -> Collection:
#         """Get a MongoDB collection."""
#         return self.db[collection_name]


# # Global MongoDB instance
# mongodb = MongoDB()


# def get_users_collection() -> Collection:
#     """Get users collection."""
#     return mongodb.get_collection(settings.USERS_COLLECTION_NAME)


# def get_job_offers_collection() -> Collection:
#     """Get job offers collection."""
#     return mongodb.get_collection(settings.JOB_OFFERS_COLLECTION_NAME)


# def get_job_sources_collection() -> Collection:
#     """Get job sources collection."""
#     return mongodb.get_collection(settings.JOB_SOURCES_COLLECTION_NAME)