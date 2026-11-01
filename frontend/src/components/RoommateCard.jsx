import React from 'react';
import { MessageSquare, ShieldCheck, MapPin, Sparkles, CheckCircle2, User, Trash2 } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { getDisplayAvatar } from '../utils/avatarPresets';
import toast from 'react-hot-toast';

export default function RoommateCard({ post, onDelete }) {
  const { openChatWithUser } = useChat();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isOwner = user && (user.id === post.user_id || user.role === 'admin');

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this roommate post?")) return;
    try {
      await apiClient.delete(`/roommates/${post.id}`);
      toast.success("Roommate post removed successfully!");
      if (onDelete) onDelete(post.id);
    } catch (err) {
      toast.error("Failed to delete post: " + (err.response?.data?.detail || err.message));
    }
  };

  const score = post.compatibility_score || 85;
  const isNeedRoommate = post.post_type === 'need_roommate';

  // Ring stroke calculation (radius = 18, circumference ≈ 113)
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const scoreColor = score >= 85 ? 'text-rose-500' : score >= 70 ? 'text-indigo-500' : 'text-amber-500';

  const handleConnect = () => {
    openChatWithUser({
      id: post.user_id,
      full_name: post.user_name,
      avatar_url: post.user_avatar
    });
    navigate('/chat');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 hover:border-rose-300/80 dark:hover:border-rose-900/60 shadow-soft hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300 p-5 flex flex-col justify-between hover:-translate-y-1">
      <div>
        {/* Top Header: User Profile + Compatibility Ring */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={getDisplayAvatar(post.user_avatar, post.user_name)}
                alt={post.user_name}
                className="w-13 h-13 rounded-2xl border-2 border-rose-300/70 dark:border-rose-800 object-cover shadow-sm bg-white dark:bg-slate-800"
                onError={(e) => {
                  e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(post.user_name || 'user')}`;
                }}
              />
              {post.user_verified && (
                <ShieldCheck className="absolute -bottom-1 -right-1 w-4 h-4 text-emerald-500 bg-white dark:bg-slate-900 rounded-full" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-1.5">
                {post.user_name}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({post.user_age}y)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize font-medium">{post.user_occupation}</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center mt-0.5">
                <MapPin className="w-3 h-3 text-rose-600 mr-1" />
                {post.city}
              </p>
            </div>
          </div>

          {/* Compatibility Ring */}
          <div className="flex flex-col items-center">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="3.5"
                  className="text-slate-100 dark:text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className={`${scoreColor} transition-all duration-1000 ease-out`}
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-xs font-black text-slate-900 dark:text-white">
                {score}%
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-0.5">Match</span>
          </div>
        </div>

        {/* Post Type Badge & Rent */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-1.5">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
              isNeedRoommate
                ? 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/40'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-900/40'
            }`}>
              {isNeedRoommate ? "Has Room (Needs Flatmate)" : "Looking for Room / Flatmate"}
            </span>
            <div className="text-right">
              <span className="text-sm font-black text-slate-900 dark:text-white">
                ₹{post.approx_rent?.toLocaleString('en-IN')}<span className="text-[11px] font-normal text-slate-400">/mo</span>
              </span>
            </div>
          </div>

          {/* Configuration & Move-in Highlights */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
            {post.property_bhk && (
              <span className="px-2 py-0.5 rounded-md font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                {post.property_bhk}
              </span>
            )}
            {post.room_type && (
              <span className="px-2 py-0.5 rounded-md font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40">
                {post.room_type}
              </span>
            )}
            {post.furnishing && (
              <span className="px-2 py-0.5 rounded-md font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                {post.furnishing}
              </span>
            )}
            <span className="text-slate-400 font-semibold ml-auto">
              Avail: <strong className="text-slate-700 dark:text-slate-200">{post.available_from || 'Immediate'}</strong>
            </span>
          </div>

          <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 line-clamp-1">
            {post.title}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {post.description}
          </p>

          {/* Preferred Areas if specified */}
          {post.preferred_areas && post.preferred_areas.length > 0 && (
            <div className="flex flex-wrap gap-1 text-[10px] text-slate-500">
              <span className="font-bold text-slate-400">Areas:</span>
              {post.preferred_areas.slice(0, 3).map((area, idx) => (
                <span key={idx} className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800/80 font-medium">
                  {area}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Compatibility Reasons Box */}
        {post.compatibility_reasons && post.compatibility_reasons.length > 0 && (
          <div className="mt-3.5 p-2.5 rounded-2xl bg-rose-50/40 dark:bg-slate-800/60 border border-rose-100/70 dark:border-slate-800 text-[11px] space-y-1">
            <div className="flex items-center text-rose-600 dark:text-rose-400 font-bold mb-1">
              <Sparkles className="w-3 h-3 mr-1" />
              <span>Why you match:</span>
            </div>
            {post.compatibility_reasons.slice(0, 3).map((r, idx) => (
              <div key={idx} className="flex items-center text-slate-600 dark:text-slate-300 font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 mr-1.5 shrink-0" />
                <span className="truncate">{r}</span>
              </div>
            ))}
          </div>
        )}

        {/* Habits summary tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.lifestyle?.food_preference && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
              Food: {post.lifestyle.food_preference}
            </span>
          )}
          {post.lifestyle?.sleep_schedule && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
              {post.lifestyle.sleep_schedule.replace('_', ' ')}
            </span>
          )}
          {post.lifestyle?.cleanliness && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Cleanliness: {post.lifestyle.cleanliness}/5
            </span>
          )}
        </div>
      </div>

      {/* Connect or Author Action button */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-500">Gender pref: <strong className="capitalize text-slate-700 dark:text-slate-300">{post.gender_preference}</strong></span>
        {isOwner ? (
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-slate-400">Your Post</span>
            <button
              onClick={handleDelete}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/50 transition-colors"
              title="Delete post"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-md shadow-rose-500/20 active:scale-95 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat Now</span>
          </button>
        )}
      </div>
    </div>
  );
}
