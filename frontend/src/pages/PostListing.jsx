import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, UploadCloud, MapPin, Check, Plus, Trash2, 
  Sparkles, DollarSign, Shield, ArrowRight 
} from 'lucide-react';
import HostLocationPicker from '../components/HostLocationPicker';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { AMENITY_CATEGORIES, AMENITIES_DATA, ALL_AMENITY_NAMES, getAmenityInfo } from '../utils/amenities';
import { METRO_CITIES } from '../utils/geoData';
import toast from 'react-hot-toast';

export default function PostListing() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('PG');
  const [genderPref, setGenderPref] = useState('any');
  const [rent, setRent] = useState(12000);
  const [deposit, setDeposit] = useState(24000);
  const [maintenance, setMaintenance] = useState(500);
  const [availableFrom, setAvailableFrom] = useState('Immediate');
  const [city, setCity] = useState(user?.city || 'Pune');
  const [area, setArea] = useState('Baner');
  const [fullAddress, setFullAddress] = useState('');
  const [furnishing, setFurnishing] = useState('semi-furnished');
  const [contactPref, setContactPref] = useState('both');

  // Coordinates [lat, lng]
  const [coordinates, setCoordinates] = useState([18.5590, 73.7868]);

  // Selected Amenities
  const [amenities, setAmenities] = useState(["WiFi", "AC", "Power Backup", "Geyser", "Housekeeping", "Attached Bathroom", "RO Water"]);
  const [amenityCategory, setAmenityCategory] = useState('all');
  const [customAmenityInput, setCustomAmenityInput] = useState('');

  // Images state (URLs or uploaded)
  const [images, setImages] = useState([
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&auto=format&fit=crop&q=80"
  ]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAmenityToggle = (am) => {
    setAmenities(prev => prev.includes(am) ? prev.filter(x => x !== am) : [...prev, am]);
  };

  const handleSelectEssentials = () => {
    const essentials = ["WiFi", "AC", "Power Backup", "Geyser", "Attached Bathroom", "RO Water", "Housekeeping", "Laundry", "CCTV"];
    setAmenities(prev => Array.from(new Set([...prev, ...essentials])));
    toast.success("Essential amenities added!");
  };

  const handleSelectAllAmenities = () => {
    setAmenities(ALL_AMENITY_NAMES);
    toast.success("All 26 amenities selected!");
  };

  const handleClearAmenities = () => {
    setAmenities([]);
  };

  const handleAddCustomAmenity = (e) => {
    e?.preventDefault();
    const trimmed = customAmenityInput.trim();
    if (!trimmed) return;
    if (amenities.includes(trimmed)) {
      toast.error("Amenity already added!");
      return;
    }
    setAmenities(prev => [...prev, trimmed]);
    setCustomAmenityInput('');
    toast.success(`Added "${trimmed}" to amenities!`);
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < Math.min(files.length, 5); i++) {
      formData.append('files', files[i]);
    }

    try {
      const res = await apiClient.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const fullUrls = res.data.map(u => u.startsWith('http') ? u : `http://localhost:8000${u}`);
      setImages(prev => [...prev, ...fullUrls]);
      toast.success("Photos uploaded successfully!");
    } catch (err) {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleAddImageUrl = (e) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) return;
    setImages(prev => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login to publish a listing");
      navigate('/login');
      return;
    }
    if (images.length === 0) {
      toast.error("Please provide at least 1 property photograph");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        type,
        gender_preference: genderPref,
        rent: Number(rent),
        deposit: Number(deposit),
        maintenance: Number(maintenance),
        available_from: availableFrom,
        city,
        area,
        full_address: fullAddress || `${area}, ${city}`,
        lat: coordinates[0],
        lng: coordinates[1],
        furnishing,
        amenities,
        house_rules: [
          "Maintain cleanliness in common spaces",
          "Quiet hours after 10 PM",
          "Respect fellow roommates"
        ],
        nearby_places: [
          `${area} Metro Station`,
          `${city} Tech Center`,
          "Market & Supermarket"
        ],
        contact_preference: contactPref,
        images
      };

      const res = await apiClient.post('/listings', payload);
      toast.success("Listing published successfully!");
      navigate(`/listings/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to post listing.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#3f0716] via-[#2d0f36] to-[#0f1738] border border-rose-500/20 text-white shadow-soft-lg">
        <span className="text-xs font-bold uppercase tracking-wider text-rose-200">List Your Accommodation</span>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
          Post a PG, Room, or Flat
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Reach thousands of verified students and IT professionals searching for rooms in major tech hubs.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Property Details */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center">
            <Home className="w-4 h-4 mr-2 text-brand-700" />
            Basic Property Information
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Listing Headline</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Luxury Single Room in High-rise near Balewadi High Street"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Property Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
              >
                <option value="PG">Paying Guest (PG)</option>
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
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Furnishing</label>
              <select
                value={furnishing}
                onChange={(e) => setFurnishing(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold capitalize"
              >
                <option value="fully-furnished">Fully Furnished</option>
                <option value="semi-furnished">Semi Furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Gender Preference</label>
              <select
                value={genderPref}
                onChange={(e) => setGenderPref(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold capitalize"
              >
                <option value="any">Any (Male or Female)</option>
                <option value="male">Male Only</option>
                <option value="female">Female Only</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Monthly Rent (₹)</label>
              <input
                type="number"
                required
                min="1000"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Security Deposit (₹)</label>
              <input
                type="number"
                min="0"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Available From</label>
              <input
                type="text"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
                placeholder="Immediate or YYYY-MM-DD"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Detailed Description</label>
            <textarea
              rows="3"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Highlight room specifications, ventilation, balconies, nearby landmarks, who lives in other rooms..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Location & Map Pin Picker */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-rose-600" />
                Property Location & Google Map Pin
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pinpoint your property on the map, search landmarks, or click "Detect GPS" to pin your exact building.
              </p>
            </div>
            <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-200/60 dark:border-rose-900/40 uppercase tracking-wider">
              Google Maps & GPS Enabled
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold cursor-pointer"
              >
                {METRO_CITIES.map(c => (
                  <option key={c.id} value={c.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    {c.label} ({c.state})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Area / Locality</label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Baner, Hinjawadi, Koramangala..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Building Address</label>
            <input
              type="text"
              required
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              placeholder="e.g. Flat 402, Green Horizon Heights, Near MIT College, Kothrud"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
            />
          </div>

          <HostLocationPicker
            coordinates={coordinates}
            setCoordinates={setCoordinates}
            city={city}
            setCity={setCity}
            area={area}
            setArea={setArea}
            fullAddress={fullAddress}
            setFullAddress={setFullAddress}
          />
        </div>

        {/* Multi-Image Upload & Preview */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center">
            <UploadCloud className="w-4 h-4 mr-2 text-brand-700" />
            Property Photographs (Up to 10)
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((imgUrl, index) => (
              <div key={index} className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                <img src={imgUrl} alt="room" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-red-600 text-white shadow-sm opacity-90 hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center">
            <label className="w-full sm:w-auto px-4 py-2.5 rounded-xl border-2 border-dashed border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 text-xs font-bold text-center cursor-pointer hover:bg-brand-100">
              <span>{uploading ? "Uploading..." : "+ Upload Images from Device"}</span>
              <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            <span className="text-xs text-slate-400">or add direct image URL:</span>

            <div className="flex-1 flex gap-2 w-full sm:w-auto">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold"
              >
                Add URL
              </button>
            </div>
          </div>
        </div>

        {/* Amenities Selection */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Available Amenities
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/50">
                  {amenities.length} Selected
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Select amenities provided with this room or flat. Properties with more verified amenities attract 3x faster tenant bookings.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={handleSelectEssentials}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                + Essentials
              </button>
              <button
                type="button"
                onClick={handleSelectAllAmenities}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                Select All
              </button>
              {amenities.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAmenities}
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setAmenityCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                amenityCategory === 'all'
                  ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Amenities ({AMENITIES_DATA.length})
            </button>
            {AMENITY_CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat.id}
                onClick={() => setAmenityCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  amenityCategory === cat.id
                    ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Amenities Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {AMENITIES_DATA
              .filter(am => amenityCategory === 'all' || am.category === amenityCategory)
              .map((am) => {
                const isChecked = amenities.includes(am.name);
                const IconComponent = am.icon;
                return (
                  <button
                    type="button"
                    key={am.id}
                    onClick={() => handleAmenityToggle(am.name)}
                    className={`p-3 rounded-2xl border text-left transition-all duration-200 flex items-start space-x-3 group relative cursor-pointer ${
                      isChecked
                        ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/50 shadow-sm shadow-rose-500/10'
                        : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 transition-colors ${
                      isChecked 
                        ? 'bg-gradient-to-br from-rose-600 to-indigo-600 text-white shadow-sm' 
                        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-rose-500'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold truncate ${
                          isChecked ? 'text-rose-950 dark:text-rose-200' : 'text-slate-800 dark:text-slate-200'
                        }`}>
                          {am.label}
                        </span>
                        {isChecked && (
                          <div className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 ml-1">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {am.description}
                      </p>
                    </div>
                  </button>
                );
              })}
          </div>

          {/* Custom Amenity Adder */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Have something special? Add custom amenities
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Solar Water Heater, Terrace Garden, Study Lamp..."
                value={customAmenityInput}
                onChange={(e) => setCustomAmenityInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomAmenity(); }}}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddCustomAmenity}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition-colors shrink-0 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Custom Amenities Tags */}
            {amenities.filter(am => !ALL_AMENITY_NAMES.includes(am)).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="text-[11px] font-bold text-slate-400 py-1 mr-1">Custom:</span>
                {amenities
                  .filter(am => !ALL_AMENITY_NAMES.includes(am))
                  .map(customAm => (
                    <span
                      key={customAm}
                      className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50"
                    >
                      <span>{customAm}</span>
                      <button
                        type="button"
                        onClick={() => handleAmenityToggle(customAm)}
                        className="hover:text-rose-600 transition-colors ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-md shadow-rose-500/25 transition-transform hover:-translate-y-0.5 active:scale-95 flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{submitting ? "Publishing Property..." : "Publish Listing Live"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </form>

    </div>
  );
}

