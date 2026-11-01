from datetime import datetime, timezone
from bson import ObjectId
from app.services.connection_manager import manager
import logging

logger = logging.getLogger(__name__)

async def create_notification(db, user_id: str, n_type: str, title: str, message: str, link: str = None) -> dict:
    notif_doc = {
        "user_id": str(user_id),
        "type": n_type, # message, visit_request, visit_status, price_drop, match, report
        "title": title,
        "message": message,
        "link": link,
        "read": False,
        "created_at": datetime.now(timezone.utc)
    }
    result = await db.notifications.insert_one(notif_doc)
    notif_doc["id"] = str(result.inserted_id)
    if "_id" in notif_doc:
        del notif_doc["_id"]
    
    # Real-time WebSocket push
    if manager.is_online(str(user_id)):
        await manager.send_personal_message({
            "type": "notification",
            "data": {
                **notif_doc,
                "created_at": notif_doc["created_at"].isoformat()
            }
        }, str(user_id))
    
    return notif_doc

