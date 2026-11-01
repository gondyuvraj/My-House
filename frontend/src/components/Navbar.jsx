import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Home, Compass, Users, Heart, MessageSquare, PlusCircle, 
  Sun, Moon, Globe, LogOut, User, ShieldCheck, Menu, X, 
  LayoutDashboard, Bell, Search, MapPin, Check, PhoneCall,
  Sparkles, ExternalLink, CheckCheck, HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useChat } from '../context/ChatContext';
import BrandLogo from './BrandLogo';
import { METRO_CITIES } from '../utils/geoData';
import { getDisplayAvatar } from '../utils/avatarPresets';
import { SUPPORTED_LANGUAGES } from '../i18n';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const POPULAR_CITIES = METRO_CITIES;

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadTotal } = useChat();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');

  // Active City state (persisted in localStorage)
  const [activeCity, setActiveCity] = useState(() => {
    return localStorage.getItem('myhouse_active_city') || 'Pune';
  });

  // Quick Header Search State
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const searchInputRef = useRef(null);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // Wishlist Count
  const [wishlistCount, setWishlistCount] = useState(0);

  // Close menus on outside click / escape
  const headerRef = useRef(null);

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  const handleSelectLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('myhouse_lang', langCode);
    setLangDropdownOpen(false);
    setLangSearch('');
    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
    toast.success(`Language set to ${langObj?.native || langCode} (${langObj?.label})`, { icon: '🌐' });
  };

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(l => 
    l.label.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.native.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.region.toLowerCase().includes(langSearch.toLowerCase())
  );

  const isActive = (path) => location.pathname === path;

  // Handle City Change
  const handleSelectCity = (cityId) => {
    setActiveCity(cityId);
    localStorage.setItem('myhouse_active_city', cityId);
    setCityDropdownOpen(false);
    toast.success(`Switched city to ${cityId}`, { icon: '📍' });
    navigate(`/explore?city=${encodeURIComponent(cityId)}`);
  };

  // Fetch Notifications & Wishlist for logged-in user
  const fetchUserData = async () => {
    if (!isAuthenticated) return;
    try {
      const [notifRes, favRes] = await Promise.all([
        apiClient.get('/notifications'),
        apiClient.get('/favorites')
      ]);
      setNotifications(notifRes.data || []);
      const unread = (notifRes.data || []).filter(n => !n.read).length;
      setUnreadNotifCount(unread);
      setWishlistCount(favRes.data?.length || 0);
    } catch (e) {
      console.error("Error fetching header notifications/wishlist:", e);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [isAuthenticated, location.pathname]);

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      await apiClient.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadNotifCount(0);
      toast.success("All notifications marked as read");
    } catch (e) {
      toast.error("Failed to update notifications");
    }
  };

  // Click on a notification
  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.read) {
        await apiClient.put(`/notifications/${notif.id}/read`);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
        setUnreadNotifCount(prev => Math.max(0, prev - 1));
      }
    } catch (e) {}

    setNotificationsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  // Header quick search query with debounce
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const delay = setTimeout(async () => {
        try {
          const res = await apiClient.get(`/listings/autocomplete?query=${encodeURIComponent(searchQuery)}`);
          setSuggestions(res.data || []);
        } catch (e) {
          setSuggestions([]);
        }
      }, 250);
      return () => clearTimeout(delay);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Close popovers when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
        setCityDropdownOpen(false);
        setNotificationsOpen(false);
        setHelpOpen(false);
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header 
      ref={headerRef}
      className="sticky top-0 z-40 w-full bg-gradient-to-r from-pink-600 via-fuchsia-600 to-indigo-700 dark:from-pink-950 dark:via-purple-950 dark:to-slate-950 text-white shadow-lg shadow-pink-500/10 border-b border-pink-400/30 dark:border-pink-500/20 backdrop-blur-xl transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Left: Brand Logo & Interactive City Selector */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* Shiny Brand Logo */}
            <BrandLogo size="md" to="/" />

            {/* City Selector */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => {
                  setCityDropdownOpen(!cityDropdownOpen);
                  setNotificationsOpen(false);
                  setUserDropdownOpen(false);
                  setHelpOpen(false);
                  setLangDropdownOpen(false);
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/25 backdrop-blur-md transition-all shadow-sm"
                title="Select City"
              >
                <MapPin className="w-3.5 h-3.5 text-pink-200" />
                <span>{activeCity}</span>
                <span className="text-[10px] text-pink-200">▾</span>
              </button>

              {cityDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-pink-200/50 dark:border-slate-800 shadow-2xl py-2 z-50 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Select Metropolitan City</span>
                    <span className="text-[10px] text-pink-600 dark:text-pink-400 font-extrabold">{POPULAR_CITIES.length} Indian Hubs</span>
                  </div>
                  <div className="py-1 max-h-72 overflow-y-auto">
                    {POPULAR_CITIES.map(c => (
                      <button
                        key={c.id}
                        onClick={() => handleSelectCity(c.id)}
                        className={`w-full px-4 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                          activeCity === c.id 
                            ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 font-bold' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div>
                          <p className="font-extrabold">{c.label}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[170px]">{c.desc}</p>
                        </div>
                        {activeCity === c.id && <Check className="w-4 h-4 text-pink-600 shrink-0 ml-2" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link
              to="/explore"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                isActive('/explore')
                  ? 'bg-white/25 text-white shadow-sm border border-white/25 backdrop-blur-md'
                  : 'text-pink-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-pink-200" />
              <span>{t('nav.explore')}</span>
            </Link>

            <Link
              to="/roommates"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                isActive('/roommates')
                  ? 'bg-white/25 text-white shadow-sm border border-white/25 backdrop-blur-md'
                  : 'text-pink-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-pink-200" />
              <span>{t('nav.roommates')}</span>
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/wishlist"
                  className={`relative px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    isActive('/wishlist')
                      ? 'bg-white/25 text-white shadow-sm border border-white/25 backdrop-blur-md'
                      : 'text-pink-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 text-pink-200" />
                  <span>{t('nav.wishlist')}</span>
                  {wishlistCount > 0 && (
                    <span className="px-1.5 py-0.2 text-[9px] font-black bg-pink-500 text-white rounded-full ml-0.5">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/chat"
                  className={`relative px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    isActive('/chat')
                      ? 'bg-white/25 text-white shadow-sm border border-white/25 backdrop-blur-md'
                      : 'text-pink-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-pink-200" />
                  <span>{t('nav.messages')}</span>
                  {unreadTotal > 0 && (
                    <span className="px-1.5 py-0.2 text-[9px] font-black bg-amber-400 text-slate-900 rounded-full ml-0.5 animate-pulse">
                      {unreadTotal}
                    </span>
                  )}
                </Link>

                <Link
                  to={user?.role === 'owner' ? '/dashboard/lister' : '/dashboard/seeker'}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    location.pathname.startsWith('/dashboard')
                      ? 'bg-white/25 text-white shadow-sm border border-white/25 backdrop-blur-md'
                      : 'text-pink-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-pink-200" />
                  <span>{t('nav.dashboard')}</span>
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  isActive('/admin')
                    ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                    : 'text-amber-200 hover:bg-white/15'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('nav.admin')}</span>
              </Link>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            
            {/* Quick Search Omni-Bar Trigger */}
            <div className="relative">
              <button
                onClick={() => {
                  setSearchOpen(!searchOpen);
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }}
                className={`p-2 rounded-xl transition-all flex items-center space-x-1.5 ${
                  searchOpen ? 'bg-white text-pink-700 shadow-md' : 'text-pink-100 hover:text-white hover:bg-white/15'
                }`}
                title="Quick Search (Areas & Properties)"
              >
                <Search className="w-4 h-4" />
                <span className="hidden xl:inline text-xs font-semibold">Search...</span>
              </button>

              {/* Quick Search Popover */}
              {searchOpen && (
                <div className="absolute right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-pink-200/50 dark:border-slate-800 shadow-2xl p-3 z-50 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Type area (e.g. Baner, Koramangala)..."
                      className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    {searchQuery && (
                      <button 
                        type="button" 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </form>

                  {/* Autocomplete Suggestions */}
                  {suggestions.length > 0 ? (
                    <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto">
                      {suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (s.type === 'city') handleSelectCity(s.value);
                            else navigate(`/explore?q=${encodeURIComponent(s.value)}`);
                            setSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full px-3 py-2 text-left text-xs font-medium hover:bg-pink-50 dark:hover:bg-slate-800 flex items-center justify-between"
                        >
                          <span className="flex items-center text-slate-700 dark:text-slate-200">
                            <MapPin className="w-3.5 h-3.5 text-pink-600 mr-2 shrink-0" />
                            {s.label}
                          </span>
                          <span className="text-[10px] font-bold uppercase text-slate-400">{s.type}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-[11px] font-bold text-slate-400 uppercase">Popular Quick Searches:</p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {['Baner Pune', 'Koramangala BLR', 'Bandra Mumbai', 'Hauz Khas Delhi'].map(term => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => {
                              navigate(`/explore?q=${encodeURIComponent(term.split(' ')[0])}`);
                              setSearchOpen(false);
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-pink-100 dark:hover:bg-pink-950/60 text-slate-600 dark:text-slate-300 text-[10px] font-semibold"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Working Notification Center */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    setCityDropdownOpen(false);
                    setUserDropdownOpen(false);
                    setHelpOpen(false);
                    setLangDropdownOpen(false);
                  }}
                  className={`relative p-2 rounded-xl transition-all ${
                    notificationsOpen ? 'bg-white text-pink-700 shadow-md' : 'text-pink-100 hover:text-white hover:bg-white/15'
                  }`}
                  title="Notifications & Visit Updates"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-300 rounded-full ring-2 ring-pink-600 animate-ping" />
                  )}
                  {unreadNotifCount > 0 && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px] font-black bg-amber-300 text-slate-900 rounded-full shadow-sm">
                      {unreadNotifCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-pink-200/50 dark:border-slate-800 shadow-2xl py-3 z-50 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <Bell className="w-4 h-4 text-pink-600" />
                        <span className="text-xs font-extrabold">Notifications</span>
                        {unreadNotifCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300">
                            {unreadNotifCount} new
                          </span>
                        )}
                      </div>
                      {unreadNotifCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-bold text-pink-600 dark:text-pink-400 hover:underline flex items-center space-x-1"
                        >
                          <CheckCheck className="w-3 h-3" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400">
                          <p>No notifications yet.</p>
                          <p className="text-[11px] mt-1 text-slate-500">Visit requests and chats will show up here.</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-3.5 cursor-pointer text-left transition-colors flex items-start space-x-3 ${
                              !notif.read ? 'bg-pink-50/60 dark:bg-pink-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0 mt-1.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {notif.title}
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                                {notif.message}
                              </p>
                              <span className="text-[10px] text-slate-400 block mt-1">
                                {new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 24/7 Helpline & Support Popover */}
            <div className="relative">
              <button
                onClick={() => {
                  setHelpOpen(!helpOpen);
                  setCityDropdownOpen(false);
                  setNotificationsOpen(false);
                  setUserDropdownOpen(false);
                  setLangDropdownOpen(false);
                }}
                className={`p-2 rounded-xl transition-all ${
                  helpOpen ? 'bg-white text-pink-700 shadow-md' : 'text-pink-100 hover:text-white hover:bg-white/15'
                }`}
                title="24/7 Resident Support & Helpline"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {helpOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-pink-200/50 dark:border-slate-800 shadow-2xl p-4 z-50 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center space-x-2 text-pink-600 mb-2">
                    <PhoneCall className="w-4 h-4" />
                    <span className="text-xs font-extrabold">24/7 Resident Helpline</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Need help with room inspection, owner coordination, or emergency support?
                  </p>
                  <div className="mt-3 p-2.5 rounded-xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-900 text-xs">
                    <p className="font-extrabold text-pink-700 dark:text-pink-300">📞 +91 (020) 4123 9900</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">✉️ support@myhouse.in</p>
                  </div>
                  <div className="mt-2.5 text-[10px] text-slate-400 flex items-center">
                    <Sparkles className="w-3 h-3 text-amber-500 mr-1 shrink-0" />
                    <span>Direct Host Contact • Zero Brokerage</span>
                  </div>
                </div>
              )}
            </div>

            {/* Indian Languages Selector (14 Languages) */}
            <div className="relative">
              <button
                onClick={() => {
                  setLangDropdownOpen(!langDropdownOpen);
                  setCityDropdownOpen(false);
                  setNotificationsOpen(false);
                  setUserDropdownOpen(false);
                  setHelpOpen(false);
                }}
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl transition-all flex items-center space-x-1.5 text-xs font-extrabold ${
                  langDropdownOpen ? 'bg-white text-pink-700 shadow-md' : 'text-pink-100 hover:text-white hover:bg-white/15'
                }`}
                title="Select Indian Language / भाषा निवडा (14 Indian Languages)"
              >
                <Globe className="w-4 h-4 text-pink-200" />
                <span className="font-extrabold">{currentLang.native}</span>
                <span className="text-[10px] opacity-75">▾</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-pink-200/50 dark:border-slate-800 shadow-2xl p-3 z-50 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Globe className="w-4 h-4 text-pink-600" />
                      <span className="text-xs font-black">Indian Languages ({SUPPORTED_LANGUAGES.length})</span>
                    </div>
                    <span className="text-[10px] font-bold text-pink-600 bg-pink-50 dark:bg-pink-950 px-2 py-0.5 rounded-full">
                      All India
                    </span>
                  </div>

                  {/* Language Search Filter */}
                  <div className="py-2">
                    <input
                      type="text"
                      value={langSearch}
                      onChange={(e) => setLangSearch(e.target.value)}
                      placeholder="Search language / भाषा शोधा..."
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  {/* Languages List */}
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1">
                    {filteredLanguages.map(l => (
                      <button
                        key={l.code}
                        onClick={() => handleSelectLanguage(l.code)}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors rounded-xl ${
                          i18n.language === l.code
                            ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 font-black'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-extrabold">{l.native}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-1.5">({l.label})</span>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">{l.region}</p>
                        </div>
                        {i18n.language === l.code && <Check className="w-4 h-4 text-pink-600 shrink-0 ml-2" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Day / Night Mode Toggle */}
            <button
              onClick={toggleTheme}
              type="button"
              className="p-2 rounded-xl text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200 flex items-center space-x-1.5 cursor-pointer shadow-sm active:scale-95"
              title={theme === 'dark' ? "Switch to Day Mode (Light Theme)" : "Switch to Night Mode (Dark Theme)"}
              aria-label="Toggle Day/Night Mode"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-300" />
                  <span className="hidden xl:inline text-[11px] font-bold text-amber-200">Day</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-pink-100" />
                  <span className="hidden xl:inline text-[11px] font-bold text-pink-100">Night</span>
                </>
              )}
            </button>

            {/* Post Listing CTA (High Contrast) */}
            <Link
              to="/post-listing"
              className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-white text-pink-700 hover:bg-pink-50 shadow-md transition-all hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5 text-pink-600" />
              <span>{t('nav.post_listing')}</span>
            </Link>

            {/* Authentication Buttons or Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setCityDropdownOpen(false);
                    setNotificationsOpen(false);
                    setHelpOpen(false);
                    setLangDropdownOpen(false);
                  }}
                  className="flex items-center space-x-2 p-1 rounded-full ring-2 ring-white/40 hover:ring-white transition-all focus:outline-none"
                >
                  <img
                    src={getDisplayAvatar(user?.avatar_url, user?.email)}
                    alt="avatar"
                    className="w-8 h-8 rounded-full border border-white/60 object-cover bg-white/20"
                    onError={(e) => {
                      e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.email || 'user')}`;
                    }}
                  />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-pink-200/50 dark:border-slate-800 shadow-2xl py-2 z-50 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-semibold text-slate-400">Signed in as</p>
                      <p className="text-sm font-black text-slate-800 dark:text-white truncate">{user?.full_name}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300">
                        {user?.role}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-slate-800"
                    >
                      <User className="w-4 h-4 text-pink-600" />
                      <span>{t('nav.my_profile')}</span>
                    </Link>

                    <Link
                      to={user?.role === 'owner' ? '/dashboard/lister' : '/dashboard/seeker'}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-slate-800"
                    >
                      <LayoutDashboard className="w-4 h-4 text-pink-600" />
                      <span>{t('nav.dashboard')}</span>
                    </Link>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('nav.logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white hover:bg-white/15 transition-all"
                >
                  {t('nav.sign_in')}
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-white text-pink-700 hover:bg-pink-50 shadow-md transition-all hover:scale-105"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-white hover:bg-white/15"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-3 pb-6 space-y-2 bg-gradient-to-b from-pink-700 via-fuchsia-700 to-indigo-800 border-t border-pink-400/30 text-white shadow-2xl animate-in slide-in-from-top-3 duration-200">
          
          {/* Mobile City Selector */}
          <div className="p-2.5 rounded-2xl bg-white/15 border border-white/20 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-200 block mb-1.5">Selected City:</span>
            <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {POPULAR_CITIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    handleSelectCity(c.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold truncate ${
                    activeCity === c.id ? 'bg-white text-pink-700 shadow-sm' : 'bg-white/10 text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Language Selector (14 Languages) */}
          <div className="p-2.5 rounded-2xl bg-white/15 border border-white/20 mb-3">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-200 block mb-1.5">Choose Language:</span>
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {SUPPORTED_LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => {
                    handleSelectLanguage(l.code);
                    setMobileMenuOpen(false);
                  }}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold text-left truncate flex items-center justify-between ${
                    i18n.language === l.code ? 'bg-white text-pink-700 shadow-sm' : 'bg-white/10 text-white'
                  }`}
                >
                  <span>{l.native}</span>
                  <span className="text-[9px] opacity-75">({l.code})</span>
                </button>
              ))}
            </div>
          </div>

          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 px-3 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-white/15"
          >
            <Compass className="w-4 h-4 text-pink-200" />
            <span>{t('nav.explore')}</span>
          </Link>

          <Link
            to="/roommates"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 px-3 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-white/15"
          >
            <Users className="w-4 h-4 text-pink-200" />
            <span>{t('nav.roommates')}</span>
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-white/15"
              >
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-pink-200" />
                  <span>{t('nav.wishlist')}</span>
                </div>
                {wishlistCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-pink-500 text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                to="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-white/15"
              >
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-pink-200" />
                  <span>{t('nav.messages')}</span>
                </div>
                {unreadTotal > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-300 text-slate-900">
                    {unreadTotal}
                  </span>
                )}
              </Link>

              <Link
                to={user?.role === 'owner' ? '/dashboard/lister' : '/dashboard/seeker'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-white/15"
              >
                <LayoutDashboard className="w-4 h-4 text-pink-200" />
                <span>{t('nav.dashboard')}</span>
              </Link>

              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-white/15"
              >
                <User className="w-4 h-4 text-pink-200" />
                <span>{t('nav.my_profile')}</span>
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2.5 rounded-xl text-sm font-black text-amber-300 bg-amber-500/20"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t('nav.admin')}</span>
            </Link>
          )}

          {/* Mobile Day/Night Mode Switcher */}
          <div className="pt-2 border-t border-white/20 flex items-center justify-between px-3 py-2">
            <span className="text-xs font-bold text-white flex items-center space-x-2">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-amber-300" /> : <Sun className="w-4 h-4 text-amber-300" />}
              <span>Mode: {theme === 'dark' ? 'Night (Dark)' : 'Day (Light)'}</span>
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/20 hover:bg-white/30 text-white transition-all flex items-center space-x-1.5 active:scale-95"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-pink-200" />}
              <span>{theme === 'dark' ? 'Switch to Day' : 'Switch to Night'}</span>
            </button>
          </div>

          <Link
            to="/post-listing"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center space-x-2 w-full py-3 rounded-2xl text-sm font-black bg-white text-pink-700 shadow-lg mt-2"
          >
            <PlusCircle className="w-4 h-4 text-pink-600" />
            <span>{t('nav.post_listing')}</span>
          </Link>
        </div>
      )}
    </header>
  );
}
