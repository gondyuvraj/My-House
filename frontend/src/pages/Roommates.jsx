import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users, PlusCircle, Filter, Sparkles, MapPin,
  RotateCcw, SlidersHorizontal, CheckCircle2, X,
  Home, DollarSign, Calendar, Image as ImageIcon, Trash2, Plus,
  ShieldCheck, ArrowRight, ArrowLeft, Check, Clock, Phone, MessageSquare
} from 'lucide-react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import RoommateCard from '../components/RoommateCard';
import { getAmenityInfo } from '../utils/amenities';
import { METRO_CITIES } from '../utils/geoData';
import toast from 'react-hot-toast';

export default function Roommates() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();

  const [posts, setPosts] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [postType, setPostType] = useState('all');
  const [city, setCity] = useState(user?.city || 'Pune');
  const [gender, setGender] = useState('any');
  const [maxRent, setMaxRent] = useState(25000);
  const [sortBy, setSortBy] = useState('score');

  // Create Post Modal Multi-Step State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1); // 1: Space & Rent, 2: Lifestyle & Habits, 3: Amenities & Photos
  const [newPostType, setNewPostType] = useState('need_roommate');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCity, setNewCity] = useState(user?.city || 'Pune');
  const [newAreas, setNewAreas] = useState('Baner, Hinjawadi');
  const [newBhk, setNewBhk] = useState('2BHK');
  const [newRoomType, setNewRoomType] = useState('Private Single Room');
  const [newFurnishing, setNewFurnishing] = useState('semi-furnished');
  const [newRent, setNewRent] = useState(12000);
  const [newDeposit, setNewDeposit] = useState(24000);
  const [newMaintenanceIncluded, setNewMaintenanceIncluded] = useState(true);
  const [newUtilitySplitEqual, setNewUtilitySplitEqual] = useState(true);
  const [newAvailableFrom, setNewAvailableFrom] = useState('Immediate');
  const [newMinStay, setNewMinStay] = useState('3 Months');
  const [newNoticePeriod, setNewNoticePeriod] = useState('30 Days');
  const [newGender, setNewGender] = useState('any');
  const [newDiet, setNewDiet] = useState('any');
  const [newSmoking, setNewSmoking] = useState('no_smoking');
  const [newDrinking, setNewDrinking] = useState('any');
  const [newWorkSchedule, setNewWorkSchedule] = useState('hybrid');
  const [newContactMode, setNewContactMode] = useState('chat');
  const [newAmenities, setNewAmenities] = useState(["WiFi", "AC", "Housekeeping", "RO Water", "Power Backup", "Attached Bathroom"]);
  const [newImages, setNewImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);

  const fetchRoommates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (postType !== 'all') params.append('post_type', postType);
      if (city !== 'all') params.append('city', city);
      if (gender !== 'any') params.append('gender', gender);
      if (maxRent) params.append('max_rent', maxRent);
      if (sortBy) params.append('sort_by', sortBy);

      const res = await apiClient.get(`/roommates?${params.toString()}`);
      setPosts(res.data.items);

      // Also fetch recommended
      const recRes = await apiClient.get('/roommates/recommended');
      setRecommended(recRes.data);
    } catch (err) {
      console.error("Failed to load roommate posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoommates();
  }, [postType, city, gender, maxRent, sortBy]);

  const handleAddImage = (e) => {
    e?.preventDefault();
    if (!newImageUrl.trim()) return;
    if (newImages.includes(newImageUrl.trim())) {
      toast.error("Image already added");
      return;
    }
    setNewImages(prev => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteRoommatePost = (deletedId) => {
    setPosts(prev => prev.filter(p => p.id !== deletedId));
    setRecommended(prev => prev.filter(p => p.id !== deletedId));
  };

  const handleCreatePost = async (e) => {
    e?.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please log in to post your requirement.");
      return;
    }
    if (!newTitle.trim()) {
      toast.error("Please provide a title for your post.");
      return;
    }
    setSubmittingPost(true);
    try {
      const areasList = newAreas
        ? newAreas.split(',').map(a => a.trim()).filter(Boolean)
        : [];

      await apiClient.post('/roommates', {
        post_type: newPostType,
        title: newTitle,
        description: newDesc || `Looking for compatible flatmates in ${newCity}.`,
        city: newCity,
        preferred_areas: areasList,
        approx_rent: Number(newRent),
        approx_deposit: Number(newDeposit),
        available_from: newAvailableFrom,
        gender_preference: newGender,
        furnishing: newFurnishing,
        amenities: newAmenities,
        images: newImages,
        property_bhk: newBhk,
        room_type: newRoomType,
        occupancy_type: newRoomType.toLowerCase().includes('shared') ? 'double' : 'single',
        preferred_occupation: 'any',
        diet_preference: newDiet,
        smoking_policy: newSmoking,
        drinking_policy: newDrinking,
        work_schedule: newWorkSchedule,
        maintenance_included: newMaintenanceIncluded,
        utility_split_equal: newUtilitySplitEqual,
        min_stay_months: newMinStay === 'No Lock-in' ? 0 : parseInt(newMinStay) || 3,
        notice_period_days: parseInt(newNoticePeriod) || 30,
        contact_mode: newContactMode,
        lifestyle: {
          smoking: newSmoking === 'smoking_ok',
          drinking: newDrinking !== 'no_drinking',
          food_preference: newDiet === 'any' ? 'any' : newDiet,
          sleep_schedule: 'flexible',
          cleanliness: 4,
          guests_allowed: true,
          pets_allowed: false,
          noise_level: 'moderate',
          work_from_home: newWorkSchedule === 'wfh'
        }
      });
      toast.success("Roommate requirement published successfully!");
      setCreateModalOpen(false);
      setModalStep(1);
      setNewTitle('');
      setNewDesc('');
      fetchRoommates();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create post.");
    } finally {
      setSubmittingPost(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#3f0716] via-[#2d0f36] to-[#0f1738] border border-rose-500/20 text-white shadow-soft-lg">
        <div className="space-y-2 max-w-xl">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-rose-500/25 border border-rose-400/30 uppercase tracking-wider text-rose-200">
            Smart Lifestyle Compatibility
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t('roommates.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {t('roommates.subtitle')}
          </p>
        </div>

        <button
          onClick={() => {
            if (!isAuthenticated) toast.error("Please login to post");
            else setCreateModalOpen(true);
          }}
          className="px-5 py-3 rounded-2xl text-xs font-bold bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-md shadow-rose-500/25 transition-transform hover:-translate-y-0.5 active:scale-95 flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('roommates.post_requirement')}</span>
        </button>
      </div>

      {/* Recommended Roommates (Top Compatibility Carousel / Grid) */}
      {recommended.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-rose-500" />
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Top Compatibility Matches for You
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommended.slice(0, 3).map((recPost) => (
              <RoommateCard key={`rec-${recPost.id}`} post={recPost} onDelete={handleDeleteRoommatePost} />
            ))}
          </div>
        </div>
      )}

      {/* Filter and Switcher Controls */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-wrap items-center justify-between gap-4">

        {/* Post Type Pills */}
        <div className="flex items-center space-x-2">
          {[
            { id: 'all', label: 'All Posts' },
            { id: 'need_roommate', label: 'Have Room (Needs Flatmate)' },
            { id: 'looking_for_room', label: 'Looking for Room / Flatmate' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPostType(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${postType === tab.id
                  ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* City and Sort Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center space-x-1.5 font-bold">
            <span className="text-slate-400">City:</span>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer text-xs"
            >
              <option value="all" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">All Indian Cities ({METRO_CITIES.length})</option>
              {METRO_CITIES.map(c => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                  {c.label} ({c.state})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 font-bold">
            <span className="text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer text-xs"
            >
              <option value="score" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Best Compatibility Match</option>
              <option value="newest" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Newest First</option>
              <option value="rent_asc" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Rent: Low to High</option>
              <option value="rent_desc" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Rent: High to Low</option>
            </select>
          </div>
        </div>

      </div>

      {/* Main Roommate Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-72 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No roommate posts found</h3>
          <p className="text-xs text-slate-500 mt-1">Try switching city or choosing "All Posts".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <RoommateCard key={post.id} post={post} onDelete={handleDeleteRoommatePost} />
          ))}
        </div>
      )}

      {/* Post Roommate Requirement Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto space-y-5">
            <button
              onClick={() => { setCreateModalOpen(false); setModalStep(1); }}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-50 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                  Step {modalStep} of 3
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-500">
                  {modalStep === 1 && "Space & Financials"}
                  {modalStep === 2 && "Lifestyle & Flatmate Habits"}
                  {modalStep === 3 && "Amenities, Photos & Contact"}
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                Post Roommate Requirement
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Connect with compatible flatmates matched by lifestyle, habits, and budget.
              </p>
            </div>

            {/* Step Navigation Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-xs font-bold">
              <button
                type="button"
                onClick={() => setModalStep(1)}
                className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${modalStep === 1
                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>1. Space & Rent</span>
              </button>
              <button
                type="button"
                onClick={() => setModalStep(2)}
                className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${modalStep === 2
                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>2. Lifestyle</span>
              </button>
              <button
                type="button"
                onClick={() => setModalStep(3)}
                className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${modalStep === 3
                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>3. Amenities</span>
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">

              {/* STEP 1: Space & Rent Details */}
              {modalStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Post Type Choice */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      What is your requirement?
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setNewPostType('need_roommate')}
                        className={`p-3 rounded-2xl border text-xs font-bold transition-all text-left flex items-start space-x-2.5 cursor-pointer ${newPostType === 'need_roommate'
                            ? 'border-rose-500 bg-rose-50/80 text-rose-900 dark:bg-rose-950/70 dark:text-rose-200 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                          }`}
                      >
                        <div className={`p-1.5 rounded-xl shrink-0 mt-0.5 ${newPostType === 'need_roommate' ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                          <Home className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-extrabold text-xs">I Have a Flat / Room</p>
                          <span className="text-[11px] font-normal opacity-80 block mt-0.5">Looking for flatmate to share room & rent</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setNewPostType('looking_for_room')}
                        className={`p-3 rounded-2xl border text-xs font-bold transition-all text-left flex items-start space-x-2.5 cursor-pointer ${newPostType === 'looking_for_room'
                            ? 'border-indigo-500 bg-indigo-50/80 text-indigo-900 dark:bg-indigo-950/70 dark:text-indigo-200 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                          }`}
                      >
                        <div className={`p-1.5 rounded-xl shrink-0 mt-0.5 ${newPostType === 'looking_for_room' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-extrabold text-xs">Looking for a Room</p>
                          <span className="text-[11px] font-normal opacity-80 block mt-0.5">Seeker looking for flatmates with a flat</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Catchy Post Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Catchy Post Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Spacious Master Bedroom with Attached Balcony in Baner (Looking for chilled flatmate)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* City & Preferred Areas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target City *</label>
                      <select
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                      >
                        {METRO_CITIES.map(c => (
                          <option key={c.id} value={c.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                            {c.label} ({c.state})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Preferred Neighborhoods / Areas</label>
                      <input
                        type="text"
                        value={newAreas}
                        onChange={(e) => setNewAreas(e.target.value)}
                        placeholder="e.g. Baner, Hinjawadi Phase 1, Wakad"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Configuration & Room Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Flat Type</label>
                      <select
                        value={newBhk}
                        onChange={(e) => setNewBhk(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <option value="1RK">1 RK Studio</option>
                        <option value="1BHK">1 BHK Flat</option>
                        <option value="2BHK">2 BHK Flat</option>
                        <option value="3BHK">3 BHK Flat</option>
                        <option value="4BHK">4 BHK Luxury Flat</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Room Setup</label>
                      <select
                        value={newRoomType}
                        onChange={(e) => setNewRoomType(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <option value="Private Single Room">Private Single Room</option>
                        <option value="Master Bedroom (Attached Bath)">Master Bed (Attached Bath)</option>
                        <option value="Shared (Twin Sharing)">Shared (Twin 2-Sharing)</option>
                        <option value="Living Room Space">Living Room Bed (Budget)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Furnishing</label>
                      <select
                        value={newFurnishing}
                        onChange={(e) => setNewFurnishing(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <option value="fully-furnished">Fully Furnished</option>
                        <option value="semi-furnished">Semi Furnished</option>
                        <option value="unfurnished">Unfurnished</option>
                      </select>
                    </div>
                  </div>

                  {/* Financials: Rent & Deposit */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Monthly Rent Share (₹/month) *
                      </label>
                      <input
                        type="number"
                        required
                        min="2000"
                        max="85000"
                        value={newRent}
                        onChange={(e) => setNewRent(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-black text-rose-600 dark:text-rose-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Security Deposit Share (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="200000"
                        value={newDeposit}
                        onChange={(e) => setNewDeposit(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                      />
                    </div>

                    {/* Financial Toggles */}
                    <div className="sm:col-span-2 pt-1 flex flex-col sm:flex-row gap-3 text-xs">
                      <label className="flex items-center space-x-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
                        <input
                          type="checkbox"
                          checked={newMaintenanceIncluded}
                          onChange={(e) => setNewMaintenanceIncluded(e.target.checked)}
                          className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                        />
                        <span>Society maintenance included in rent</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
                        <input
                          type="checkbox"
                          checked={newUtilitySplitEqual}
                          onChange={(e) => setNewUtilitySplitEqual(e.target.checked)}
                          className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                        />
                        <span>Utility bills (WiFi/Maid/Cook/Power) split equally</span>
                      </label>
                    </div>
                  </div>

                  {/* Move-in Date Availability */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Available From / Move-in Timeline
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {["Immediate", "Within 15 Days", "1st of Next Month", "Flexible"].map((avail) => (
                        <button
                          key={avail}
                          type="button"
                          onClick={() => setNewAvailableFrom(avail)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-colors ${newAvailableFrom === avail
                              ? 'border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 shadow-xs'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                            }`}
                        >
                          {avail}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Lifestyle & Roommate Habits */}
              {modalStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Gender Preference */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Gender Preference
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["any", "male", "female"].map((g) => (
                        <button
                          type="button"
                          key={g}
                          onClick={() => setNewGender(g)}
                          className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all ${newGender === g
                              ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white border-transparent shadow-sm'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                            }`}
                        >
                          {g === 'any' ? 'Any Gender' : g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dietary Preference & Smoking */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Dietary Preference
                      </label>
                      <select
                        value={newDiet}
                        onChange={(e) => setNewDiet(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <option value="any">Any (Comfortable with all food)</option>
                        <option value="veg_only">Strictly Pure Vegetarian</option>
                        <option value="non_veg_ok">Non-Vegetarian Friendly</option>
                        <option value="jain">Jain Food Preferred</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Smoking Policy
                      </label>
                      <select
                        value={newSmoking}
                        onChange={(e) => setNewSmoking(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <option value="no_smoking">Strictly Non-Smoker</option>
                        <option value="balcony_only">Balcony / Outdoor Smoking OK</option>
                        <option value="smoking_ok">Smoking Allowed</option>
                      </select>
                    </div>
                  </div>

                  {/* Drinking & Work Routine */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Drinking Policy
                      </label>
                      <select
                        value={newDrinking}
                        onChange={(e) => setNewDrinking(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <option value="any">Social / Occasional Drinker OK</option>
                        <option value="no_drinking">Teetotaler (Non-Drinker)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Work Environment
                      </label>
                      <select
                        value={newWorkSchedule}
                        onChange={(e) => setNewWorkSchedule(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <option value="hybrid">Hybrid (WFH + Office)</option>
                        <option value="wfh">100% Work from Home</option>
                        <option value="office">Regular Office / Student Routine</option>
                      </select>
                    </div>
                  </div>

                  {/* Lease Terms: Notice & Lock-in */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Minimum Stay (Lock-in)
                      </label>
                      <select
                        value={newMinStay}
                        onChange={(e) => setNewMinStay(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <option value="No Lock-in">No Lock-in Period</option>
                        <option value="3 Months">3 Months Minimum</option>
                        <option value="6 Months">6 Months Minimum</option>
                        <option value="1 Year">1 Year Minimum</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Notice Period
                      </label>
                      <select
                        value={newNoticePeriod}
                        onChange={(e) => setNewNoticePeriod(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <option value="30 Days">30 Days (1 Month)</option>
                        <option value="15 Days">15 Days</option>
                        <option value="Flexible">Flexible / Mutual Discussion</option>
                      </select>
                    </div>
                  </div>

                  {/* Description & Preferences */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      About You & Ideal Roommate *
                    </label>
                    <textarea
                      rows="3"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="e.g. I work as a Software Engineer at Hinjawadi. Clean, respectful of privacy, like weekend chill sessions. Looking for someone clean and friendly..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Amenities, Photos & Contact Mode */}
              {modalStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Key Amenities */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Room & Flat Amenities ({newAmenities.length} selected)
                      </label>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setNewAmenities(["WiFi", "AC", "Power Backup", "Geyser", "Attached Bathroom", "RO Water", "Laundry", "Housekeeping"])}
                          className="text-[11px] font-bold text-rose-600 hover:underline"
                        >
                          + Common Essentials
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewAmenities([])}
                          className="text-[11px] font-semibold text-slate-400 hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {[
                        "WiFi", "AC", "Power Backup", "Geyser", "Attached Bathroom",
                        "Balcony", "Meals", "RO Water", "Laundry", "Housekeeping",
                        "Work Desk", "Fridge", "Microwave", "Modular Kitchen", "Wardrobe",
                        "TV", "CCTV", "Security Guard", "Parking", "Gym", "Swimming Pool", "Clubhouse"
                      ].map((am) => {
                        const isChecked = newAmenities.includes(am);
                        return (
                          <button
                            type="button"
                            key={am}
                            onClick={() => setNewAmenities(prev => prev.includes(am) ? prev.filter(x => x !== am) : [...prev, am])}
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${isChecked
                                ? 'border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 shadow-xs'
                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                              }`}
                          >
                            {am}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Room / Flat Photos */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Room & Flat Photos (Optional URL attachments)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddImage}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 flex items-center space-x-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Photo</span>
                      </button>
                    </div>

                    {/* Image Preview Thumbnails */}
                    {newImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2.5">
                        {newImages.map((imgUrl, i) => (
                          <div key={i} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                            <img src={imgUrl} alt="Room" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(i)}
                              className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                            >
                              <Trash2 className="w-4 h-4 text-rose-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Preferred Contact Mode */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      How should interested roommates contact you?
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'chat', label: 'In-App Chat First', icon: MessageSquare },
                        { id: 'whatsapp', label: 'WhatsApp', icon: Phone },
                        { id: 'call', label: 'Phone Call', icon: Phone }
                      ].map((item) => {
                        const IconC = item.icon;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setNewContactMode(item.id)}
                            className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-colors ${newContactMode === item.id
                                ? 'border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'
                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                              }`}
                          >
                            <IconC className="w-4 h-4" />
                            <span className="text-[11px]">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Step Navigation Controls & Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                {modalStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setModalStep(prev => prev - 1)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setCreateModalOpen(false); setModalStep(1); }}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}

                {modalStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (modalStep === 1 && !newTitle.trim()) {
                        toast.error("Please provide a title first.");
                        return;
                      }
                      setModalStep(prev => prev + 1);
                    }}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-md shadow-rose-500/25 flex items-center space-x-1.5 transition-transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>{modalStep === 1 ? "Next: Lifestyle & Habits →" : "Next: Amenities & Photos →"}</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submittingPost}
                    className="px-7 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-lg shadow-rose-500/30 flex items-center space-x-2 transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <span>{submittingPost ? "Publishing Post..." : "Publish Requirement Live 🚀"}</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

