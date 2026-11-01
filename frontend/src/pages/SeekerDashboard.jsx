import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Calendar, MessageSquare, Compass, Users, 
  CheckCircle2, Clock, XCircle, ArrowRight, Trash2, Ban 
} from 'lucide-react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';
import toast from 'react-hot-toast';

export default function SeekerDashboard() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [visits, setVisits] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleCancelVisit = async (visitId) => {
    if (!window.confirm("Are you sure you want to cancel this visit request?")) return;
    try {
      await apiClient.put(`/visits/${visitId}/status`, { status: "cancelled" });
      toast.success("Visit request cancelled.");
      setVisits(prev => prev.map(v => v.id === visitId ? { ...v, status: 'cancelled' } : v));
    } catch (err) {
      toast.error("Failed to cancel visit request.");
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [favRes, visitRes, recRes] = await Promise.all([
          apiClient.get('/favorites'),
          apiClient.get('/visits/my?role=seeker'),
          apiClient.get('/roommates/recommended')
        ]);
        setFavorites(favRes.data);
        setVisits(visitRes.data);
        setRecommendations(recRes.data);
      } catch (err) {
        console.error("Failed to load seeker dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#3f0716] via-[#2d0f36] to-[#0f1738] border border-rose-500/20 text-white shadow-soft-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-200">Seeker Hub</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Track your scheduled visits, saved properties, and compatible flatmate suggestions.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/explore"
            className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 shadow transition-all cursor-pointer"
          >
            Explore Homes
          </Link>
          <Link
            to="/profile"
            className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-md shadow-rose-500/25 transition-all cursor-pointer"
          >
            My Profile
          </Link>
        </div>
      </div>

      {/* Visit Requests Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-rose-600" />
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              My Scheduled Visits ({visits.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500">Owners confirm your slot</span>
        </div>

        {visits.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            <p>You haven't requested any property visits yet.</p>
            <Link to="/explore" className="text-rose-600 dark:text-rose-400 font-bold hover:underline mt-1 inline-block">
              Browse listings to schedule a visit
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase">
                  <th className="pb-3">Property</th>
                  <th className="pb-3">Host</th>
                  <th className="pb-3">Scheduled Slot</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {visits.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3">
                      <Link to={`/listings/${v.listing_id}`} className="font-bold text-slate-900 dark:text-white hover:text-brand-700">
                        {v.listing_title}
                      </Link>
                      <p className="text-[11px] text-slate-400">{v.listing_area}, {v.listing_city}</p>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{v.owner_name}</td>
                    <td className="py-3">
                      <span className="font-bold text-slate-800 dark:text-white">{v.visit_date}</span>
                      <p className="text-[11px] text-slate-400">{v.visit_time_slot}</p>
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        v.status === 'accepted' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        v.status === 'declined' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' :
                        v.status === 'cancelled' ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {['pending', 'accepted'].includes(v.status) ? (
                        <button
                          onClick={() => handleCancelVisit(v.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                          title="Cancel Visit"
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Saved Wishlist Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Saved Accommodations ({favorites.length})
            </h2>
          </div>
          <Link to="/explore" className="text-xs font-bold text-brand-700 hover:underline">
            Search More
          </Link>
        </div>

        {favorites.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            <p>Your wishlist is currently empty. Tap the heart icon on any listing to save it.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.slice(0, 4).map((fav) => (
              <ListingCard key={fav.id} listing={fav} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

