# app/main.py

import os
import dotenv

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables from .env file
dotenv.load_dotenv()

# Import routers
from app.routers import users, jobs

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
    "https://evidi-frontend.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router)
app.include_router(jobs.router)

# ROOT PAGE
@app.get("/", response_class=HTMLResponse)
def read_root():
    return """
    <html>
        <head>
            <title>Evidi API</title>
        </head>
        <body>
            <h1>Welcome to Evidi API</h1>
            <p>Use the <a href="/docs">/docs</a> or <a href="/redoc">/redoc</a> endpoints to explore the API documentation.</p>
        </body>
    </html>
    """


# UVICORN (optional, if you like running `python -m app.main`)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=5001, reload=True)