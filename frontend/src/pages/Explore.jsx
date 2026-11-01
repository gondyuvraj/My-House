import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Search, Filter, MapPin, Grid, List, Map as MapIcon, 
  RotateCcw, SlidersHorizontal, ShieldCheck, Navigation, ChevronLeft, ChevronRight 
} from 'lucide-react';
import apiClient from '../api/client';
import ListingCard from '../components/ListingCard';
import MapView from '../components/MapView';
import ScheduleVisitModal from '../components/ScheduleVisitModal';
import { AMENITIES_DATA, AMENITY_CATEGORIES, getAmenityInfo } from '../utils/amenities';
import { METRO_CITIES } from '../utils/geoData';
import toast from 'react-hot-toast';

export default function Explore() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search parameters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [city, setCity] = useState(searchParams.get('city') || 'Pune');
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [gender, setGender] = useState(searchParams.get('gender') || 'any');
  const [furnishing, setFurnishing] = useState('all');
  const [minRent, setMinRent] = useState(searchParams.get('min_rent') ? Number(searchParams.get('min_rent')) : 3000);
  const [maxRent, setMaxRent] = useState(searchParams.get('max_rent') ? Number(searchParams.get('max_rent')) : 35000);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [userLocation, setUserLocation] = useState(null);

  // Autocomplete
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Layout View mode: 'grid' | 'list' | 'map'
  const [viewMode, setViewMode] = useState('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Data states
  const [listings, setListings] = useState([]);
  const [totalListings, setTotalListings] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal
  const [visitListing, setVisitListing] = useState(null);

  // Fetch listings
  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (city && city !== 'all') params.append('city', city);
      if (type && type !== 'all') params.append('type', type);
      if (gender && gender !== 'any') params.append('gender', gender);
      if (furnishing && furnishing !== 'all') params.append('furnishing', furnishing);
      if (minRent) params.append('min_rent', minRent);
      if (maxRent) params.append('max_rent', maxRent);
      if (selectedAmenities.length > 0) params.append('amenities', selectedAmenities.join(','));
      if (verifiedOnly) params.append('verified_only', 'true');
      if (sortBy) params.append('sort_by', sortBy);
      if (userLocation) {
        params.append('lat', userLocation.lat);
        params.append('lng', userLocation.lng);
      }
      params.append('page', page);
      params.append('limit', 12);

      const res = await apiClient.get(`/listings?${params.toString()}`);
      setListings(res.data.items);
      setTotalListings(res.data.total);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error("Failed to load listings:", err);
      toast.error("Error fetching properties.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [city, type, gender, furnishing, minRent, maxRent, selectedAmenities, verifiedOnly, sortBy, page, userLocation]);

  // Sync with URL query parameters when header city or search changes
  useEffect(() => {
    const urlCity = searchParams.get('city');
    if (urlCity && urlCity !== city) {
      setCity(urlCity);
      setPage(1);
    }
    const urlQ = searchParams.get('q');
    if (urlQ !== null && urlQ !== searchQuery) {
      setSearchQuery(urlQ);
      setPage(1);
    }
  }, [searchParams]);

  // Handle autocomplete query
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const timeout = setTimeout(async () => {
        try {
          const res = await apiClient.get(`/listings/autocomplete?query=${encodeURIComponent(searchQuery)}`);
          setAutocompleteSuggestions(res.data);
          setShowSuggestions(true);
        } catch (e) {}
      }, 250);
      return () => clearTimeout(timeout);
    } else {
      setAutocompleteSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const toggleAmenity = (name) => {
    setSelectedAmenities(prev => 
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCity('all');
    setType('all');
    setGender('any');
    setFurnishing('all');
    setMinRent(3000);
    setMaxRent(40000);
    setSelectedAmenities([]);
    setVerifiedOnly(false);
    setSortBy('newest');
    setUserLocation(null);
    setPage(1);
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    toast.loading("Detecting your location...", { id: "geo" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.success("Location detected! Showing nearest listings.", { id: "geo" });
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortBy('nearest');
      },
      (err) => {
        toast.error("Unable to retrieve location: " + err.message, { id: "geo" });
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Discover Accommodations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Showing <strong className="text-slate-800 dark:text-slate-200">{totalListings}</strong> verified properties across Indian tech hubs
          </p>
        </div>

        {/* Search input with autocomplete */}
        <div className="relative w-full md:w-96">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setShowSuggestions(false);
                  fetchListings();
                }
              }}
              placeholder="Search by area, landmark, or title..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {showSuggestions && autocompleteSuggestions.length > 0 && (
            <div className="absolute top-12 left-0 right-0 z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden py-1">
              {autocompleteSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (s.type === 'city') setCity(s.value);
                    setSearchQuery(s.value);
                    setShowSuggestions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-slate-800 flex items-center justify-between"
                >
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-rose-600 mr-2" />
                    {s.label}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">{s.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Layout: Sidebar Filters + Listings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Filter Sidebar (Desktop) */}
        <aside className="hidden lg:block space-y-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center">
              <SlidersHorizontal className="w-4 h-4 mr-2 text-rose-600" />
              {t('common.filter_by')}
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              {t('common.reset_filters')}
            </button>
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">City</label>
            <select
              value={city}
              onChange={(e) => { setCity(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-rose-500 cursor-pointer shadow-xs"
            >
              <option value="all" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">All Indian Cities ({METRO_CITIES.length})</option>
              {METRO_CITIES.map(c => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                  {c.label} ({c.state})
                </option>
              ))}
            </select>
          </div>

          {/* Accommodation Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Property Type</label>
            <div className="grid grid-cols-2 gap-1.5">
              {["all", "PG", "Room", "1RK", "1BHK", "2BHK", "3BHK", "4BHK", "Shared room"].map((tOption) => (
                <button
                  key={tOption}
                  onClick={() => { setType(tOption); setPage(1); }}
                  className={`px-2 py-1.5 rounded-xl text-xs font-bold transition-all text-center ${
                    type === tOption
                      ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {tOption === 'all' ? 'All Types' : tOption}
                </button>
              ))}
            </div>
          </div>

          {/* Rent Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Max Rent</label>
              <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                ₹{maxRent.toLocaleString('en-IN')}/mo
              </span>
            </div>
            <input
              type="range"
              min="3000"
              max="85000"
              step="1000"
              value={maxRent}
              onChange={(e) => { setMaxRent(Number(e.target.value)); setPage(1); }}
              className="w-full accent-rose-600 cursor-pointer h-1.5"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>₹3k</span>
              <span>₹40k</span>
              <span>₹85k+</span>
            </div>
          </div>

          {/* Gender Preference */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Gender Preference</label>
            <div className="grid grid-cols-3 gap-1.5">
              {["any", "male", "female"].map((g) => (
                <button
                  key={g}
                  onClick={() => { setGender(g); setPage(1); }}
                  className={`py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    gender === g
                      ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Furnishing */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Furnishing</label>
            <select
              value={furnishing}
              onChange={(e) => { setFurnishing(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold capitalize cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Any Furnishing</option>
              <option value="fully-furnished" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Fully Furnished</option>
              <option value="semi-furnished" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Semi Furnished</option>
              <option value="unfurnished" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Unfurnished</option>
            </select>
          </div>

          {/* Verified Only Checkbox */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => { setVerifiedOnly(e.target.checked); setPage(1); }}
                className="w-4 h-4 text-rose-600 rounded accent-rose-600 cursor-pointer"
              />
              <span className="flex items-center">
                <ShieldCheck className="w-4 h-4 text-emerald-500 mr-1" />
                Verified Hosts Only
              </span>
            </label>
          </div>

          {/* Amenities Checklist */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Amenities {selectedAmenities.length > 0 && `(${selectedAmenities.length})`}
              </label>
              {selectedAmenities.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedAmenities([])}
                  className="text-[10px] font-bold text-rose-600 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
              {AMENITIES_DATA.map((am) => {
                const selected = selectedAmenities.includes(am.name);
                const IconComp = am.icon;
                return (
                  <button
                    key={am.id}
                    onClick={() => { toggleAmenity(am.name); setPage(1); }}
                    title={am.description}
                    className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-colors ${
                      selected
                        ? 'border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <IconComp className={`w-3 h-3 ${selected ? 'text-rose-600' : 'text-slate-400'}`} />
                    <span>{am.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Main Results Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Controls Bar: Sort, View Toggle, Near Me */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleNearMe}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 hover:bg-rose-100 transition-colors"
                title="Sort by nearest to current geolocation"
              >
                <Navigation className="w-3.5 h-3.5 text-rose-600" />
                <span>{t('common.near_me')}</span>
              </button>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              {/* Sort By Dropdown */}
              <div className="flex items-center space-x-1.5 text-xs">
                <span className="text-slate-400 font-semibold">{t('common.sort_by')}:</span>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  className="bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer text-xs"
                >
                  <option value="newest" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Newest First</option>
                  <option value="price_asc" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Rent: Low to High</option>
                  <option value="price_desc" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Rent: High to Low</option>
                  <option value="rating" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Top Rated</option>
                  {userLocation && <option value="nearest" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Nearest to Me</option>}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 space-x-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-sm' : 'text-slate-400'}`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-sm' : 'text-slate-400'}`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'map' ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-sm' : 'text-slate-400'}`}
                  title="Map View"
                >
                  <MapIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Results List / Grid / Map */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-soft">
              <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t('common.no_results')}</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try widening your budget range, removing amenity filters, or selecting "All Cities".
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-soft"
              >
                {t('common.reset_filters')}
              </button>
            </div>
          ) : viewMode === 'map' ? (
            <div className="h-[650px] w-full">
              <MapView listings={listings} centerCity={city !== 'all' ? city : 'Pune'} />
            </div>
          ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {listings.map(listing => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onVisitClick={(l) => setVisitListing(l)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && viewMode !== 'map' && (
            <div className="pt-6 flex items-center justify-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pNum => (
                <button
                  key={pNum}
                  onClick={() => setPage(pNum)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold ${
                    page === pNum
                      ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-soft'
                      : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {pNum}
                </button>
              ))}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Schedule Visit Modal */}
      <ScheduleVisitModal
        listing={visitListing}
        isOpen={!!visitListing}
        onClose={() => setVisitListing(null)}
      />

    </div>
  );
}

