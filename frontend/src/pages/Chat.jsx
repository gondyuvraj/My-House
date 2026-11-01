import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Send, Image as ImageIcon, Search, MessageSquare, 
  Circle, CheckCheck, Check, Paperclip, MoreVertical, ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import apiClient from '../api/client';
import { getDisplayAvatar } from '../utils/avatarPresets';
import toast from 'react-hot-toast';

export default function Chat() {
  const { user } = useAuth();
  const { 
    conversations, activeConversationId, activeOtherUser, messages, 
    onlineUserIds, typingUsers, openChatWithUser, sendMessage, 
    sendTyping, loadMessages 
  } = useChat();

  const [searchParams] = useSearchParams();
  const withUserId = searchParams.get('with');

  const [inputMessage, setInputMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // If query param ?with=ID is present, load or open that user
  useEffect(() => {
    if (withUserId && (!activeOtherUser || activeOtherUser.id !== withUserId)) {
      const fetchTargetUser = async () => {
        try {
          const res = await apiClient.get(`/users/${withUserId}`);
          openChatWithUser(res.data);
        } catch (e) {
          console.error("Failed to load user for chat:", e);
        }
      };
      fetchTargetUser();
    }
  }, [withUserId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendMessage(inputMessage);
    setInputMessage('');
    sendTyping(false);
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    sendTyping(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('files', file);

    try {
      const res = await apiClient.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const fileUrl = res.data[0];
      const fullUrl = fileUrl.startsWith('http') ? fileUrl : `http://localhost:8000${fileUrl}`;
      sendMessage('', fullUrl);
      toast.success("Image sent!");
    } catch (err) {
      toast.error("Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.other_user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isOtherOnline = activeOtherUser && onlineUserIds.has(activeOtherUser.id);
  const isOtherTyping = activeOtherUser && typingUsers.has(activeOtherUser.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft-lg overflow-hidden h-[calc(100vh-140px)] min-h-[550px] grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
        
        {/* Left Column: Conversations List */}
        <div className="border-r border-slate-200 dark:border-slate-800 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50">
          
          {/* Header & Search */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-rose-600" />
              Direct Messages
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <p>No active conversations yet.</p>
                <p className="mt-1">Click "Contact Owner" on any listing to start chatting!</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = activeConversationId === conv.id;
                const isOnline = onlineUserIds.has(conv.other_user_id);
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      openChatWithUser({
                        id: conv.other_user_id,
                        full_name: conv.other_user_name,
                        avatar_url: conv.other_user_avatar
                      });
                    }}
                    className={`p-3.5 cursor-pointer flex items-center space-x-3 transition-colors ${
                      isActive
                        ? 'bg-rose-50/80 dark:bg-rose-950/40 border-l-4 border-rose-600'
                        : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={getDisplayAvatar(conv.other_user_avatar, conv.other_user_name)}
                        alt={conv.other_user_name}
                        className="w-11 h-11 rounded-2xl object-cover border border-rose-200 dark:border-rose-900 bg-white dark:bg-slate-800"
                        onError={(e) => {
                          e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(conv.other_user_name || 'user')}`;
                        }}
                      />
                      {isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {conv.other_user_name}
                        </p>
                        {conv.last_message_at && (
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                          {conv.last_message || "Started a conversation"}
                        </p>
                        {conv.unread_count > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-rose-600 to-indigo-600 text-white shrink-0 shadow-sm">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Chat View */}
        <div className="md:col-span-2 lg:col-span-3 flex flex-col h-full bg-white dark:bg-slate-900">
          {activeOtherUser ? (
            <>
              {/* Active Chat Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={getDisplayAvatar(activeOtherUser.avatar_url, activeOtherUser.full_name)}
                      alt={activeOtherUser.full_name}
                      className="w-10 h-10 rounded-2xl object-cover border border-rose-200 dark:border-rose-900 bg-white dark:bg-slate-800"
                      onError={(e) => {
                        e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(activeOtherUser.full_name || 'user')}`;
                      }}
                    />
                    {isOtherOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center">
                      {activeOtherUser.full_name}
                    </h3>
                    <p className="text-[11px] text-slate-400 flex items-center">
                      {isOtherTyping ? (
                        <span className="text-rose-600 font-bold animate-pulse">Typing...</span>
                      ) : isOtherOnline ? (
                        <span className="text-emerald-500 font-semibold">Active now</span>
                      ) : (
                        <span>Offline</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Flow */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30 dark:bg-slate-950/20">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-400">
                    <p>No messages yet. Say hello to {activeOtherUser.full_name}!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end space-x-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMe && (
                          <img
                            src={getDisplayAvatar(msg.sender_avatar, msg.sender_name)}
                            alt="avatar"
                            className="w-6 h-6 rounded-full shrink-0 mb-1 object-cover"
                            onError={(e) => {
                              e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(msg.sender_name || 'user')}`;
                            }}
                          />
                        )}

                        <div
                          className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 text-xs font-medium space-y-1 ${
                            isMe
                              ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white rounded-br-none shadow-md shadow-rose-500/20'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200/80 dark:border-slate-700'
                          }`}
                        >
                          {msg.media_url && (
                            <img
                              src={msg.media_url}
                              alt="attachment"
                              className="w-full max-h-56 object-cover rounded-xl mb-1 cursor-pointer"
                              onClick={() => window.open(msg.media_url, '_blank')}
                            />
                          )}

                          {msg.content && <p className="leading-relaxed">{msg.content}</p>}

                          <div className={`flex items-center justify-end space-x-1 text-[10px] ${isMe ? 'text-rose-100' : 'text-slate-400'}`}>
                            <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isMe && (
                              msg.is_read ? <CheckCheck className="w-3 h-3 text-emerald-300" /> : <Check className="w-3 h-3 opacity-70" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2 bg-white dark:bg-slate-900">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="p-2.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-md shadow-rose-500/20 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="w-14 h-14 text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Select a Conversation</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Pick a host or roommate from the left pane to send instant messages and coordinate visits.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

