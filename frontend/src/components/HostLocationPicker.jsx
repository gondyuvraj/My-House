import React, { useState, useEffect, useRef } from 'react';
import { 
  MapContainer, TileLayer, Marker, useMap, useMapEvents 
} from 'react-leaflet';
import L from 'leaflet';
import { 
  Search, MapPin, Navigation, Layers, ExternalLink, 
  CheckCircle2, Sparkles, Crosshair, AlertCircle 
} from 'lucide-react';
import { 
  MAP_LAYERS, CITY_CENTERS, FAMOUS_LANDMARKS, 
  geocodeSearch, reverseGeocode, getGoogleMapsUrl 
} from '../utils/geoData';
import toast from 'react-hot-toast';

// Custom Google Maps style animated drop pin
const hostPinIcon = L.divIcon({
  className: 'host-marker-pin',
  html: `
    <div style="position: relative; width: 36px; height: 44px; transform: translate(-18px, -44px);">
      <svg viewBox="0 0 36 44" width="36" height="44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 0C8.05887 0 0 8.05887 0 18C0 27.5 13.5 41.5 17.1 43.6C17.65 43.9 18.35 43.9 18.9 43.6C22.5 41.5 36 27.5 36 18C36 8.05887 27.9411 0 18 0Z" fill="#E11D48"/>
        <circle cx="18" cy="17" r="8" fill="white"/>
        <circle cx="18" cy="17" r="4.5" fill="#4F46E5"/>
      </svg>
      <div style="
        position: absolute;
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%);
        width: 14px;
        height: 6px;
        background: rgba(0,0,0,0.3);
        border-radius: 50%;
        filter: blur(1px);
      "></div>
    </div>
  `,
  iconSize: [36, 44],
  iconAnchor: [18, 44]
});

// Listener for clicks on map to reposition marker
function MapClickHandler({ onLocationChange }) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

// Controller to smoothly pan & zoom map when coordinates change
function MapCenterController({ center, zoom = 15 }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function HostLocationPicker({
  coordinates,
  setCoordinates,
  city = "Pune",
  setCity,
  area = "",
  setArea,
  fullAddress = "",
  setFullAddress
}) {
  const [activeLayerKey, setActiveLayerKey] = useState('googleRoadmap');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [reverseGeocoding, setReverseGeocoding] = useState(false);
  const [filteredLandmarks, setFilteredLandmarks] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const activeLayer = MAP_LAYERS[activeLayerKey] || MAP_LAYERS.googleRoadmap;

  // Sync center when city changes if coords are default
  useEffect(() => {
    if (city && CITY_CENTERS[city]) {
      const cityLoc = CITY_CENTERS[city];
      // only update if coordinates are far from the city
      const dist = Math.hypot(coordinates[0] - cityLoc.lat, coordinates[1] - cityLoc.lng);
      if (dist > 1.5) {
        setCoordinates([cityLoc.lat, cityLoc.lng]);
      }
    }
  }, [city]);

  // Handle position change with automatic address suggestion
  const handlePositionChange = async (newLat, newLng, skipReverse = false) => {
    setCoordinates([newLat, newLng]);
    if (skipReverse) return;

    setReverseGeocoding(true);
    try {
      const result = await reverseGeocode(newLat, newLng);
      if (result) {
        if (setArea && (!area || area === 'Baner')) setArea(result.area);
        if (setCity && result.city) setCity(result.city);
        if (setFullAddress && !fullAddress) setFullAddress(result.fullAddress);
        toast.success(`Pin located near ${result.area}`, { icon: '📍', duration: 2500 });
      }
    } catch (e) {
      // ignore
    } finally {
      setReverseGeocoding(false);
    }
  };

  // 1-Click Detect GPS Location
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        await handlePositionChange(lat, lng);
        setDetectingGps(false);
        toast.success("GPS location locked onto your current building!");
      },
      (err) => {
        setDetectingGps(false);
        toast.error("Could not retrieve GPS location. Please check browser permissions or pin manually on the map.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Search Address / Landmark
  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setShowSuggestions(false);
    try {
      const result = await geocodeSearch(searchQuery.trim(), city);
      if (result) {
        await handlePositionChange(result.lat, result.lng);
        if (setArea && result.area) setArea(result.area);
        if (setFullAddress && !fullAddress) setFullAddress(result.displayName);
        toast.success(`Moved pin to ${result.area || searchQuery}`);
      }
    } catch (err) {
      toast.error("Could not find the location. Try zooming in and clicking the map.");
    } finally {
      setSearching(false);
    }
  };

  // Autocomplete suggestions
  const handleSearchInputChange = (val) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setFilteredLandmarks([]);
      setShowSuggestions(false);
      return;
    }
    const clean = val.toLowerCase();
    const matches = FAMOUS_LANDMARKS.filter(lm => 
      (lm.city.toLowerCase() === city.toLowerCase() || !city) &&
      (lm.name.toLowerCase().includes(clean) || (lm.hub && lm.hub.toLowerCase().includes(clean)))
    ).slice(0, 5);
    setFilteredLandmarks(matches);
    setShowSuggestions(matches.length > 0);
  };

  const handleSelectLandmark = async (lm) => {
    setSearchQuery(lm.name);
    setShowSuggestions(false);
    await handlePositionChange(lm.lat, lm.lng);
    if (setArea) setArea(lm.name);
    if (setFullAddress && !fullAddress) setFullAddress(`${lm.hub || lm.name}, ${lm.name}, ${lm.city}`);
  };

  return (
    <div className="space-y-3">
      {/* Top Controls: Search Bar & GPS Locate */}
      <div className="relative">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onFocus={() => { if (filteredLandmarks.length > 0) setShowSuggestions(true); }}
              placeholder={`Search building, street, or landmark in ${city} (e.g. Hinjawadi Phase 1, Baner)...`}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={searching}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-rose-500/20 active:scale-95 transition-all shrink-0 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>{searching ? "Locating..." : "Find on Map"}</span>
          </button>

          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={detectingGps}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 cursor-pointer"
            title="Detect My Current GPS Location"
          >
            <Crosshair className={`w-4 h-4 text-rose-600 ${detectingGps ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{detectingGps ? "Detecting..." : "Detect GPS"}</span>
          </button>
        </form>

        {/* Autocomplete Dropdown */}
        {showSuggestions && filteredLandmarks.length > 0 && (
          <div className="absolute left-0 right-24 mt-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl py-1.5 z-[1000] text-xs">
            {filteredLandmarks.map((lm, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectLandmark(lm)}
                className="w-full text-left px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-slate-800 flex items-center justify-between text-slate-800 dark:text-slate-200 font-medium"
              >
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span className="font-bold">{lm.name}</span>
                  {lm.hub && <span className="text-slate-400 text-[11px]">({lm.hub})</span>}
                </div>
                <span className="text-[10px] text-slate-400">{lm.city}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Display Container with Floating Controls */}
      <div className="relative h-72 sm:h-80 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner group">
        <MapContainer
          center={coordinates}
          zoom={15}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <MapCenterController center={coordinates} zoom={15} />
          <TileLayer
            key={activeLayerKey}
            url={activeLayer.url}
            subdomains={activeLayer.subdomains}
            attribution={activeLayer.attribution}
          />
          <MapClickHandler onLocationChange={handlePositionChange} />
          
          <Marker
            position={coordinates}
            icon={hostPinIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                handlePositionChange(position.lat, position.lng);
              }
            }}
          />
        </MapContainer>

        {/* Floating Layer Switcher (Streets vs Satellite) */}
        <div className="absolute top-3 right-3 z-[400] flex items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 rounded-xl shadow-lg border border-slate-200/80 dark:border-slate-700 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setActiveLayerKey('googleRoadmap')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeLayerKey === 'googleRoadmap'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Google Map
          </button>
          <button
            type="button"
            onClick={() => setActiveLayerKey('googleHybrid')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeLayerKey === 'googleHybrid'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Satellite View
          </button>
        </div>

        {/* Floating Instruction Banner at Bottom */}
        <div className="absolute bottom-3 left-3 right-3 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-slate-200/80 dark:border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
            <Sparkles className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="font-semibold text-[11px] sm:text-xs">
              {reverseGeocoding ? "Identifying address..." : "Click anywhere or drag the red pin to your exact building entrance."}
            </span>
          </div>

          <a
            href={getGoogleMapsUrl(coordinates[0], coordinates[1])}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
          >
            <span>Verify in Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Lat/Lng Real-time Status Card */}
      <div className="flex flex-wrap items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Coordinates: <strong className="text-slate-800 dark:text-white font-mono">{coordinates[0].toFixed(5)}, {coordinates[1].toFixed(5)}</strong></span>
        </div>
        <span className="text-[11px] text-slate-400">
          High precision GPS coordinates will help seekers navigate directly to your door.
        </span>
      </div>
    </div>
  );
}

