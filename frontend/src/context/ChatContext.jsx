import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import apiClient from '../api/client';
import { getDisplayAvatar } from '../utils/avatarPresets';
import toast from 'react-hot-toast';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeOtherUser, setActiveOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [unreadTotal, setUnreadTotal] = useState(0);

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Fetch initial conversations list
  const loadConversations = async () => {
    if (!token) return;
    try {
      const res = await apiClient.get('/chat/conversations');
      setConversations(res.data);
      const total = res.data.reduce((acc, c) => acc + (c.unread_count || 0), 0);
      setUnreadTotal(total);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  useEffect(() => {
    if (user && token) {
      loadConversations();
    } else {
      setConversations([]);
      setMessages([]);
      setActiveConversationId(null);
      setActiveOtherUser(null);
    }
  }, [user, token]);

  // WebSocket Connection
  useEffect(() => {
    if (!token || !user) {
      if (socketRef.current) {
        socketRef.current.close();
      }
      return;
    }

    const wsUrl = `ws://localhost:8000/api/v1/chat/ws?token=${token}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("[WebSocket] Connected to My House Chat");
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === 'new_message') {
          const newMsg = payload.data;
          
          // If message belongs to active open chat, append immediately
          setMessages((prev) => {
            if (activeConversationId === newMsg.conversation_id || 
                (newMsg.sender_id === activeOtherUser?.id || newMsg.receiver_id === activeOtherUser?.id)) {
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            }
            return prev;
          });

          // If incoming from someone else and not in active chat, show toast
          if (newMsg.sender_id !== user.id) {
            if (activeConversationId !== newMsg.conversation_id) {
              toast((t) => (
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => {
                  openChatWithUser({ id: newMsg.sender_id, full_name: newMsg.sender_name, avatar_url: newMsg.sender_avatar });
                  toast.dismiss(t.id);
                }}>
                  <img
                    src={getDisplayAvatar(newMsg.sender_avatar, newMsg.sender_name)}
                    className="w-9 h-9 rounded-full object-cover border border-rose-300 dark:border-rose-800"
                    alt="avatar"
                    onError={(e) => {
                      e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newMsg.sender_id || 'user')}`;
                    }}
                  />
                  <div>
                    <p className="text-xs font-bold text-brand-700 dark:text-brand-300">{newMsg.sender_name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-[200px]">{newMsg.content}</p>
                  </div>
                </div>
              ), { duration: 4000 });
            }
          }

          // Refresh conversation list for updated preview & counter
          loadConversations();
        } 
        else if (payload.type === 'status_update') {
          setOnlineUserIds((prev) => {
            const updated = new Set(prev);
            if (payload.is_online) {
              updated.add(payload.user_id);
            } else {
              updated.delete(payload.user_id);
            }
            return updated;
          });
        }
        else if (payload.type === 'typing') {
          if (payload.is_typing) {
            setTypingUsers((prev) => new Set(prev).add(payload.sender_id));
          } else {
            setTypingUsers((prev) => {
              const updated = new Set(prev);
              updated.delete(payload.sender_id);
              return updated;
            });
          }
        }
        else if (payload.type === 'notification') {
          toast(payload.data.title + ": " + payload.data.message, { icon: '🔔' });
        }
      } catch (e) {
        console.error("Failed to parse WebSocket message:", e);
      }
    };

    ws.onclose = () => {
      console.log("[WebSocket] Chat disconnected. Reconnecting in 3s...");
      reconnectTimeoutRef.current = setTimeout(() => {
        if (token && user) {
          // Trigger effect re-run if still authenticated
        }
      }, 3000);
    };

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) socketRef.current.close();
    };
  }, [token, user, activeConversationId, activeOtherUser]);

  // Load messages for a conversation
  const loadMessages = async (convId) => {
    try {
      const res = await apiClient.get(`/chat/messages/${convId}`);
      setMessages(res.data);
      // Send read receipt over socket
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: "read_receipt",
          conversation_id: convId
        }));
      }
      loadConversations();
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  // Open chat with a user (by clicking 'Contact Owner' or from conversation list)
  const openChatWithUser = (targetUser) => {
    if (!user) {
      toast.error("Please log in to chat.");
      return;
    }
    const convId = [user.id, targetUser.id].sort().join('_');
    setActiveConversationId(convId);
    setActiveOtherUser(targetUser);
    loadMessages(convId);
  };

  const sendMessage = async (content, mediaUrl = null) => {
    if (!activeOtherUser || (!content.trim() && !mediaUrl)) return;

    const payload = {
      type: "message",
      receiver_id: activeOtherUser.id,
      content: content.trim(),
      media_url: mediaUrl
    };

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
    } else {
      // Fallback to REST endpoint
      try {
        const res = await apiClient.post('/chat/send', {
          receiver_id: activeOtherUser.id,
          content: content.trim(),
          media_url: mediaUrl
        });
        setMessages((prev) => [...prev, res.data]);
        loadConversations();
      } catch (err) {
        toast.error("Failed to send message");
      }
    }
  };

  const sendTyping = (isTyping) => {
    if (!activeOtherUser || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(JSON.stringify({
      type: "typing",
      receiver_id: activeOtherUser.id,
      is_typing: isTyping
    }));
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversationId,
        activeOtherUser,
        messages,
        unreadTotal,
        onlineUserIds,
        typingUsers,
        openChatWithUser,
        setActiveConversationId,
        sendMessage,
        sendTyping,
        loadConversations,
        loadMessages
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);

