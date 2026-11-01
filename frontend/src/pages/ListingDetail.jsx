import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Heart, Share2, AlertTriangle, MapPin, ShieldCheck, Star, 
  Calendar, Phone, MessageSquare, Check, Home, Sparkles, ArrowLeft, Send,
  Clock, Languages, FileCheck, Navigation, ExternalLink, Car, Bike, Footprints, Train, Layers 
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import ListingCard from '../components/ListingCard';
import ScheduleVisitModal from '../components/ScheduleVisitModal';
import ReportModal from '../components/ReportModal';
import { getAmenityInfo, AMENITY_CATEGORIES } from '../utils/amenities';
import { 
  MAP_LAYERS, getGoogleMapsDirectionsUrl, calculateDistanceKm, 
  estimateCommute, FAMOUS_LANDMARKS 
} from '../utils/geoData';
import { getDisplayAvatar } from '../utils/avatarPresets';
import toast from 'react-hot-toast';

// Custom Marker
const markerIcon = L.divIcon({
  className: 'custom-pin',
  html: `<div style="background: linear-gradient(135deg, #e11d48, #4f46e5); width:18px; height:18px; border-radius:50%; border:3px solid white; box-shadow:0 0 12px rgba(225,29,72,0.6);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { openChatWithUser } = useChat();

  const [listing, setListing] = useState(null);
  const [similarListings, setSimilarListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gallery active index & Lightbox
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Modals
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Review form
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Favorite state
  const [isFavorited, setIsFavorited] = useState(false);

  // Amenity category filter
  const [amenityFilter, setAmenityFilter] = useState('all');

  // Map & Commute Radar State
  const [mapLayerKey, setMapLayerKey] = useState('googleRoadmap');
  const [selectedHub, setSelectedHub] = useState(null);

  useEffect(() => {
    const fetchListingData = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/listings/${id}`);
        setListing(res.data);
        setIsFavorited(res.data.is_favorited);

        // Fetch similar listings
        const simRes = await apiClient.get(`/listings/${id}/similar`);
        setSimilarListings(simRes.data);

        // Fetch reviews
        const revRes = await apiClient.get(`/reviews/listing/${id}`);
        setReviews(revRes.data);
      } catch (err) {
        console.error("Failed to load listing:", err);
        toast.error("Property not found or invalid.");
      } finally {
        setLoading(false);
      }
    };
    fetchListingData();
    window.scrollTo(0, 0);
  }, [id]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to save to wishlist");
      return;
    }
    try {
      const res = await apiClient.post(`/favorites/${listing.id}`);
      setIsFavorited(res.data.favorited);
      toast.success(res.data.message);
    } catch (e) {
      toast.error("Failed to update wishlist");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Listing link copied to clipboard!");
  };

  const handleContactHost = () => {
    if (!isAuthenticated) {
      toast.error("Please login to chat with the host");
      navigate('/login');
      return;
    }
    openChatWithUser({
      id: listing.owner_id,
      full_name: listing.owner_name,
      avatar_url: listing.owner_avatar
    });
    navigate('/chat');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please log in to write a review.");
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await apiClient.post('/reviews', {
        target_id: listing.id,
        target_type: 'listing',
        rating: newRating,
        comment: newComment.trim()
      });
      setReviews(prev => [res.data, ...prev]);
      setNewComment('');
      toast.success("Thank you! Review published.");
    } catch (err) {
      toast.error("Failed to post review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-500">Loading property details...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <Home className="w-16 h-16 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Listing not found</h2>
        <Link to="/explore" className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-700 text-white">
          Back to Explore
        </Link>
      </div>
    );
  }

  const images = listing.images?.length > 0 ? listing.images : [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200"
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-brand-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleFavorite}
            className={`p-2 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors ${
              isFavorited ? 'text-red-500 bg-red-50 dark:bg-red-950/40' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
            title="Save to Wishlist"
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
            title="Share Property"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setReportModalOpen(true)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Report Listing"
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Listing Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-700 text-white">
            {listing.type}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
            {listing.furnishing}
          </span>
          {listing.gender_preference && listing.gender_preference !== 'any' && (
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent-50 text-accent-700 dark:bg-accent-950/60 dark:text-accent-300 capitalize">
              {listing.gender_preference} Only
            </span>
          )}
          {listing.owner_verified && (
            <span className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 ml-1">
              <ShieldCheck className="w-4 h-4 mr-1" />
              Verified Property
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {listing.title}
        </h1>

        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-2">
          <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
          <span>{listing.full_address}</span>
        </div>
      </div>

      {/* Image Gallery with Lightbox Trigger */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-3xl overflow-hidden">
        {/* Main large image */}
        <div
          className="md:col-span-3 aspect-[16/10] bg-slate-100 dark:bg-slate-800 cursor-pointer overflow-hidden relative group"
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={images[activeImageIdx]}
            alt="Property preview"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-black/60 text-white text-xs font-bold backdrop-blur-md">
            Click to View Full Photo ({activeImageIdx + 1}/{images.length})
          </span>
        </div>

        {/* Thumbnail column */}
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible">
          {images.slice(0, 4).map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImageIdx(idx)}
              className={`relative aspect-[16/10] w-24 md:w-full rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                activeImageIdx === idx ? 'border-rose-500 shadow-md scale-95 ring-2 ring-rose-500/20' : 'border-transparent opacity-75 hover:opacity-100'
              }`}
            >
              <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Details + Sticky Reservation/Contact Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2/3): Specs, Description, Amenities, Rules, Map, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Monthly Rent</p>
              <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
                ₹{listing.rent.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Deposit</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">
                ₹{listing.deposit.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Maintenance</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">
                {listing.maintenance > 0 ? `₹${listing.maintenance}` : 'Included'}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Availability</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white mt-0.5 truncate">
                {listing.available_from}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-3">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">About the Property</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2.5">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Amenities & Facilities</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/50">
                    {listing.amenities?.length || 0} Features Included
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified features and facilities provided at this property
                </p>
              </div>

              {/* Category Filter Tabs */}
              {listing.amenities?.length > 4 && (
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setAmenityFilter('all')}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-colors ${
                      amenityFilter === 'all'
                        ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    All ({listing.amenities.length})
                  </button>
                  {AMENITY_CATEGORIES.map(cat => {
                    const count = listing.amenities.filter(am => getAmenityInfo(am).category === cat.id).length;
                    if (count === 0) return null;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setAmenityFilter(cat.id)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-colors ${
                          amenityFilter === cat.id
                            ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {cat.name} ({count})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {listing.amenities
                ?.filter(am => amenityFilter === 'all' || getAmenityInfo(am).category === amenityFilter)
                .map((amenity, i) => {
                  const info = getAmenityInfo(amenity);
                  const IconComp = info.icon || Check;
                  return (
                    <div
                      key={i}
                      className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-900/50 transition-colors group"
                    >
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-slate-200/60 dark:border-slate-700 shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                          {info.label || amenity}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {info.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* House Rules */}
          {listing.house_rules?.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-3">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">House Rules</h3>
              <ul className="space-y-2">
                {listing.house_rules.map((rule, idx) => (
                  <li key={idx} className="flex items-center text-xs font-medium text-slate-600 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2.5 shrink-0" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Location & Vicinity with Google Maps & Commute Radar */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-rose-600" />
                  Location & Vicinity
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{listing.full_address}</p>
              </div>

              {listing.lat && listing.lng && (
                <div className="flex items-center space-x-2 shrink-0">
                  {/* Google Map / Satellite Layer Switcher */}
                  <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setMapLayerKey('googleRoadmap')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        mapLayerKey === 'googleRoadmap'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Map
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapLayerKey('googleHybrid')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        mapLayerKey === 'googleHybrid'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Satellite
                    </button>
                  </div>

                  {/* Open in Google Maps */}
                  <a
                    href={getGoogleMapsDirectionsUrl(listing.lat, listing.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-rose-500/20 active:scale-95 transition-all flex items-center space-x-1.5"
                  >
                    <span>Get Directions</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {listing.lat && listing.lng && (
              <div className="relative h-72 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
                <MapContainer center={[listing.lat, listing.lng]} zoom={15} scrollWheelZoom={false} className="w-full h-full">
                  <TileLayer
                    key={mapLayerKey}
                    url={MAP_LAYERS[mapLayerKey]?.url || MAP_LAYERS.googleRoadmap.url}
                    subdomains={MAP_LAYERS[mapLayerKey]?.subdomains}
                    attribution={MAP_LAYERS[mapLayerKey]?.attribution}
                  />
                  <Marker position={[listing.lat, listing.lng]} icon={markerIcon}>
                    <Popup className="custom-popup">
                      <div className="p-1 text-center font-bold text-xs">
                        <p className="text-slate-900 font-black">{listing.title}</p>
                        <p className="text-rose-600 font-extrabold mt-0.5">₹{listing.rent?.toLocaleString('en-IN')}/mo</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            )}

            {/* Commute Time Radar to Key Hubs in City */}
            {listing.lat && listing.lng && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center">
                    <Navigation className="w-4 h-4 mr-1.5 text-indigo-600 dark:text-indigo-400" />
                    Commute & Distance Radar
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Estimated one-way transit</span>
                </div>

                {/* Popular city hubs pills */}
                <div className="flex flex-wrap gap-1.5">
                  {FAMOUS_LANDMARKS.filter(lm => lm.city.toLowerCase() === (listing.city || 'pune').toLowerCase())
                    .slice(0, 5)
                    .map((hub, idx) => {
                      const d = calculateDistanceKm(listing.lat, listing.lng, hub.lat, hub.lng);
                      const isSel = selectedHub?.name === hub.name;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedHub({ ...hub, distKm: d })}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                            isSel
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>{hub.name}</span>
                          <span className={isSel ? 'text-rose-100' : 'text-rose-600 dark:text-rose-400'}>({d} km)</span>
                        </button>
                      );
                    })}
                </div>

                {/* Commute Estimates card if a hub is selected */}
                {selectedHub && (() => {
                  const commute = estimateCommute(selectedHub.distKm);
                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 animate-in fade-in">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/60">
                        <span className="text-[10px] text-slate-400 font-semibold block">Total Distance</span>
                        <p className="text-sm font-black text-rose-600 dark:text-rose-400 mt-0.5">{selectedHub.distKm} km</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/60">
                        <span className="text-[10px] text-slate-400 font-semibold block flex items-center">
                          <Car className="w-3 h-3 mr-1 text-slate-500" /> By Car / Cab
                        </span>
                        <p className="text-sm font-black text-slate-800 dark:text-white mt-0.5">~{commute.driveMin} mins</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/60">
                        <span className="text-[10px] text-slate-400 font-semibold block flex items-center">
                          <Bike className="w-3 h-3 mr-1 text-slate-500" /> Two-Wheeler
                        </span>
                        <p className="text-sm font-black text-slate-800 dark:text-white mt-0.5">~{commute.bikeMin} mins</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/60">
                        <span className="text-[10px] text-slate-400 font-semibold block flex items-center">
                          <Train className="w-3 h-3 mr-1 text-slate-500" /> Metro / Bus
                        </span>
                        <p className="text-sm font-black text-slate-800 dark:text-white mt-0.5">~{commute.metroMin} mins</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Nearby Highlights */}
            {listing.nearby_places?.length > 0 && (
              <div className="pt-1">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nearby Transit & Hubs</h4>
                <div className="flex flex-wrap gap-2">
                  {listing.nearby_places.map((place, i) => (
                    <span key={i} className="px-3 py-1 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      📍 {place}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reviews & Ratings Section */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center">
                Reviews ({reviews.length})
              </h3>
              <div className="flex items-center space-x-1.5 text-amber-500 font-extrabold text-sm">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{listing.avg_rating} / 5.0</span>
              </div>
            </div>

            {/* Submit new review form */}
            <form onSubmit={handleReviewSubmit} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-xs font-bold text-slate-800 dark:text-white">Leave a Resident Review</span>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setNewRating(star)}
                    className="focus:outline-none"
                  >
                    <Star className={`w-5 h-5 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
              <textarea
                rows="2"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your experience regarding maintenance, host cooperation, WiFi, hygiene..."
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <button
                type="submit"
                disabled={submittingReview}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-soft transition-all disabled:opacity-50"
              >
                {submittingReview ? "Submitting..." : "Post Review"}
              </button>
            </form>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No reviews yet for this listing. Be the first to review!</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img
                          src={rev.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rev.author_name}`}
                          alt={rev.author_name}
                          className="w-7 h-7 rounded-full"
                        />
                        <span className="text-xs font-bold text-slate-800 dark:text-white">{rev.author_name}</span>
                      </div>
                      <div className="flex items-center text-amber-400 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                        <span>{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Sticky Column (1/3): Host Details & Actions */}
        <div className="space-y-6">
          <div className="sticky top-24 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft-lg space-y-6">
            
            {/* Host Card */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Property Host</span>
                {listing.owner_host_type && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                    {listing.owner_host_type}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3 mt-2.5">
                <img
                  src={getDisplayAvatar(listing.owner_avatar, listing.owner_name)}
                  alt={listing.owner_name}
                  className="w-14 h-14 rounded-2xl border-2 border-rose-300/80 dark:border-rose-800 object-cover shadow-sm bg-white dark:bg-slate-800"
                  onError={(e) => {
                    e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(listing.owner_name || 'owner')}`;
                  }}
                />
                <div>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center">
                    {listing.owner_name}
                    {listing.owner_verified && (
                      <ShieldCheck className="w-4 h-4 text-emerald-500 ml-1.5" title="Verified Host" />
                    )}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Contact: {listing.owner_phone || "Verified On Platform"}</p>
                </div>
              </div>

              {/* Host Real-world Trust & Availability Details */}
              {(listing.owner_calling_hours || (listing.owner_languages && listing.owner_languages.length > 0) || listing.owner_provides_agreement) && (
                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                  {listing.owner_calling_hours && (
                    <div className="flex items-center text-[11px] text-slate-600 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-rose-500 mr-2 shrink-0" />
                      <span>Calling Hours: <strong className="font-semibold text-slate-800 dark:text-slate-200">{listing.owner_calling_hours}</strong></span>
                    </div>
                  )}
                  {listing.owner_languages && listing.owner_languages.length > 0 && (
                    <div className="flex items-center text-[11px] text-slate-600 dark:text-slate-300">
                      <Languages className="w-3.5 h-3.5 text-indigo-500 mr-2 shrink-0" />
                      <span>Languages: <strong className="font-semibold text-slate-800 dark:text-slate-200">{listing.owner_languages.join(", ")}</strong></span>
                    </div>
                  )}
                  {listing.owner_provides_agreement && (
                    <div className="flex items-center text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <FileCheck className="w-3.5 h-3.5 mr-2 shrink-0" />
                      <span>Assistance for Registered Rental Agreement</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Rent Total Breakdown */}
            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 space-y-2">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Monthly Rent</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{listing.rent.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Security Deposit</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{listing.deposit.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Brokerage</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">₹0 (Free)</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5">
              <button
                onClick={() => setVisitModalOpen(true)}
                className="w-full py-3.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-md shadow-rose-500/25 transition-transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule a Free Visit</span>
              </button>

              <button
                onClick={handleContactHost}
                className="w-full py-3 rounded-2xl text-xs font-bold border-2 border-rose-600 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat with Owner</span>
              </button>
            </div>

            {/* Safety Assurance */}
            <div className="pt-2 text-center text-[11px] text-slate-400 space-y-1">
              <p className="flex items-center justify-center text-emerald-600 font-semibold">
                <Check className="w-3.5 h-3.5 mr-1" /> Safe & Transparent Rental
              </p>
              <p>Direct owner agreement. No unauthorized hidden charges.</p>
            </div>

          </div>
        </div>

      </div>

      {/* Similar Listings */}
      {similarListings.length > 0 && (
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Similar Homes in {listing.city}
            </h3>
            <p className="text-xs text-slate-500">Other recommended accommodations in this region</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarListings.map(sim => (
              <ListingCard key={sim.id} listing={sim} onVisitClick={() => setVisitModalOpen(true)} />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <ScheduleVisitModal
        listing={listing}
        isOpen={visitModalOpen}
        onClose={() => setVisitModalOpen(false)}
      />

      <ReportModal
        reportedType="listing"
        reportedId={listing.id}
        title={listing.title}
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />

    </div>
  );
}

