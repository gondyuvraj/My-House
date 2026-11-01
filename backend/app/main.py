from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import logging
from pathlib import Path

from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import auth, users, listings, roommates, favorites, chat, interactions, admin, uploads

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("my_house_app")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up 'My House' API...")
    await connect_to_mongo()
    yield
    # Shutdown
    logger.info("Shutting down 'My House' API...")
    await close_mongo_connection()

app = FastAPI(
    title="My House API",
    description="Backend API for My House - Modern PG, Room & Roommate Discovery Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Configuration
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all during local development for smooth cross-device access
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for local uploads
uploads_dir = Path(__file__).resolve().parent.parent / settings.UPLOAD_DIR
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# Include Routers under /api/v1
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(listings.router, prefix=settings.API_V1_STR)
app.include_router(roommates.router, prefix=settings.API_V1_STR)
app.include_router(favorites.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(interactions.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(uploads.router, prefix=settings.API_V1_STR)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "My House API",
        "version": "1.0.0"
    }

@app.get("/")
async def root():
    return {
        "message": "Welcome to My House API! Visit /docs for the Swagger interactive documentation.",
        "version": "1.0.0"
    }

