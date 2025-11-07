from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Charger les variables d'environnement à partir du fichier .env situé dans backend/
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env"))

# Récupérer les variables
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

# Tentative de connexion à MongoDB
try:
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    print("✅ Successfully connected to:", db.name)
    print("📦 Collections:", db.list_collection_names())

    # Test: create a sample document to ensure the DB is initialized
    # test_collection = db["test_collection"]
    # result = test_collection.insert_one({"status": "connected", "app": "job_response_assistant"})
    # print("📄 Inserted a test document into:", test_collection.name)
except Exception as e:
    print("❌ Connection failed:", e)
