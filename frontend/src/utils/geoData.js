// Geolocation data, Metropolitan Indian Cities, Google Map tile layers & helper functions

export const METRO_CITIES = [
  { id: "Pune", label: "Pune", state: "Maharashtra", desc: "Baner, Hinjawadi, Kothrud, Viman Nagar", metro: true },
  { id: "Mumbai", label: "Mumbai", state: "Maharashtra", desc: "Bandra, Powai, Andheri, Juhu, Thane", metro: true },
  { id: "Bengaluru", label: "Bengaluru", state: "Karnataka", desc: "Koramangala, Indiranagar, HSR, Whitefield", metro: true },
  { id: "Delhi", label: "Delhi NCR", state: "Delhi", desc: "Hauz Khas, Saket, Cyber City, Noida", metro: true },
  { id: "Hyderabad", label: "Hyderabad", state: "Telangana", desc: "HITEC City, Gachibowli, Madhapur, Kondapur", metro: true },
  { id: "Chennai", label: "Chennai", state: "Tamil Nadu", desc: "Adyar, OMR, Velachery, Anna Nagar", metro: true },
  { id: "Kolkata", label: "Kolkata", state: "West Bengal", desc: "Salt Lake Sector V, New Town, Park Street, Ballygunge", metro: true },
  { id: "Jaipur", label: "Jaipur", state: "Rajasthan", desc: "Malviya Nagar, Mansarovar, Vaishali Nagar, C-Scheme", metro: true },
  { id: "Kochi", label: "Kochi", state: "Kerala", desc: "Kakkanad Infopark, Marine Drive, Edappally, Fort Kochi", metro: true },
  { id: "Ahmedabad", label: "Ahmedabad", state: "Gujarat", desc: "SG Highway, Prahlad Nagar, Bodakdev, Satellite", metro: true },
  { id: "Chandigarh", label: "Chandigarh", state: "Punjab/Haryana", desc: "Sector 17, Sector 35, Mohali Phase 7", metro: true },
  { id: "Indore", label: "Indore", state: "Madhya Pradesh", desc: "Vijay Nagar, Palasia, Super Corridor", metro: true },
  { id: "Lucknow", label: "Lucknow", state: "Uttar Pradesh", desc: "Gomti Nagar, Hazratganj, Vibhuti Khand", metro: true }
];

export const CITY_CENTERS = {
  "Pune": { lat: 18.5204, lng: 73.8567, zoom: 12 },
  "Mumbai": { lat: 19.0760, lng: 72.8777, zoom: 12 },
  "Bengaluru": { lat: 12.9716, lng: 77.5946, zoom: 12 },
  "Delhi": { lat: 28.6139, lng: 77.2090, zoom: 11 },
  "Hyderabad": { lat: 17.3850, lng: 78.4867, zoom: 12 },
  "Chennai": { lat: 13.0827, lng: 80.2707, zoom: 12 },
  "Kolkata": { lat: 22.5726, lng: 88.3639, zoom: 12 },
  "Jaipur": { lat: 26.9124, lng: 75.7873, zoom: 12 },
  "Kochi": { lat: 9.9312, lng: 76.2673, zoom: 12 },
  "Ahmedabad": { lat: 23.0225, lng: 72.5714, zoom: 12 },
  "Chandigarh": { lat: 30.7333, lng: 76.7794, zoom: 12 },
  "Indore": { lat: 22.7196, lng: 75.8577, zoom: 12 },
  "Lucknow": { lat: 26.8467, lng: 80.9462, zoom: 12 }
};

export const MAP_LAYERS = {
  googleRoadmap: {
    name: "Google Streets",
    url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; Google Maps'
  },
  googleHybrid: {
    name: "Google Satellite",
    url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; Google Satellite Imagery'
  },
  googleTerrain: {
    name: "Google Terrain",
    url: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; Google Terrain'
  },
  osm: {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    subdomains: ['a', 'b', 'c'],
    attribution: '&copy; OpenStreetMap contributors'
  }
};

// Curated prominent areas and IT parks across all Indian metropolitan cities
export const FAMOUS_LANDMARKS = [
  // Pune
  { name: "Baner", city: "Pune", lat: 18.5590, lng: 73.7868, hub: "Balewadi High Street" },
  { name: "Hinjawadi Phase 1", city: "Pune", lat: 18.5913, lng: 73.7389, hub: "Rajiv Gandhi Infotech Park" },
  { name: "Hinjawadi Phase 2 & 3", city: "Pune", lat: 18.5830, lng: 73.7150, hub: "Wipro & Infosys Phase 2" },
  { name: "Kothrud", city: "Pune", lat: 18.5074, lng: 73.8077, hub: "MIT World Peace University" },
  { name: "Viman Nagar", city: "Pune", lat: 18.5679, lng: 73.9143, hub: "Phoenix Marketcity" },
  { name: "Koregaon Park", city: "Pune", lat: 18.5362, lng: 73.8940, hub: "North Main Road" },
  { name: "Wakad", city: "Pune", lat: 18.5987, lng: 73.7686, hub: "Dutta Mandir Road" },
  { name: "Magarpatta City", city: "Pune", lat: 18.5158, lng: 73.9272, hub: "Cybercity & Seasons Mall" },
  { name: "Kharadi", city: "Pune", lat: 18.5516, lng: 73.9348, hub: "EON Free Zone IT Park" },

  // Mumbai
  { name: "Bandra West", city: "Mumbai", lat: 19.0596, lng: 72.8295, hub: "Linking Road & Carter Road" },
  { name: "Andheri East", city: "Mumbai", lat: 19.1136, lng: 72.8697, hub: "MIDC & SEEPZ" },
  { name: "Andheri West", city: "Mumbai", lat: 19.1363, lng: 72.8277, hub: "Lokhandwala Complex" },
  { name: "Powai", city: "Mumbai", lat: 19.1176, lng: 72.9060, hub: "Hiranandani Business Park & IIT Bombay" },
  { name: "Juhu", city: "Mumbai", lat: 19.1075, lng: 72.8263, hub: "NMIMS & Juhu Circle" },
  { name: "Thane West", city: "Mumbai", lat: 19.2183, lng: 72.9781, hub: "Viviana Mall & Ghodbunder Road" },
  { name: "Bandra Kurla Complex (BKC)", city: "Mumbai", lat: 19.0662, lng: 72.8687, hub: "BKC Financial District" },

  // Bengaluru
  { name: "Koramangala", city: "Bengaluru", lat: 12.9352, lng: 77.6245, hub: "Forum Mall & 80 Feet Road" },
  { name: "Indiranagar", city: "Bengaluru", lat: 12.9784, lng: 77.6408, hub: "100 Feet Road Food Hub" },
  { name: "HSR Layout", city: "Bengaluru", lat: 12.9121, lng: 77.6446, hub: "Sector 1 & Startup Hub" },
  { name: "Whitefield", city: "Bengaluru", lat: 12.9698, lng: 77.7499, hub: "ITPB & Prestige Shantiniketan" },
  { name: "Bellandur", city: "Bengaluru", lat: 12.9304, lng: 77.6784, hub: "EcoSpace & RMZ Ecoworld" },
  { name: "Electronic City", city: "Bengaluru", lat: 12.8399, lng: 77.6770, hub: "Infosys & Wipro Campuses" },

  // Delhi NCR
  { name: "Hauz Khas", city: "Delhi", lat: 28.5494, lng: 77.2001, hub: "IIT Delhi & HKV Village" },
  { name: "Saket", city: "Delhi", lat: 28.5244, lng: 77.2104, hub: "Select Citywalk & District Centre" },
  { name: "Lajpat Nagar", city: "Delhi", lat: 28.5677, lng: 77.2433, hub: "Central Market" },
  { name: "Connaught Place", city: "Delhi", lat: 28.6304, lng: 77.2177, hub: "Rajiv Chowk Interchange" },
  { name: "Gurugram Cyber City", city: "Delhi", lat: 28.4950, lng: 77.0895, hub: "DLF CyberHub & Rapid Metro" },
  { name: "Noida Sector 62", city: "Delhi", lat: 28.6280, lng: 77.3649, hub: "IT Park & Electronic City Metro" },

  // Hyderabad
  { name: "HITEC City", city: "Hyderabad", lat: 17.4474, lng: 78.3762, hub: "Cyber Towers & Mindspace IT Park" },
  { name: "Gachibowli", city: "Hyderabad", lat: 17.4401, lng: 78.3489, hub: "Financial District & DLF Cybercity" },
  { name: "Madhapur", city: "Hyderabad", lat: 17.4483, lng: 78.3915, hub: "Inorbit Mall & Avasa" },
  { name: "Jubilee Hills", city: "Hyderabad", lat: 17.4319, lng: 78.4073, hub: "Road No. 36 & 45" },
  { name: "Kondapur", city: "Hyderabad", lat: 17.4699, lng: 78.3578, hub: "Botanical Garden Road" },

  // Chennai
  { name: "Adyar", city: "Chennai", lat: 13.0012, lng: 80.2565, hub: "IIT Madras & Gandhi Nagar" },
  { name: "T Nagar", city: "Chennai", lat: 13.0418, lng: 80.2341, hub: "Pondy Bazaar & Panagal Park" },
  { name: "Velachery", city: "Chennai", lat: 12.9815, lng: 80.2180, hub: "Phoenix Marketcity Chennai" },
  { name: "OMR (Old Mahabalipuram Rd)", city: "Chennai", lat: 12.9344, lng: 80.2312, hub: "Tidel Park & Ascendas IT Park" },
  { name: "Anna Nagar", city: "Chennai", lat: 13.0850, lng: 80.2101, hub: "Anna Nagar Tower Metro" },

  // Kolkata
  { name: "Salt Lake (Sector V)", city: "Kolkata", lat: 22.5867, lng: 88.4178, hub: "Sector V Tech Hub & Wipro" },
  { name: "New Town", city: "Kolkata", lat: 22.5850, lng: 88.4680, hub: "Eco Park & Action Area 1" },
  { name: "Park Street", city: "Kolkata", lat: 22.5518, lng: 88.3524, hub: "Flurys & Camac Street" },
  { name: "Ballygunge", city: "Kolkata", lat: 22.5280, lng: 88.3650, hub: "Gariahat & South City Mall" },
  { name: "Rajarhat", city: "Kolkata", lat: 22.6100, lng: 88.4900, hub: "City Centre 2 & Chinar Park" },

  // Jaipur
  { name: "Malviya Nagar", city: "Jaipur", lat: 26.8549, lng: 75.8243, hub: "World Trade Park (WTP) & Gaurav Tower" },
  { name: "Mansarovar", city: "Jaipur", lat: 26.8530, lng: 75.7600, hub: "City Park & Mansarovar Metro" },
  { name: "Vaishali Nagar", city: "Jaipur", lat: 26.9060, lng: 75.7420, hub: "Amrapali Circle & Queens Road" },
  { name: "C-Scheme", city: "Jaipur", lat: 26.9080, lng: 75.7980, hub: "Statue Circle & Ashok Nagar" },
  { name: "Jagatpura", city: "Jaipur", lat: 26.8220, lng: 75.8580, hub: "SKIT & Bombay Hospital" },

  // Kochi
  { name: "Kakkanad (Infopark)", city: "Kochi", lat: 10.0159, lng: 76.3419, hub: "Infopark & SmartCity Kochi" },
  { name: "Edappally", city: "Kochi", lat: 10.0261, lng: 76.3125, hub: "Lulu Mall & Metro Interchange" },
  { name: "Marine Drive", city: "Kochi", lat: 9.9816, lng: 76.2750, hub: "Rainbow Bridge & High Court" },
  { name: "Fort Kochi", city: "Kochi", lat: 9.9658, lng: 76.2421, hub: "Princess Street & Biennale Beach" },
  { name: "Kaloor", city: "Kochi", lat: 9.9980, lng: 76.2950, hub: "JLN International Stadium Metro" },

  // Ahmedabad
  { name: "SG Highway", city: "Ahmedabad", lat: 23.0525, lng: 72.5110, hub: "Iskcon Cross Road & Titanium Square" },
  { name: "Prahlad Nagar", city: "Ahmedabad", lat: 23.0090, lng: 72.5080, hub: "Corporate Road & Garden" },
  { name: "Bodakdev", city: "Ahmedabad", lat: 23.0370, lng: 72.5120, hub: "Sindhu Bhavan Road" },
  { name: "Satellite", city: "Ahmedabad", lat: 23.0290, lng: 72.5280, hub: "Shivranjani Cross Road" },

  // Chandigarh
  { name: "Sector 17", city: "Chandigarh", lat: 30.7400, lng: 76.7820, hub: "City Centre Plaza" },
  { name: "Sector 35", city: "Chandigarh", lat: 30.7250, lng: 76.7650, hub: "Food & Commercial District" },
  { name: "Mohali Phase 7", city: "Chandigarh", lat: 30.7046, lng: 76.7179, hub: "Industrial IT Area & Bestech Mall" },

  // Indore
  { name: "Vijay Nagar", city: "Indore", lat: 22.7533, lng: 75.8937, hub: "Brilliant Convention Centre & C21 Mall" },
  { name: "Palasia", city: "Indore", lat: 22.7244, lng: 75.8839, hub: "Old Palasia & 56 Dukan" },

  // Lucknow
  { name: "Gomti Nagar", city: "Lucknow", lat: 26.8500, lng: 81.0000, hub: "Vibhuti Khand IT Park & Riverside Mall" },
  { name: "Hazratganj", city: "Lucknow", lat: 26.8520, lng: 80.9460, hub: "Ganj Heritage Market & Metro" }
];

// Haversine formula to calculate distance in Kilometers
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Radius of Earth in KM
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

// Commute duration estimate
export function estimateCommute(distanceKm) {
  if (!distanceKm && distanceKm !== 0) return null;
  if (distanceKm < 0.8) {
    return {
      walkMin: Math.max(3, Math.round(distanceKm * 12)),
      driveMin: Math.max(2, Math.round(distanceKm * 3)),
      metroMin: 5
    };
  }
  return {
    driveMin: Math.round(distanceKm * 2.8 + 4),
    bikeMin: Math.round(distanceKm * 2.1 + 2),
    metroMin: Math.round(distanceKm * 1.8 + 6),
    walkMin: Math.round(distanceKm * 12)
  };
}

// Helper to open real Google Maps in new tab with directions or coordinates
export function getGoogleMapsUrl(lat, lng, query = '') {
  if (query) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export function getGoogleMapsDirectionsUrl(destLat, destLng, originLat = null, originLng = null) {
  if (originLat && originLng) {
    return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
}

// Smart geocoding lookup
export async function geocodeSearch(query, city = '') {
  const qClean = query.trim().toLowerCase();

  // 1. Check instant offline dictionary
  const offlineMatch = FAMOUS_LANDMARKS.find(l =>
    l.name.toLowerCase().includes(qClean) ||
    (l.hub && l.hub.toLowerCase().includes(qClean))
  );

  if (offlineMatch) {
    return {
      lat: offlineMatch.lat,
      lng: offlineMatch.lng,
      displayName: `${offlineMatch.name}, ${offlineMatch.city}`,
      area: offlineMatch.name,
      city: offlineMatch.city
    };
  }

  // 2. Try online Nominatim geocoding
  try {
    const fullQuery = city ? `${query}, ${city}, India` : `${query}, India`;
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}&limit=1`, {
      headers: { 'Accept-Language': 'en' }
    });
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name,
        area: query,
        city: city || "Pune"
      };
    }
  } catch (err) {
    console.warn("Online geocoding fallback triggered:", err);
  }

  // Fallback to City Center
  const fallback = CITY_CENTERS[city] || CITY_CENTERS["Pune"];
  return {
    lat: fallback.lat,
    lng: fallback.lng,
    displayName: `${query}, ${city || "Pune"}`,
    area: query,
    city: city || "Pune"
  };
}

// Reverse geocoding helper (coordinates -> readable address)
export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
      headers: { 'Accept-Language': 'en' }
    });
    const data = await res.json();
    if (data && data.address) {
      const addr = data.address;
      const sub = addr.suburb || addr.neighbourhood || addr.residential || addr.commercial || addr.road || '';
      const c = addr.city || addr.town || addr.state_district || 'Pune';
      return {
        fullAddress: data.display_name,
        area: sub || 'Local Area',
        city: c,
        pincode: addr.postcode || ''
      };
    }
  } catch (err) {
    console.warn("Reverse geocode fallback:", err);
  }

  // Closest landmark approximation
  let closest = FAMOUS_LANDMARKS[0];
  let minD = 999999;
  for (const lm of FAMOUS_LANDMARKS) {
    const d = Math.hypot(lm.lat - lat, lm.lng - lng);
    if (d < minD) {
      minD = d;
      closest = lm;
    }
  }

  return {
    fullAddress: `Near ${closest.hub || closest.name}, ${closest.name}, ${closest.city}`,
    area: closest.name,
    city: closest.city,
    pincode: "411045"
  };
}
