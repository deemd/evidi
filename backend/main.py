from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.database import mongodb
from app.api.api_v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    mongodb.connect()
    yield
    # Shutdown
    mongodb.close()


# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_TITLE,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    lifespan=lifespan # à vérifier
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api")


@app.get("/", response_class=HTMLResponse)
def read_root():
    """Root endpoint with API information."""
    return """
    <html>
        <head>
            <title>Evidi API</title>
        </head>
        <body>
            <h1>Welcome to Evidi API</h1>
            <p>Use the <a href="/docs">/docs</a> endpoint to explore the API documentation.</p>
        </body>
    </html>
    """


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


# Vercel handler
handler = app


# Local development server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=5001, reload=True)
