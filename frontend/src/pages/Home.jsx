import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search, MapPin, Home as HomeIcon, Users, ShieldCheck, Star,
  ArrowRight, Sparkles, CheckCircle2, ChevronDown, ChevronUp, Clock, Compass, Check
} from 'lucide-react';
import apiClient from '../api/client';
import ListingCard from '../components/ListingCard';
import ScheduleVisitModal from '../components/ScheduleVisitModal';
import { METRO_CITIES } from '../utils/geoData';

const POPULAR_CITIES = [
  { name: "Pune", img: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&auto=format&fit=crop&q=80", count: "12+ Areas", areas: "Baner, Hinjawadi, Kothrud" },
  { name: "Mumbai", img: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&auto=format&fit=crop&q=80", count: "15+ Areas", areas: "Bandra, Powai, Andheri, Juhu" },
  { name: "Bengaluru", img: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&auto=format&fit=crop&q=80", count: "16+ Areas", areas: "Koramangala, Indiranagar, HSR, Whitefield" },
  { name: "Delhi", img: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&auto=format&fit=crop&q=80", count: "14+ Areas", areas: "Hauz Khas, Saket, Dwarka, Noida" },
  { name: "Hyderabad", img: "https://images.unsplash.com/photo-1605007493699-ce65834f8a00?w=600&auto=format&fit=crop&q=80", count: "11+ Areas", areas: "HITEC City, Gachibowli, Madhapur" },
  { name: "Chennai", img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&auto=format&fit=crop&q=80", count: "9+ Areas", areas: "Adyar, OMR, Velachery, Anna Nagar" },
  { name: "Kolkata", img: "https://images.unsplash.com/photo-1558431382-27e303142255?w=600&auto=format&fit=crop&q=80", count: "10+ Areas", areas: "Salt Lake Sector V, New Town, Park Street" },
  { name: "Jaipur", img: "https://images.unsplash.com/photo-1603262110263-fb010d6e59d4?w=600&auto=format&fit=crop&q=80", count: "8+ Areas", areas: "Malviya Nagar, Mansarovar, Vaishali Nagar" },
  { name: "Kochi", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&auto=format&fit=crop&q=80", count: "7+ Areas", areas: "Kakkanad Infopark, Marine Drive, Edappally" },
  { name: "Ahmedabad", img: "https://images.unsplash.com/photo-1599818816942-0f074d0e6b81?w=600&auto=format&fit=crop&q=80", count: "8+ Areas", areas: "SG Highway, Prahlad Nagar, Bodakdev" },
  { name: "Chandigarh", img: "https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?w=600&auto=format&fit=crop&q=80", count: "6+ Areas", areas: "Sector 17, Sector 35, Mohali Phase 7" }
];

const FAQS = [
  {
    q: "How does roommate compatibility matching work?",
    a: "Our smart algorithm scores compatibility from 0 to 100% using your lifestyle questionnaire responses (sleep routine, smoking/drinking, veg/non-veg habits, cleanliness level 1-5, and budget bracket overlap) to help you find respectful and like-minded flatmates."
  },
  {
    q: "Are all listings and hosts verified on My House?",
    a: "Yes! Every listing undergoes verification of photos, address coordinates, and host contact details. Verified hosts display an authentic Shield badge on their listings and profiles."
  },
  {
    q: "Can I schedule a visit before paying any deposit?",
    a: "Absolutely! You can choose an available date and time slot right on the listing page to schedule a physical or virtual visit. The owner will accept the slot and connect with you directly."
  },
  {
    q: "Is there any brokerage fee to find a roommate or PG?",
    a: "Zero! My House connects seekers directly with room owners, PG managers, and existing tenants looking for roommates without hidden intermediary commissions."
  }
];

const HERO_CITIES = METRO_CITIES.map(c => ({
  id: c.id,
  label: c.label,
  areas: c.desc
}));

const HERO_TYPES = [
  { id: "all", label: "All Accommodations", desc: "PGs, Rooms, Studios & Flats" },
  { id: "PG", label: "Paying Guest (PG)", desc: "Furnished with meals & cleaning" },
  { id: "Room", label: "Private Room", desc: "Single occupancy rented room" },
  { id: "1RK", label: "1 RK Studio", desc: "Independent studio with kitchen" },
  { id: "1BHK", label: "1 BHK Flat", desc: "1-Bedroom private apartment" },
  { id: "2BHK", label: "2 BHK Apartment", desc: "Spacious flat for friends/family" },
  { id: "3BHK", label: "3 BHK Apartment", desc: "Spacious 3-bedroom family home" },
  { id: "4BHK", label: "4 BHK / Luxury Flat", desc: "Premium 4-bedroom flat or villa" },
  { id: "Shared room", label: "Shared Room / Flatmate", desc: "Split rent with a verified roommate" },
];

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [featuredListings, setFeaturedListings] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [selectedVisitListing, setSelectedVisitListing] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);

  // Search Bar State
  const [searchCity, setSearchCity] = useState(() => localStorage.getItem('myhouse_active_city') || 'Pune');
  const [searchType, setSearchType] = useState('all');
  const [maxRent, setMaxRent] = useState(25000);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const searchCardRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchCardRef.current && !searchCardRef.current.contains(event.target)) {
        setCityDropdownOpen(false);
        setTypeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await apiClient.get('/listings/featured');
        setFeaturedListings(res.data);
      } catch (err) {
        console.error("Failed to load featured listings:", err);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/explore?city=${encodeURIComponent(searchCity)}&type=${encodeURIComponent(searchType)}&max_rent=${maxRent}`);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-14 sm:pt-16 sm:pb-24 bg-gradient-to-b from-rose-50/50 via-white to-slate-50 dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-950">
        
        {/* Ambient background blur elements */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-400/10 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-10 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">

            {/* Top Pill */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 shadow-sm border border-rose-200/60 dark:border-rose-900/40">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('hero.badge')}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              {t('hero.title_1')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 dark:from-rose-400 dark:via-pink-400 dark:to-indigo-400">
                {t('hero.title_highlight')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              {t('hero.subtitle')}
            </p>

            {/* Integrated Search Card */}
            <form
              ref={searchCardRef}
              onSubmit={handleSearchSubmit}
              className="mt-8 p-3 sm:p-4 rounded-3xl bg-white dark:bg-slate-900 shadow-soft-lg border border-rose-100/80 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 text-left relative z-30"
            >
              {/* City selector (Custom High-Contrast Dropdown) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setCityDropdownOpen(prev => !prev);
                    setTypeDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:border-rose-400 dark:hover:border-rose-500/60 transition-colors flex flex-col justify-between cursor-pointer"
                >
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer">
                    {t('hero.search_city')}
                  </label>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                        {HERO_CITIES.find(c => c.id === searchCity)?.label || searchCity}
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${cityDropdownOpen ? 'rotate-180 text-rose-600' : ''}`} />
                  </div>
                </button>

                {/* City Dropdown Menu */}
                {cityDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Select City</span>
                      <span className="text-[10px] font-bold text-rose-600">{HERO_CITIES.length} Indian Hubs</span>
                    </div>
                    <div className="py-1 space-y-1 max-h-60 overflow-y-auto">
                      {HERO_CITIES.map(c => {
                        const isSelected = searchCity === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setSearchCity(c.id);
                              localStorage.setItem('myhouse_active_city', c.id);
                              setCityDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 font-bold border border-rose-200/80 dark:border-rose-900/60'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="font-extrabold text-xs">{c.label}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{c.areas}</p>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-rose-600 shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Property Type (Custom High-Contrast Dropdown) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setTypeDropdownOpen(prev => !prev);
                    setCityDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:border-rose-400 dark:hover:border-rose-500/60 transition-colors flex flex-col justify-between cursor-pointer"
                >
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer">
                    {t('hero.search_type')}
                  </label>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <HomeIcon className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                        {HERO_TYPES.find(t => t.id === searchType)?.label || searchType}
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${typeDropdownOpen ? 'rotate-180 text-rose-600' : ''}`} />
                  </div>
                </button>

                {/* Property Type Dropdown Menu */}
                {typeDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Accommodation Type</span>
                      <span className="text-[10px] font-bold text-rose-600">{HERO_TYPES.length} Types</span>
                    </div>
                    <div className="py-1 space-y-1 max-h-60 overflow-y-auto">
                      {HERO_TYPES.map(t => {
                        const isSelected = searchType === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              setSearchType(t.id);
                              setTypeDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 font-bold border border-rose-200/80 dark:border-rose-900/60'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="font-extrabold text-xs">{t.label}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{t.desc}</p>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-rose-600 shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Max Budget */}
              <div className="px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('hero.search_budget')}</label>
                  <span className="text-xs font-black text-rose-600 dark:text-rose-400">₹{maxRent.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="85000"
                  step="1000"
                  value={maxRent}
                  onChange={(e) => setMaxRent(Number(e.target.value))}
                  className="w-full accent-rose-600 mt-2 cursor-pointer h-1.5"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full h-full min-h-[50px] flex items-center justify-center space-x-2 px-6 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:via-pink-500 hover:to-indigo-500 text-white shadow-md shadow-rose-500/25 transition-transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>{t('hero.search_btn')}</span>
              </button>
            </form>

            {/* Quick Suggestions */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Trending Areas:</span>
              {["Baner Pune", "Koramangala BLR", "Bandra Mumbai", "Hauz Khas Delhi", "Salt Lake Kolkata", "Malviya Nagar Jaipur", "Infopark Kochi"].map((area, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(`/explore?q=${encodeURIComponent(area.split(' ')[0])}`)}
                  className="px-3 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 text-slate-700 dark:text-slate-200 transition-colors font-medium"
                >
                  {area}
                </button>
              ))}
            </div>

          </div>

          {/* Stats Counters */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
            <div className="p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/70 dark:border-slate-800 shadow-soft text-center hover:border-rose-300/60 transition-colors">
              <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">60+</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{t('hero.stat_listings')}</p>
            </div>
            <div className="p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/70 dark:border-slate-800 shadow-soft text-center hover:border-amber-300/60 transition-colors">
              <p className="text-2xl sm:text-3xl font-black text-amber-500">96%</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{t('hero.stat_roommates')}</p>
            </div>
            <div className="p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/70 dark:border-slate-800 shadow-soft text-center hover:border-indigo-300/60 transition-colors">
              <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">13</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{t('hero.stat_cities')}</p>
            </div>
            <div className="p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/70 dark:border-slate-800 shadow-soft text-center hover:border-amber-300/60 transition-colors">
              <p className="text-2xl sm:text-3xl font-black text-amber-500 flex items-center justify-center">
                4.9 <Star className="w-5 h-5 fill-amber-400 ml-1 inline text-amber-400" />
              </p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{t('hero.stat_rating')}</p>
            </div>
          </div>

        </div>
      </section>

      {/* 2. HOW IT WORKS 3-STEP SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">How My House Works</h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Move In Hassle-Free in 3 Steps</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft hover:shadow-xl hover:shadow-rose-500/10 hover:border-rose-300/60 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-300 font-black text-lg border border-rose-200/50">
              01
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Discover & Filter</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Explore verified PGs, single rooms, or full flats with exact map coordinates, verified amenities, high-res photos, and transparent deposit policies.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-300/60 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-black text-lg border border-indigo-200/50">
              02
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Match Lifestyle & Habits</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Fill a quick questionnaire (habits, sleep routine, cleanliness scale) to find compatible roommates with real-time 0–100% compatibility scores.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-300/60 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-lg border border-amber-200/50">
              03
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Chat & Schedule Visit</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Message the host directly in real-time, pick an inspection time slot that fits your schedule, and close your agreement without third-party fees.
            </p>
          </div>
        </div>
      </section>

      {/* 3. FEATURED LISTINGS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">Featured Accommodations</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Top-Rated Homes Ready for Move-In</h3>
          </div>
          <Link
            to="/explore"
            className="flex items-center space-x-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 group"
          >
            <span>View All (60+)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loadingFeatured ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-72 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredListings.slice(0, 8).map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onVisitClick={(l) => setSelectedVisitListing(l)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. POPULAR CITIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">Explore by City</h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Prime Hubs Across India</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {POPULAR_CITIES.map((city, idx) => (
            <Link
              key={idx}
              to={`/explore?city=${city.name}`}
              className="group relative rounded-3xl overflow-hidden aspect-[4/5] shadow-soft hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300"
            >
              <img
                src={city.img}
                alt={city.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <p className="text-base font-extrabold leading-tight">{city.name}</p>
                <p className="text-[10px] text-rose-200 font-medium truncate mt-0.5">{city.areas}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. ROOMMATE CALLOUT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#3f0716] via-[#2d0f36] to-[#0f1738] border border-rose-500/20 text-white p-8 sm:p-12 shadow-soft-lg flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-rose-500/25 border border-rose-400/30 uppercase tracking-wider text-rose-200">
              Smart Roommate Matching
            </span>
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Looking for a roommate who shares your lifestyle?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Find someone who matches your cleanliness standards, food preferences, sleep routines, and budget bracket with our proprietary compatibility engine.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <Link
              to="/roommates"
              className="px-6 py-3.5 rounded-2xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 shadow-md text-center transition-all cursor-pointer"
            >
              Browse Compatible Flatmates
            </Link>
            <Link
              to="/profile"
              className="px-6 py-3.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-md shadow-rose-500/30 text-center transition-all cursor-pointer"
            >
              Take Lifestyle Questionnaire
            </Link>
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">Frequently Asked Questions</h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Got Questions? We Have Answers.</h3>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-soft hover:border-rose-200 dark:hover:border-slate-700 transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between focus:outline-none cursor-pointer"
                >
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-rose-600 shrink-0 ml-2" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Schedule Visit Modal */}
      <ScheduleVisitModal
        listing={selectedVisitListing}
        isOpen={!!selectedVisitListing}
        onClose={() => setSelectedVisitListing(null)}
      />

    </div>
  );
}
