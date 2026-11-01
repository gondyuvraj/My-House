import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, Home, AlertTriangle, CheckCircle2, 
  XCircle, BarChart3, PieChart as PieIcon, Ban, Unlock 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, PieChart, Pie, Cell, Legend 
} from 'recharts';
import apiClient from '../api/client';
import { getDisplayAvatar } from '../utils/avatarPresets';
import toast from 'react-hot-toast';

const COLORS = ['#E11D48', '#6366F1', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899'];

export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, listings, reports
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [listingsList, setListingsList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, listRes, reportsRes] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/users'),
        apiClient.get('/admin/listings'),
        apiClient.get('/admin/reports')
      ]);
      setStats(statsRes.data);
      setUsersList(usersRes.data);
      setListingsList(listRes.data);
      setReportsList(reportsRes.data);
    } catch (err) {
      console.error("Failed to load admin moderation data:", err);
      toast.error("Failed to fetch admin metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleBlock = async (userId, currentBlocked) => {
    try {
      await apiClient.put(`/admin/users/${userId}/status?block=${!currentBlocked}`);
      toast.success(`User ${!currentBlocked ? 'blocked' : 'unblocked'}`);
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, is_blocked: !currentBlocked } : u));
    } catch (err) {
      toast.error("Action failed.");
    }
  };

  const handleModerateListing = async (listingId, newStatus) => {
    try {
      await apiClient.put(`/admin/listings/${listingId}/moderate?status=${newStatus}`);
      toast.success(`Listing marked as ${newStatus}`);
      setListingsList(prev => prev.map(l => l.id === listingId ? { ...l, status: newStatus } : l));
    } catch (err) {
      toast.error("Failed to moderate listing.");
    }
  };

  const handleUpdateReport = async (reportId, newStatus) => {
    try {
      await apiClient.put(`/admin/reports/${reportId}/status`, { status: newStatus });
      toast.success(`Report ${newStatus}`);
      setReportsList(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
    } catch (err) {
      toast.error("Failed to update report.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 text-white shadow-soft">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Admin Moderation Console</h1>
            <p className="text-xs text-slate-400">Community safety, listing verification, user integrity, and system metrics</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-1.5 bg-slate-800 p-1.5 rounded-2xl text-xs font-bold">
          {['overview', 'users', 'listings', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl capitalize transition-all cursor-pointer ${
                activeTab === tab ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Key Stat Tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
              <p className="text-xs font-bold text-slate-400 uppercase">Registered Users</p>
              <p className="text-3xl font-black text-brand-700 dark:text-brand-400 mt-1">{stats.total_users}</p>
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
              <p className="text-xs font-bold text-slate-400 uppercase">Active Properties</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{stats.active_listings}</p>
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
              <p className="text-xs font-bold text-slate-400 uppercase">Roommate Posts</p>
              <p className="text-3xl font-black text-accent-500 mt-1">{stats.total_roommates}</p>
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
              <p className="text-xs font-bold text-slate-400 uppercase">Pending Reports</p>
              <p className="text-3xl font-black text-red-500 mt-1">{stats.pending_reports}</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* City Distribution Chart */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Listings Distribution by City</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.city_stats}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="city" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                    <Bar dataKey="listings" fill="#0F766E" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Accommodation Types Pie Chart */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Properties by Category Type</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.type_stats}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {stats.type_stats?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Platform Users ({usersList.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">City</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 flex items-center space-x-2.5">
                      <img
                        src={getDisplayAvatar(u.avatar_url, u.email)}
                        alt="avatar"
                        className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                        onError={(e) => {
                          e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.email || 'user')}`;
                        }}
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{u.full_name}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-3 capitalize">{u.role}</td>
                    <td className="py-3">{u.city || "Pune"}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.is_blocked ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {u.is_blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleBlock(u.id, u.is_blocked)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            u.is_blocked ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
                          }`}
                        >
                          {u.is_blocked ? 'Unblock' : 'Block User'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LISTINGS MODERATION TAB */}
      {activeTab === 'listings' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Properties Moderation Queue ({listingsList.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase">
                  <th className="pb-3">Property</th>
                  <th className="pb-3">Host</th>
                  <th className="pb-3">City / Area</th>
                  <th className="pb-3">Rent / Mo</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {listingsList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                      {item.title}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{item.owner_name}</td>
                    <td className="py-3">{item.area}, {item.city}</td>
                    <td className="py-3 font-bold">₹{item.rent?.toLocaleString('en-IN')}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-1.5">
                      {item.status !== 'active' && (
                        <button
                          onClick={() => handleModerateListing(item.id, 'active')}
                          className="px-2 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 text-white"
                        >
                          Approve
                        </button>
                      )}
                      {item.status !== 'rejected' && (
                        <button
                          onClick={() => handleModerateListing(item.id, 'rejected')}
                          className="px-2 py-1 rounded-lg text-[11px] font-bold bg-red-600 text-white"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Community Incident Reports ({reportsList.length})</h2>
          {reportsList.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No reports filed currently.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase">
                    <th className="pb-3">Reporter</th>
                    <th className="pb-3">Target</th>
                    <th className="pb-3">Reason</th>
                    <th className="pb-3">Details</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {reportsList.map((rep) => (
                    <tr key={rep.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 font-bold">{rep.reporter_name}</td>
                      <td className="py-3 text-slate-700 dark:text-slate-300">
                        <span className="capitalize font-bold text-brand-700">{rep.reported_type}</span>: {rep.reported_title || rep.reported_id}
                      </td>
                      <td className="py-3 font-semibold text-red-600">{rep.reason}</td>
                      <td className="py-3 text-slate-500 max-w-xs truncate">{rep.details || "None"}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          rep.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                          rep.status === 'dismissed' ? 'bg-slate-100 text-slate-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {rep.status}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-1.5">
                        {rep.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateReport(rep.id, 'resolved')}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 text-white"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => handleUpdateReport(rep.id, 'dismissed')}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-600 text-white"
                            >
                              Dismiss
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

