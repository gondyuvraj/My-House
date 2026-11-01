import React, { useState, useEffect } from 'react';
import { 
  MapContainer, TileLayer, Marker, Popup, useMap 
} from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { 
  Search, MapPin, Navigation, ExternalLink, Layers, 
  Crosshair, Star, CheckCircle2, ArrowUpRight, Compass, ShieldCheck 
} from 'lucide-react';
import { 
  MAP_LAYERS, CITY_CENTERS, FAMOUS_LANDMARKS, 
  geocodeSearch, getGoogleMapsDirectionsUrl 
} from '../utils/geoData';
import toast from 'react-hot-toast';

// Custom price pill marker generator
function createPriceIcon(price, isSelected = false) {
  const formatted = price >= 1000 
    ? `₹${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}k` 
    : `₹${price}`;

  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background: ${isSelected ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #e11d48, #4f46e5)'};
        color: white;
        font-weight: 800;
        font-size: 11px;
        padding: 5px 11px;
        border-radius: 9999px;
        box-shadow: 0 4px 14px ${isSelected ? 'rgba(16, 185, 129, 0.5)' : 'rgba(225, 29, 72, 0.45)'};
        border: 2px solid white;
        white-space: nowrap;
        cursor: pointer;
        transform: translate(-50%, -50%) ${isSelected ? 'scale(1.15)' : 'scale(1)'};
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        gap: 3px;
      ">
        <span>${formatted}</span>
      </div>
    `,
    iconSize: [50, 28],
    iconAnchor: [25, 14]
  });
}

// User current GPS position marker
const userLocationIcon = L.divIcon({
  className: 'user-gps-marker',
  html: `
    <div style="position: relative; width: 24px; height: 24px;">
      <div style="position: absolute; inset: 0; border-radius: 50%; background: #3b82f6; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: absolute; inset: 4px; border-radius: 50%; background: #2563eb; border: 2.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Map controller to fly to location
function MapController({ center, zoom = 13 }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapView({ listings = [], centerCity = "Pune" }) {
  const [activeLayerKey, setActiveLayerKey] = useState('googleRoadmap');
  const [mapCenter, setMapCenter] = useState(() => {
    const c = CITY_CENTERS[centerCity] || CITY_CENTERS["Pune"];
    return [c.lat, c.lng];
  });
  const [mapZoom, setMapZoom] = useState(13);
  const [userGpsPosition, setUserGpsPosition] = useState(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);

  // Sync city changes
  useEffect(() => {
    const c = CITY_CENTERS[centerCity] || CITY_CENTERS["Pune"];
    setMapCenter([c.lat, c.lng]);
    setMapZoom(c.zoom || 13);
  }, [centerCity]);

  const activeLayer = MAP_LAYERS[activeLayerKey] || MAP_LAYERS.googleRoadmap;

  // Filter famous hubs for the active city
  const cityHubs = FAMOUS_LANDMARKS.filter(lm => 
    !centerCity || centerCity === 'all' || lm.city.toLowerCase() === centerCity.toLowerCase()
  ).slice(0, 6);

  // 1-Click Locate User with GPS
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserGpsPosition([lat, lng]);
        setMapCenter([lat, lng]);
        setMapZoom(15);
        setLocatingUser(false);
        toast.success("Centered on your current location!", { icon: '📍' });
      },
      (err) => {
        setLocatingUser(false);
        toast.error("Could not get your GPS location. Please check browser permissions.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Search Destination / Area
  const handleSearchDestination = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const result = await geocodeSearch(searchQuery.trim(), centerCity !== 'all' ? centerCity : 'Pune');
      if (result) {
        setMapCenter([result.lat, result.lng]);
        setMapZoom(14);
        toast.success(`Showing properties near ${result.area || searchQuery}`);
      }
    } catch (err) {
      toast.error("Destination not found.");
    }
  };

  return (
    <div className="relative w-full h-full min-h-[580px] rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-soft-lg flex flex-col">
      
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pointer-events-none">
        
        {/* Destination Search Box */}
        <form 
          onSubmit={handleSearchDestination}
          className="pointer-events-auto flex items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-700 p-1 w-full sm:max-w-md"
        >
          <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search area or landmark in ${centerCity}...`}
            className="w-full px-3 py-2 bg-transparent text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 text-white text-xs font-bold shadow-md hover:from-rose-500 hover:to-indigo-500 transition-all cursor-pointer shrink-0"
          >
            Find
          </button>
        </form>

        {/* Action Controls: GPS Locate + Google Map Layer Toggle */}
        <div className="pointer-events-auto flex items-center space-x-2 shrink-0 self-end sm:self-auto">
          {/* GPS Locate Button */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locatingUser}
            className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 shadow-xl text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
            title="Locate My Position"
          >
            <Crosshair className={`w-4 h-4 text-rose-600 ${locatingUser ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{locatingUser ? "Locating..." : "Locate Me"}</span>
          </button>

          {/* Layer Selector */}
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-700 flex text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveLayerKey('googleRoadmap')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeLayerKey === 'googleRoadmap'
                  ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Map
            </button>
            <button
              type="button"
              onClick={() => setActiveLayerKey('googleHybrid')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeLayerKey === 'googleHybrid'
                  ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Satellite
            </button>
          </div>
        </div>
      </div>

      {/* Floating Popular Hubs Carousel */}
      {cityHubs.length > 0 && (
        <div className="absolute top-20 left-4 right-4 z-[400] flex items-center gap-1.5 overflow-x-auto no-scrollbar pointer-events-auto pb-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-md shrink-0 shadow">
            Hotspots:
          </span>
          {cityHubs.map((hub, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setMapCenter([hub.lat, hub.lng]);
                setMapZoom(14);
                toast.success(`Jumped to ${hub.name}`);
              }}
              className="px-3 py-1 rounded-full bg-white/95 dark:bg-slate-900/95 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold backdrop-blur-md shadow-md transition-all shrink-0 cursor-pointer"
            >
              📍 {hub.name}
            </button>
          ))}
        </div>
      )}

      {/* Main Map Container */}
      <div className="flex-1 w-full h-full min-h-[580px]">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          className="w-full h-full min-h-[580px]"
        >
          <MapController center={mapCenter} zoom={mapZoom} />
          
          <TileLayer
            key={activeLayerKey}
            url={activeLayer.url}
            subdomains={activeLayer.subdomains}
            attribution={activeLayer.attribution}
          />

          {/* User GPS location Marker */}
          {userGpsPosition && (
            <Marker position={userGpsPosition} icon={userLocationIcon}>
              <Popup>
                <div className="text-center font-bold text-xs p-1">
                  <span className="text-blue-600">📍 You are here</span>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Listing Markers with Price Badges */}
          {listings.map((item) => {
            if (!item.lat || !item.lng) return null;
            const isSelected = selectedListing?.id === item.id;

            return (
              <Marker
                key={item.id}
                position={[item.lat, item.lng]}
                icon={createPriceIcon(item.rent, isSelected)}
                eventHandlers={{
                  click: () => setSelectedListing(item)
                }}
              >
                <Popup className="custom-popup" closeButton={true}>
                  <div className="w-64 p-1 space-y-2">
                    <div className="relative h-28 w-full rounded-xl overflow-hidden">
                      <img
                        src={item.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow">
                        {item.type}
                      </span>
                      {item.owner_verified && (
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-600 text-white flex items-center space-x-1 shadow">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                          ₹{item.rent?.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-slate-400">/mo</span>
                        </span>
                        {item.avg_rating && (
                          <span className="flex items-center text-[11px] font-bold text-amber-500">
                            <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                            {item.avg_rating}
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-xs text-slate-900 mt-0.5 line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate flex items-center mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 mr-1 shrink-0" />
                        {item.area}, {item.city}
                      </p>
                    </div>

                    {/* Actions: View Details + Directions in Google Maps */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <Link
                        to={`/listings/${item.id}`}
                        className="py-1.5 text-center text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm transition-all"
                      >
                        View Details
                      </Link>
                      <a
                        href={getGoogleMapsDirectionsUrl(item.lat, item.lng)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 text-center text-xs font-bold bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1"
                      >
                        <span>Directions</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Bottom Floating Stats Pill */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2 pointer-events-auto">
        <Compass className="w-4 h-4 text-rose-600 animate-pulse" />
        <span>{listings.length} Properties in {centerCity !== 'all' ? centerCity : 'India'}</span>
      </div>

    </div>
  );
}
