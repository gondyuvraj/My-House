from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query, status
from datetime import datetime, timezone
from bson import ObjectId
from typing import List, Optional
import json
import logging

from app.database import get_database
from app.services.connection_manager import manager
from app.utils.security import decode_token
from app.utils.dependencies import get_current_user
from app.schemas.interaction import MessageCreate, MessageResponse, ConversationResponse
from app.services.notifications import create_notification

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["Real-time Chat"])

def get_conversation_id(user1: str, user2: str) -> str:
    # Deterministic conversation identifier between two users
    return "_".join(sorted([str(user1), str(user2)]))

@router.websocket("/ws")
async def websocket_chat_endpoint(websocket: WebSocket, token: str = Query(...), db = Depends(get_database)):
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    user_id = payload.get("sub")
    if not user_id:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(user_id, websocket)

    try:
        while True:
            data_text = await websocket.receive_text()
            try:
                data = json.loads(data_text)
            except Exception:
                continue

            event_type = data.get("type")

            if event_type == "message":
                receiver_id = data.get("receiver_id")
                content = data.get("content", "").strip()
                media_url = data.get("media_url")

                if not receiver_id or (not content and not media_url):
                    continue

                conv_id = get_conversation_id(user_id, receiver_id)
                now = datetime.now(timezone.utc)

                msg_doc = {
                    "conversation_id": conv_id,
                    "sender_id": user_id,
                    "sender_name": user.get("full_name", "User"),
                    "sender_avatar": user.get("avatar_url"),
                    "receiver_id": receiver_id,
                    "content": content,
                    "media_url": media_url,
                    "is_read": False,
                    "created_at": now
                }
                res = await db.messages.insert_one(msg_doc)
                msg_doc["id"] = str(res.inserted_id)

                # Upsert conversation
                await db.conversations.update_one(
                    {"conversation_id": conv_id},
                    {
                        "$set": {
                            "participants": [user_id, receiver_id],
                            "last_message": content or "[Image/Attachment]",
                            "last_message_at": now,
                            "updated_at": now
                        },
                        "$inc": {f"unread_{receiver_id}": 1}
                    },
                    upsert=True
                )

                # Send back to sender for confirmation
                await websocket.send_text(json.dumps({
                    "type": "new_message",
                    "data": {**msg_doc, "created_at": now.isoformat()}
                }))

                # Send to receiver if online
                await manager.send_personal_message({
                    "type": "new_message",
                    "data": {**msg_doc, "created_at": now.isoformat()}
                }, receiver_id)

                # Create in-app notification for receiver
                await create_notification(
                    db,
                    user_id=receiver_id,
                    n_type="message",
                    title=f"New message from {user.get('full_name')}",
                    message=content[:60] if content else "Sent you an attachment",
                    link=f"/chat?with={user_id}"
                )

            elif event_type == "typing":
                receiver_id = data.get("receiver_id")
                is_typing = data.get("is_typing", False)
                if receiver_id:
                    await manager.send_personal_message({
                        "type": "typing",
                        "sender_id": user_id,
                        "is_typing": is_typing
                    }, receiver_id)

            elif event_type == "read_receipt":
                conv_id = data.get("conversation_id")
                if conv_id:
                    await db.messages.update_many(
                        {"conversation_id": conv_id, "receiver_id": user_id, "is_read": False},
                        {"$set": {"is_read": True}}
                    )
                    await db.conversations.update_one(
                        {"conversation_id": conv_id},
                        {"$set": {f"unread_{user_id}": 0}}
                    )

    except WebSocketDisconnect:
        await manager.disconnect(user_id, websocket)
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        await manager.disconnect(user_id, websocket)

@router.get("/conversations", response_model=List[ConversationResponse])
async def get_my_conversations(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    user_id = current_user["id"]
    cursor = db.conversations.find({"participants": user_id}).sort("updated_at", -1)
    conv_list = await cursor.to_list(length=100)

    result = []
    for c in conv_list:
        participants = c.get("participants", [])
        other_id = [p for p in participants if p != user_id]
        if not other_id:
            continue
        other_user_id = other_id[0]

        try:
            other_user = await db.users.find_one({"_id": ObjectId(other_user_id)})
        except Exception:
            other_user = None

        if not other_user:
            continue

        result.append({
            "id": c.get("conversation_id", f"{user_id}_{other_user_id}"),
            "other_user_id": other_user_id,
            "other_user_name": other_user.get("full_name", "User"),
            "other_user_avatar": other_user.get("avatar_url"),
            "other_user_online": manager.is_online(other_user_id),
            "last_message": c.get("last_message"),
            "last_message_at": c.get("last_message_at"),
            "unread_count": c.get(f"unread_{user_id}", 0)
        })

    return result

@router.get("/messages/{conversation_id}", response_model=List[MessageResponse])
async def get_conversation_messages(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    # Mark messages as read
    await db.messages.update_many(
        {"conversation_id": conversation_id, "receiver_id": current_user["id"], "is_read": False},
        {"$set": {"is_read": True}}
    )
    await db.conversations.update_one(
        {"conversation_id": conversation_id},
        {"$set": {f"unread_{current_user['id']}": 0}}
    )

    cursor = db.messages.find({"conversation_id": conversation_id}).sort("created_at", 1).limit(200)
    docs = await cursor.to_list(length=200)

    return [
        {
            "id": str(d["_id"]),
            "conversation_id": d["conversation_id"],
            "sender_id": d["sender_id"],
            "sender_name": d.get("sender_name", ""),
            "sender_avatar": d.get("sender_avatar"),
            "receiver_id": d["receiver_id"],
            "content": d.get("content", ""),
            "media_url": d.get("media_url"),
            "is_read": d.get("is_read", False),
            "created_at": d.get("created_at", datetime.now(timezone.utc))
        }
        for d in docs
    ]

@router.post("/send", response_model=MessageResponse)
async def send_message_rest(
    msg: MessageCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    receiver_id = msg.receiver_id
    try:
        rec_user = await db.users.find_one({"_id": ObjectId(receiver_id)})
    except Exception:
        rec_user = None

    if not rec_user:
        raise HTTPException(status_code=404, detail="Recipient user not found")

    user_id = current_user["id"]
    conv_id = get_conversation_id(user_id, receiver_id)
    now = datetime.now(timezone.utc)

    msg_doc = {
        "conversation_id": conv_id,
        "sender_id": user_id,
        "sender_name": current_user.get("full_name", "User"),
        "sender_avatar": current_user.get("avatar_url"),
        "receiver_id": receiver_id,
        "content": msg.content,
        "media_url": msg.media_url,
        "is_read": False,
        "created_at": now
    }
    res = await db.messages.insert_one(msg_doc)
    msg_doc["id"] = str(res.inserted_id)

    # Upsert conversation
    await db.conversations.update_one(
        {"conversation_id": conv_id},
        {
            "$set": {
                "participants": [user_id, receiver_id],
                "last_message": msg.content or "[Attachment]",
                "last_message_at": now,
                "updated_at": now
            },
            "$inc": {f"unread_{receiver_id}": 1}
        },
        upsert=True
    )

    # Push to recipient if online
    await manager.send_personal_message({
        "type": "new_message",
        "data": {**msg_doc, "created_at": now.isoformat()}
    }, receiver_id)

    # Create notification
    await create_notification(
        db,
        user_id=receiver_id,
        n_type="message",
        title=f"New message from {current_user.get('full_name')}",
        message=msg.content[:60],
        link=f"/chat?with={user_id}"
    )

    return msg_doc

