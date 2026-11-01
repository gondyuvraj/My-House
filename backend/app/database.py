import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings
import pymongo

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

db_instance = Database()

async def connect_to_mongo():
    logger.info(f"Connecting to MongoDB at {settings.MONGO_URI} (DB: {settings.DB_NAME})")
    db_instance.client = AsyncIOMotorClient(settings.MONGO_URI)
    db_instance.db = db_instance.client[settings.DB_NAME]
    await create_indexes()
    logger.info("Successfully connected to MongoDB and verified indexes.")

async def close_mongo_connection():
    logger.info("Closing MongoDB connection")
    if db_instance.client:
        db_instance.client.close()

def get_database() -> AsyncIOMotorDatabase:
    try:
        if db_instance.client is None or db_instance.client.get_io_loop().is_closed():
            db_instance.client = AsyncIOMotorClient(settings.MONGO_URI)
            db_instance.db = db_instance.client[settings.DB_NAME]
    except Exception:
        db_instance.client = AsyncIOMotorClient(settings.MONGO_URI)
        db_instance.db = db_instance.client[settings.DB_NAME]
    return db_instance.db

async def create_indexes():
    db = db_instance.db
    try:
        # Users indexes
        await db.users.create_index("email", unique=True)
        await db.users.create_index("role")

        # Listings indexes
        # 2dsphere index for location search
        await db.listings.create_index([("location", pymongo.GEOSPHERE)])
        # Text index for search
        await db.listings.create_index([
            ("title", pymongo.TEXT),
            ("description", pymongo.TEXT),
            ("area", pymongo.TEXT),
            ("city", pymongo.TEXT)
        ])
        # Filter indexes
        await db.listings.create_index([("city", 1), ("type", 1), ("rent", 1)])
        await db.listings.create_index([("owner_id", 1)])
        await db.listings.create_index([("status", 1)])
        await db.listings.create_index([("created_at", -1)])

        # Roommate posts indexes
        await db.roommate_posts.create_index([("city", 1), ("post_type", 1)])
        await db.roommate_posts.create_index([("user_id", 1)])
        await db.roommate_posts.create_index([("created_at", -1)])

        # Favorites index
        await db.favorites.create_index([("user_id", 1), ("listing_id", 1)], unique=True)

        # Messages & Conversations indexes
        await db.messages.create_index([("conversation_id", 1), ("created_at", 1)])
        await db.conversations.create_index([("participants", 1)])
        await db.conversations.create_index([("updated_at", -1)])

        # Visit requests
        await db.visit_requests.create_index([("listing_id", 1), ("seeker_id", 1)])
        await db.visit_requests.create_index([("owner_id", 1)])

        # Reviews
        await db.reviews.create_index([("target_id", 1), ("target_type", 1)])
        await db.reviews.create_index([("author_id", 1)])

        # Reports
        await db.reports.create_index([("status", 1)])

        # Notifications
        await db.notifications.create_index([("user_id", 1), ("read", 1), ("created_at", -1)])

        logger.info("MongoDB indexes successfully created.")
    except Exception as e:
        logger.warning(f"Error creating indexes (may already exist): {e}")
