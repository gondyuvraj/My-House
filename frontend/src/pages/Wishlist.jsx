import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Home, ArrowRight } from 'lucide-react';
import apiClient from '../api/client';
import ListingCard from '../components/ListingCard';

export default function Wishlist() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await apiClient.get('/favorites');
        setFavorites(res.data);
      } catch (err) {
        console.error("Failed to load wishlist:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/60 dark:text-red-400 flex items-center justify-center">
          <Heart className="w-6 h-6 fill-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Saved Accommodations
          </h1>
          <p className="text-xs text-slate-500">
            {favorites.length} properties saved for comparison and quick booking
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-72 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
          <Heart className="w-14 h-14 text-slate-300 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Your wishlist is empty</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the heart button on any PG, flat, or room card while exploring to save properties here.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-md shadow-rose-500/25 transition-transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Explore Properties</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favorites.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

    </div>
  );
}

