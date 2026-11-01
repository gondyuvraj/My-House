import React from 'react';
import {
  Wifi, Snowflake, Zap, Flame, Bath, Sun,
  Utensils, Droplets, CookingPot, Shirt, Sparkles,
  Archive, Building, Video, ShieldCheck, Fingerprint,
  ShieldAlert, Laptop, Tv, BatteryCharging, Car,
  Dumbbell, Waves, Gamepad2, Check
} from 'lucide-react';

export const AMENITY_CATEGORIES = [
  {
    id: 'comfort',
    name: 'Climate & Comfort',
    color: 'from-rose-500 to-pink-500',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50'
  },
  {
    id: 'kitchen',
    name: 'Food & Kitchen',
    color: 'from-amber-500 to-orange-500',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50'
  },
  {
    id: 'hygiene',
    name: 'Hygiene & Daily Care',
    color: 'from-emerald-500 to-teal-500',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50'
  },
  {
    id: 'safety',
    name: 'Safety & Security',
    color: 'from-blue-500 to-indigo-500',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50'
  },
  {
    id: 'wfh',
    name: 'Work from Home & Media',
    color: 'from-indigo-500 to-purple-500',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50'
  },
  {
    id: 'leisure',
    name: 'Parking & Fitness',
    color: 'from-purple-500 to-pink-500',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/50'
  }
];

export const AMENITIES_DATA = [
  // Comfort & Climate
  {
    id: 'WiFi',
    name: 'WiFi',
    label: 'High-Speed WiFi',
    category: 'comfort',
    icon: Wifi,
    description: '100+ Mbps high-speed fiber internet for work & streaming'
  },
  {
    id: 'AC',
    name: 'AC',
    label: 'Air Conditioner',
    category: 'comfort',
    icon: Snowflake,
    description: 'Energy-efficient inverter split AC in room'
  },
  {
    id: 'Power Backup',
    name: 'Power Backup',
    label: '100% Power Backup',
    category: 'comfort',
    icon: Zap,
    description: 'Automatic DG / Inverter backup for 24/7 light, fans & WiFi'
  },
  {
    id: 'Geyser',
    name: 'Geyser',
    label: 'Hot Water Geyser',
    category: 'comfort',
    icon: Flame,
    description: '24/7 instant hot water in bathroom'
  },
  {
    id: 'Attached Bathroom',
    name: 'Attached Bathroom',
    label: 'Attached Bathroom',
    category: 'comfort',
    icon: Bath,
    description: 'Private en-suite sanitized bathroom with modern fixtures'
  },
  {
    id: 'Balcony',
    name: 'Balcony',
    label: 'Private Balcony',
    category: 'comfort',
    icon: Sun,
    description: 'Well-ventilated personal balcony with airy open view'
  },

  // Food & Kitchen
  {
    id: 'Meals',
    name: 'Meals',
    label: '3 Times Meals',
    category: 'kitchen',
    icon: Utensils,
    description: 'Hygienic, home-style breakfast, lunch & dinner included'
  },
  {
    id: 'RO Water',
    name: 'RO Water',
    label: 'RO Purified Water',
    category: 'kitchen',
    icon: Droplets,
    description: 'Multi-stage RO + UV mineral drinking water dispenser'
  },
  {
    id: 'Fridge',
    name: 'Fridge',
    label: 'Refrigerator',
    category: 'kitchen',
    icon: CookingPot,
    description: 'Frost-free refrigerator for groceries, milk & chilled water'
  },
  {
    id: 'Microwave',
    name: 'Microwave',
    label: 'Microwave Oven',
    category: 'kitchen',
    icon: Flame,
    description: 'Convection microwave available for quick heating & baking'
  },
  {
    id: 'Modular Kitchen',
    name: 'Modular Kitchen',
    label: 'Equipped Kitchen',
    category: 'kitchen',
    icon: CookingPot,
    description: 'Modular kitchen with gas stove/induction and cooking utensils'
  },

  // Hygiene & Daily Care
  {
    id: 'Laundry',
    name: 'Laundry',
    label: 'Washing Machine',
    category: 'hygiene',
    icon: Shirt,
    description: 'Fully automatic washing machine and covered clothes drying area'
  },
  {
    id: 'Housekeeping',
    name: 'Housekeeping',
    label: 'Daily Housekeeping',
    category: 'hygiene',
    icon: Sparkles,
    description: 'Daily room dusting, floor mopping & washroom deep cleaning'
  },
  {
    id: 'Wardrobe',
    name: 'Wardrobe',
    label: 'Spacious Wardrobe',
    category: 'hygiene',
    icon: Archive,
    description: 'Full-length personal wooden almirah / wardrobe with lock'
  },
  {
    id: 'Lift',
    name: 'Lift',
    label: 'Elevator / Lift',
    category: 'hygiene',
    icon: Building,
    description: 'High-speed automatic passenger lift with ARD power backup'
  },

  // Safety & Security
  {
    id: 'CCTV',
    name: 'CCTV',
    label: '24x7 CCTV Surveillance',
    category: 'safety',
    icon: Video,
    description: 'Round-the-clock HD cameras covering corridors, gates & entries'
  },
  {
    id: 'Security Guard',
    name: 'Security Guard',
    label: '24/7 Security Guard',
    category: 'safety',
    icon: ShieldCheck,
    description: 'Uniformed security personnel, visitor registry & gate check'
  },
  {
    id: 'Biometric Lock',
    name: 'Biometric Lock',
    label: 'Smart Digital Lock',
    category: 'safety',
    icon: Fingerprint,
    description: 'Biometric fingerprint or PIN keypad access control for main door'
  },
  {
    id: 'Fire Safety',
    name: 'Fire Safety',
    label: 'Fire Safety System',
    category: 'safety',
    icon: ShieldAlert,
    description: 'Fire extinguishers, smoke detectors and emergency fire escape'
  },

  // Work from Home & Media
  {
    id: 'Work Desk',
    name: 'Work Desk',
    label: 'Ergonomic Work Desk',
    category: 'wfh',
    icon: Laptop,
    description: 'Dedicated study desk, ergonomic chair and surge-protected plugs'
  },
  {
    id: 'TV',
    name: 'TV',
    label: 'Smart TV',
    category: 'wfh',
    icon: Tv,
    description: '43-inch Smart LED TV with OTT apps (Netflix, Prime, Hotstar)'
  },
  {
    id: 'EV Charging',
    name: 'EV Charging',
    label: 'EV Charging Point',
    category: 'wfh',
    icon: BatteryCharging,
    description: 'Dedicated charging socket for electric bikes, scooters or cars'
  },

  // Parking & Fitness
  {
    id: 'Parking',
    name: 'Parking',
    label: 'Reserved Parking',
    category: 'leisure',
    icon: Car,
    description: 'Covered and secure parking space for 2-wheelers and cars'
  },
  {
    id: 'Gym',
    name: 'Gym',
    label: 'Gym & Fitness Center',
    category: 'leisure',
    icon: Dumbbell,
    description: 'Equipped in-house fitness zone with treadmill, weights & dumbbells'
  },
  {
    id: 'Swimming Pool',
    name: 'Swimming Pool',
    label: 'Swimming Pool',
    category: 'leisure',
    icon: Waves,
    description: 'Maintained residential swimming pool with sun loungers'
  },
  {
    id: 'Clubhouse',
    name: 'Clubhouse',
    label: 'Clubhouse & Games',
    category: 'leisure',
    icon: Gamepad2,
    description: 'Indoor recreation room with Table Tennis, pool table & chill lounge'
  }
];

export const ALL_AMENITY_NAMES = AMENITIES_DATA.map(a => a.name);

// Fast map lookup
const AMENITY_MAP = new Map(AMENITIES_DATA.map(a => [a.name.toLowerCase(), a]));

export function getAmenityInfo(name) {
  if (!name) return null;
  const match = AMENITY_MAP.get(name.trim().toLowerCase());
  if (match) return match;
  return {
    id: name,
    name: name,
    label: name,
    category: 'comfort',
    icon: Check,
    description: `${name} facility available at the property`
  };
}

export function AmenityBadge({ name, showIcon = true, className = '' }) {
  const info = getAmenityInfo(name);
  const IconComponent = info.icon || Check;

  return (
    <span
      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors ${className}`}
      title={info.description}
    >
      {showIcon && <IconComponent className="w-3.5 h-3.5 shrink-0" />}
      <span>{info.label || name}</span>
    </span>
  );
}

