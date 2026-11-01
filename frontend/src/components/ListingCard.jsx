import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, ShieldCheck, Star, Bed, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { getAmenityInfo } from '../utils/amenities';
import { getDisplayAvatar } from '../utils/avatarPresets';
import toast from 'react-hot-toast';

export default function ListingCard({ listing, onVisitClick }) {
  const { isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(listing.is_favorited || false);
  const [favCount, setFavCount] = useState(listing.favorites_count || 0);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Please login to save to wishlist");
      return;
    }
    try {
      const res = await apiClient.post(`/favorites/${listing.id}`);
      setIsFavorited(res.data.favorited);
      setFavCount(prev => res.data.favorited ? prev + 1 : Math.max(0, prev - 1));
      toast.success(res.data.message);
    } catch (err) {
      toast.error("Failed to update wishlist");
    }
  };

  const images = listing.images && listing.images.length > 0 ? listing.images : [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80"
  ];

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 hover:border-rose-300/80 dark:hover:border-rose-900/60 shadow-soft hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300 overflow-hidden flex flex-col justify-between hover:-translate-y-1">
      <div>
        {/* Image & Badges */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={images[0]}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

          {/* Type Badge */}
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase bg-gradient-to-r from-rose-600 to-pink-600 text-white backdrop-blur-md shadow-md shadow-rose-900/40">
            {listing.type}
          </span>

          {/* Gender Preference Badge */}
          {listing.gender_preference && listing.gender_preference !== 'any' && (
            <span className="absolute top-3 left-22 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide capitalize bg-slate-900/85 text-white backdrop-blur-md border border-white/10 shadow-sm">
              {listing.gender_preference} Only
            </span>
          )}

          {/* Favorite Button */}
          <button
            onClick={toggleFavorite}
            aria-label="Save to wishlist"
            className="absolute top-3 right-3 p-2 rounded-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-md text-slate-700 dark:text-slate-200 hover:text-rose-500 dark:hover:text-rose-400 hover:scale-110 active:scale-95 transition-all shadow-sm"
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          {/* Rent overlay on image bottom */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
            <div>
              <p className="text-xl font-black tracking-tight text-white drop-shadow-md">
                ₹{listing.rent.toLocaleString('en-IN')}
                <span className="text-xs font-medium text-rose-200"> /mo</span>
              </p>
              {listing.deposit > 0 && (
                <p className="text-[11px] text-slate-200 drop-shadow">Deposit: ₹{listing.deposit.toLocaleString('en-IN')}</p>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-amber-300 text-xs font-bold border border-amber-400/20 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{listing.avg_rating || 4.8}</span>
            </div>
          </div>
        </div>

        {/* Content details */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* Location and Distance */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center font-medium truncate">
              <MapPin className="w-3.5 h-3.5 text-rose-600 mr-1 shrink-0" />
              {listing.area}, {listing.city}
            </span>
            {listing.distance_km !== undefined && listing.distance_km !== null && (
              <span className="text-rose-600 dark:text-rose-400 font-bold shrink-0">
                {listing.distance_km} km away
              </span>
            )}
          </div>

          {/* Title */}
          <Link to={`/listings/${listing.id}`}>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
              {listing.title}
            </h3>
          </Link>

          {/* Features / Furnishing */}
          <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
            <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold capitalize text-slate-700 dark:text-slate-200">
              {listing.furnishing}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="truncate font-medium">Avail: {listing.available_from}</span>
          </div>

          {/* Amenities tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {listing.amenities?.slice(0, 3).map((amenity, i) => {
              const info = getAmenityInfo(amenity);
              const IconComp = info.icon || Check;
              return (
                <span
                  key={i}
                  className="inline-flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/50 dark:border-rose-900/40"
                  title={info.description}
                >
                  <IconComp className="w-3 h-3 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span className="truncate max-w-[90px]">{info.label || amenity}</span>
                </span>
              );
            })}
            {listing.amenities?.length > 3 && (
              <span className="text-[10px] text-slate-400 font-semibold py-0.5 self-center">
                +{listing.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5 truncate">
          <img
            src={getDisplayAvatar(listing.owner_avatar, listing.owner_name)}
            alt={listing.owner_name}
            className="w-6 h-6 rounded-full border border-rose-200 dark:border-rose-800 object-cover"
            onError={(e) => {
              e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(listing.owner_name || 'owner')}`;
            }}
          />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[90px]">
            {listing.owner_name}
          </span>
          {listing.owner_verified && (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" title="Verified Host" />
          )}
        </div>

        <div className="flex items-center space-x-2">
          {onVisitClick && (
            <button
              onClick={() => onVisitClick(listing)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
            >
              Visit
            </button>
          )}
          <Link
            to={`/listings/${listing.id}`}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-md shadow-rose-500/20 active:scale-95 transition-all"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
