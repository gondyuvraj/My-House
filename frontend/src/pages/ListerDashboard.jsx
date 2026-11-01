import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, Eye, MessageSquare, Heart, CheckCircle2, 
  XCircle, Calendar, Trash2, Edit3, ArrowUpRight, BarChart3, X, MapPin 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, CartesianGrid, Legend 
} from 'recharts';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ListerDashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Listing State
  const [editingListing, setEditingListing] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    rent: '',
    deposit: '',
    maintenance: '',
    type: 'PG',
    furnishing: 'semi-furnished',
    gender_preference: 'any',
    status: 'active',
    available_from: 'Immediate',
    description: ''
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const openEditModal = (item) => {
    setEditingListing(item);
    setEditFormData({
      title: item.title || '',
      rent: item.rent || 0,
      deposit: item.deposit || 0,
      maintenance: item.maintenance || 0,
      type: item.type || 'PG',
      furnishing: item.furnishing || 'semi-furnished',
      gender_preference: item.gender_preference || 'any',
      status: item.status || 'active',
      available_from: item.available_from || 'Immediate',
      description: item.description || ''
    });
  };

  const handleUpdateListing = async (e) => {
    e.preventDefault();
    if (!editingListing) return;
    setSavingEdit(true);
    try {
      const payload = {
        title: editFormData.title,
        rent: Number(editFormData.rent),
        deposit: Number(editFormData.deposit),
        maintenance: Number(editFormData.maintenance),
        type: editFormData.type,
        furnishing: editFormData.furnishing,
        gender_preference: editFormData.gender_preference,
        status: editFormData.status,
        available_from: editFormData.available_from,
        description: editFormData.description
      };
      const res = await apiClient.put(`/listings/${editingListing.id}`, payload);
      toast.success("Listing updated successfully!");
      setListings(prev => prev.map(l => l.id === editingListing.id ? res.data : l));
      setEditingListing(null);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update listing.");
    } finally {
      setSavingEdit(false);
    }
  };

  const fetchListerData = async () => {
    try {
      const [listRes, visitRes] = await Promise.all([
        apiClient.get('/listings/my/listings'),
        apiClient.get('/visits/my?role=owner')
      ]);
      setListings(listRes.data);
      setVisits(visitRes.data);
    } catch (err) {
      console.error("Failed to load lister data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListerData();
  }, []);

  const handleUpdateVisitStatus = async (visitId, newStatus) => {
    try {
      await apiClient.put(`/visits/${visitId}/status`, { status: newStatus });
      toast.success(`Visit request ${newStatus}!`);
      fetchListerData();
    } catch (err) {
      toast.error("Failed to update visit status.");
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    try {
      await apiClient.delete(`/listings/${listingId}`);
      toast.success("Listing removed.");
      setListings(prev => prev.filter(l => l.id !== listingId));
    } catch (err) {
      toast.error("Failed to delete listing.");
    }
  };

  // Metrics calculation
  const totalViews = listings.reduce((acc, l) => acc + (l.views_count || 0), 0);
  const totalInquiries = listings.reduce((acc, l) => acc + (l.inquiries_count || 0), 0);
  const totalFavorites = listings.reduce((acc, l) => acc + (l.favorites_count || 0), 0);

  // Prepare chart data for each listing
  const chartData = listings.slice(0, 6).map(l => ({
    name: l.title.length > 15 ? l.title.substring(0, 15) + '...' : l.title,
    Views: l.views_count || 0,
    Inquiries: (l.inquiries_count || 0) * 10 // scaled for visibility
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#3f0716] via-[#2d0f36] to-[#0f1738] border border-rose-500/20 text-white shadow-soft-lg">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-200">Owner / Lister Portal</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
            Property Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Monitor real-time resident inquiries, schedule visit approvals, and manage live listings.
          </p>
        </div>

        <Link
          to="/post-listing"
          className="px-5 py-3 rounded-2xl text-xs font-bold bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-md shadow-rose-500/25 transition-transform hover:-translate-y-0.5 active:scale-95 flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Property</span>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <p className="text-xs font-bold text-slate-400 uppercase">My Listings</p>
          <p className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">{listings.length}</p>
        </div>
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Views</p>
          <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{totalViews}</p>
        </div>
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <p className="text-xs font-bold text-slate-400 uppercase">Direct Inquiries</p>
          <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{totalInquiries}</p>
        </div>
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <p className="text-xs font-bold text-slate-400 uppercase">Times Wishlisted</p>
          <p className="text-3xl font-black text-rose-500 mt-1">{totalFavorites}</p>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      {chartData.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-rose-600" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Listing Performance & Engagement
            </h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Views" fill="#E11D48" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Inquiries" fill="#6366F1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Incoming Visit Requests */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-brand-700" />
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Incoming Visit Requests ({visits.length})
            </h2>
          </div>
        </div>

        {visits.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No pending visit requests from seekers right now.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase">
                  <th className="pb-3">Seeker</th>
                  <th className="pb-3">Property</th>
                  <th className="pb-3">Requested Date & Slot</th>
                  <th className="pb-3">Message</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {visits.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-bold text-slate-900 dark:text-white">
                      {v.seeker_name}
                      <p className="text-[11px] text-slate-400 font-normal">{v.seeker_phone || "Phone verified"}</p>
                    </td>
                    <td className="py-3 text-slate-700 dark:text-slate-300">{v.listing_title}</td>
                    <td className="py-3">
                      <span className="font-bold">{v.visit_date}</span>
                      <p className="text-[11px] text-slate-400">{v.visit_time_slot}</p>
                    </td>
                    <td className="py-3 text-slate-500 max-w-xs truncate">{v.notes || "None"}</td>
                    <td className="py-3 text-right">
                      {v.status === 'pending' ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleUpdateVisitStatus(v.id, 'accepted')}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateVisitStatus(v.id, 'declined')}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm"
                          >
                            Decline
                          </button>
                        </div>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          v.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {v.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* My Listings Management Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
          Active Properties
        </h2>

        {listings.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400 space-y-2">
            <p>You have not published any properties yet.</p>
            <Link to="/post-listing" className="inline-block px-4 py-2 rounded-xl bg-brand-700 text-white font-bold">
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase">
                  <th className="pb-3">Property</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Rent / Mo</th>
                  <th className="pb-3">Engagement</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {listings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 flex items-center space-x-3">
                      <img
                        src={item.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200"}
                        alt={item.title}
                        className="w-12 h-10 object-cover rounded-xl shrink-0"
                      />
                      <div>
                        <Link to={`/listings/${item.id}`} className="font-bold text-slate-900 dark:text-white hover:text-brand-700">
                          {item.title}
                        </Link>
                        <p className="text-[11px] text-slate-400">{item.area}, {item.city}</p>
                      </div>
                    </td>
                    <td className="py-3 font-semibold">{item.type}</td>
                    <td className="py-3 font-bold text-slate-800 dark:text-white">₹{item.rent.toLocaleString('en-IN')}</td>
                    <td className="py-3 text-slate-500">
                      <span className="mr-2">👁️ {item.views_count || 0}</span>
                      <span>💬 {item.inquiries_count || 0}</span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-1 sm:space-x-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 inline-block transition-colors"
                        title="Edit Listing"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/listings/${item.id}`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 inline-block transition-colors"
                        title="View Live"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteListing(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 inline-block transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Listing Modal */}
      {editingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setEditingListing(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50">
                Update Listing Details
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                Edit Property: {editingListing.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Update rental prices, deposit, furnishing, property status, or description.
              </p>
            </div>

            <form onSubmit={handleUpdateListing} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Property Title</label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    min="500"
                    required
                    value={editFormData.rent}
                    onChange={(e) => setEditFormData({ ...editFormData, rent: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Security Deposit (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.deposit}
                    onChange={(e) => setEditFormData({ ...editFormData, deposit: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Maintenance (₹/mo)</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.maintenance}
                    onChange={(e) => setEditFormData({ ...editFormData, maintenance: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Accommodation Type</label>
                  <select
                    value={editFormData.type}
                    onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="PG">PG</option>
                    <option value="Room">Private Room</option>
                    <option value="1RK">1 RK</option>
                    <option value="1BHK">1 BHK</option>
                    <option value="2BHK">2 BHK</option>
                    <option value="3BHK">3 BHK</option>
                    <option value="4BHK">4 BHK</option>
                    <option value="Shared room">Shared Room</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Furnishing Status</label>
                  <select
                    value={editFormData.furnishing}
                    onChange={(e) => setEditFormData({ ...editFormData, furnishing: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="unfurnished">Unfurnished</option>
                    <option value="semi-furnished">Semi-Furnished</option>
                    <option value="fully-furnished">Fully Furnished</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Listing Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Gender Preference</label>
                  <select
                    value={editFormData.gender_preference}
                    onChange={(e) => setEditFormData({ ...editFormData, gender_preference: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="any">Any / All Welcome</option>
                    <option value="male">Male Only</option>
                    <option value="female">Female Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Available From</label>
                  <input
                    type="text"
                    value={editFormData.available_from}
                    onChange={(e) => setEditFormData({ ...editFormData, available_from: e.target.value })}
                    placeholder="e.g. Immediate or 2026-11-01"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Property Description</label>
                <textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Property Location & Google Maps Link */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-semibold truncate">
                    {editingListing.area}, {editingListing.city} 
                    {editingListing.lat && editingListing.lng && ` (${editingListing.lat.toFixed(4)}, ${editingListing.lng.toFixed(4)})`}
                  </span>
                </div>
                {editingListing.lat && editingListing.lng && (
                  <a
                    href={`https://www.google.com/maps?q=${editingListing.lat},${editingListing.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline flex items-center space-x-1 shrink-0"
                  >
                    <span>View Pin in Google Maps</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingListing(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold shadow-md shadow-rose-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

