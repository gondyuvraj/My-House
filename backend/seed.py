import asyncio
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import random
from app.config import settings
from app.utils.security import get_password_hash

# Real coordinates for areas across the 6 major Indian cities
CITY_AREAS = {
    "Pune": [
        {"area": "Baner", "lat": 18.5590, "lng": 73.7868, "metro": "Baner Metro", "hub": "Balewadi High Street"},
        {"area": "Hinjawadi", "lat": 18.5913, "lng": 73.7389, "metro": "Hinjawadi Phase 1", "hub": "Rajiv Gandhi Infotech Park"},
        {"area": "Kothrud", "lat": 18.5074, "lng": 73.8077, "metro": "Vanaz Metro", "hub": "MIT World Peace University"},
        {"area": "Viman Nagar", "lat": 18.5679, "lng": 73.9143, "metro": "Ramwadi Metro", "hub": "Phoenix Marketcity"},
        {"area": "Koregaon Park", "lat": 18.5362, "lng": 73.8940, "metro": "Ruby Hall Clinic Metro", "hub": "North Main Road"},
        {"area": "Wakad", "lat": 18.5987, "lng": 73.7686, "metro": "Wakad Bridge", "hub": "Xion Mall"}
    ],
    "Mumbai": [
        {"area": "Bandra West", "lat": 19.0596, "lng": 72.8295, "metro": "Bandra Station", "hub": "Linking Road & Pali Hill"},
        {"area": "Andheri East", "lat": 19.1136, "lng": 72.8697, "metro": "Western Express Highway Metro", "hub": "SEEPZ & MIDC"},
        {"area": "Powai", "lat": 19.1176, "lng": 72.9060, "metro": "Kanjurmarg Station", "hub": "Hiranandani Business Park & IITB"},
        {"area": "Juhu", "lat": 19.1075, "lng": 72.8263, "metro": "DN Nagar Metro", "hub": "NMIMS & Juhu Circle"},
        {"area": "Thane West", "lat": 19.2183, "lng": 72.9781, "metro": "Thane Station", "hub": "Viviana Mall & Majiwada"},
        {"area": "Worli", "lat": 19.0178, "lng": 72.8178, "metro": "Lower Parel Monorail", "hub": "One World Center"}
    ],
    "Bengaluru": [
        {"area": "Koramangala", "lat": 12.9352, "lng": 77.6245, "metro": "Sony World Signal", "hub": "Forum Mall & 80 Feet Road"},
        {"area": "Indiranagar", "lat": 12.9784, "lng": 77.6408, "metro": "Indiranagar 100ft Road Metro", "hub": "12th Main Food Street"},
        {"area": "HSR Layout", "lat": 12.9121, "lng": 77.6446, "metro": "Bommanahalli Metro", "hub": "Sector 1 Startup Hub"},
        {"area": "Whitefield", "lat": 12.9698, "lng": 77.7499, "metro": "Kadugodi Metro", "hub": "ITPB & Prestige Shantiniketan"},
        {"area": "Bellandur", "lat": 12.9304, "lng": 77.6784, "metro": "Marathahalli Bridge", "hub": "EcoSpace & RMZ Ecoworld"},
        {"area": "Electronic City", "lat": 12.8399, "lng": 77.6770, "metro": "Infosys Foundation Metro", "hub": "Wipro Campus & E-City Phase 1"}
    ],
    "Delhi": [
        {"area": "Hauz Khas", "lat": 28.5494, "lng": 77.2001, "metro": "Hauz Khas Metro (Yellow/Magenta)", "hub": "IIT Delhi & HKV"},
        {"area": "Saket", "lat": 28.5244, "lng": 77.2104, "metro": "Saket Metro", "hub": "Select Citywalk & District Centre"},
        {"area": "Lajpat Nagar", "lat": 28.5677, "lng": 77.2433, "metro": "Lajpat Nagar Interchange", "hub": "Central Market & Defense Colony"},
        {"area": "Karol Bagh", "lat": 28.6517, "lng": 77.1906, "metro": "Karol Bagh Metro", "hub": "Ganga Ram Hospital & Coaching Hub"},
        {"area": "Connaught Place", "lat": 28.6304, "lng": 77.2177, "metro": "Rajiv Chowk Metro", "hub": "Inner Circle & Barakhamba Road"},
        {"area": "Dwarka", "lat": 28.5921, "lng": 77.0460, "metro": "Dwarka Sector 21 Metro", "hub": "Vegas Mall & Pacific D21"}
    ],
    "Hyderabad": [
        {"area": "HITEC City", "lat": 17.4474, "lng": 78.3762, "metro": "HITEC City Metro", "hub": "Cyber Towers & Mindspace"},
        {"area": "Gachibowli", "lat": 17.4401, "lng": 78.3489, "metro": "Raidurg Metro", "hub": "Financial District & DLF Cybercity"},
        {"area": "Madhapur", "lat": 17.4483, "lng": 78.3915, "metro": "Madhapur Metro", "hub": "Inorbit Mall & Avasa"},
        {"area": "Jubilee Hills", "lat": 17.4319, "lng": 78.4073, "metro": "Jubilee Hills Check Post", "hub": "Road No. 36 & 45"},
        {"area": "Kondapur", "lat": 17.4699, "lng": 78.3578, "metro": "Miyapur Metro", "hub": "Botanical Garden Road"},
        {"area": "Banjara Hills", "lat": 17.4156, "lng": 78.4357, "metro": "Irrum Manzil Metro", "hub": "City Center & Road No. 1"}
    ],
    "Chennai": [
        {"area": "Adyar", "lat": 13.0012, "lng": 80.2565, "metro": "Kasturba Nagar MRTS", "hub": "IIT Madras & Gandhi Nagar"},
        {"area": "T Nagar", "lat": 13.0418, "lng": 80.2341, "metro": "Nandanam Metro", "hub": "Pondy Bazaar & Panagal Park"},
        {"area": "Velachery", "lat": 12.9815, "lng": 80.2180, "metro": "Velachery MRTS", "hub": "Phoenix Marketcity Chennai"},
        {"area": "OMR (Old Mahabalipuram Rd)", "lat": 12.9344, "lng": 80.2312, "metro": "Tidel Park MRTS", "hub": "Ascendas IT Park & SRP Tools"},
        {"area": "Anna Nagar", "lat": 13.0850, "lng": 80.2101, "metro": "Anna Nagar Tower Metro", "hub": "2nd Avenue & VR Chennai"},
        {"area": "Thiruvanmiyur", "lat": 12.9830, "lng": 80.2594, "metro": "Thiruvanmiyur MRTS", "hub": "East Coast Road & Beach"}
    ],
    "Kolkata": [
        {"area": "Salt Lake Sector V", "lat": 22.5804, "lng": 88.4378, "metro": "Salt Lake Sector V Metro", "hub": "Technopolis & DLF IT Park"},
        {"area": "New Town", "lat": 22.5958, "lng": 88.4796, "metro": "New Town Metro", "hub": "Eco Space & City Centre 2"},
        {"area": "Park Street", "lat": 22.5516, "lng": 88.3524, "metro": "Park Street Metro", "hub": "St. Xavier's & Allen Park"},
        {"area": "Ballygunge", "lat": 22.5280, "lng": 88.3650, "metro": "Ballygunge Station", "hub": "Gariahat & South City Mall"}
    ],
    "Jaipur": [
        {"area": "Malviya Nagar", "lat": 26.8532, "lng": 75.8055, "metro": "Malviya Nagar Junction", "hub": "World Trade Park (WTP) & Gaurav Tower"},
        {"area": "Mansarovar", "lat": 26.8568, "lng": 75.7663, "metro": "Mansarovar Metro", "hub": "City Park & B2 Bypass"},
        {"area": "Vaishali Nagar", "lat": 26.9113, "lng": 75.7433, "metro": "Civil Lines Metro", "hub": "National Handloom & Amrapali Circle"},
        {"area": "C-Scheme", "lat": 26.9080, "lng": 75.8016, "metro": "Chandpole Metro", "hub": "Statue Circle & Ashok Nagar"}
    ],
    "Kochi": [
        {"area": "Kakkanad Infopark", "lat": 10.0159, "lng": 76.3419, "metro": "Kakkanad Water Metro", "hub": "Infopark & SmartCity Kochi"},
        {"area": "Marine Drive", "lat": 9.9790, "lng": 76.2755, "metro": "Maharajas Metro", "hub": "Rainbow Bridge & High Court"},
        {"area": "Edappally", "lat": 10.0236, "lng": 76.3116, "metro": "Edappally Metro", "hub": "LuLu International Mall"},
        {"area": "Palarivattom", "lat": 10.0051, "lng": 76.3075, "metro": "Palarivattom Metro", "hub": "Pipeline Junction & Medical Centre"}
    ],
    "Ahmedabad": [
        {"area": "SG Highway", "lat": 23.0338, "lng": 72.5100, "metro": "Thaltej Metro", "hub": "ISCON Mega Mall & Palladium"},
        {"area": "Prahlad Nagar", "lat": 23.0125, "lng": 72.5085, "metro": "Anand Nagar Bus Terminal", "hub": "Corporate Road & Garden"},
        {"area": "Bodakdev", "lat": 23.0375, "lng": 72.5250, "metro": "Doordarshan Metro", "hub": "Judges Bungalow Road"}
    ],
    "Chandigarh": [
        {"area": "Sector 17", "lat": 30.7410, "lng": 76.7850, "metro": "ISBT Sector 17", "hub": "Sector 17 Plaza & Neelam Theatre"},
        {"area": "Sector 35", "lat": 30.7250, "lng": 76.7680, "metro": "Sector 35 Food Street", "hub": "JW Marriott & Aroma Junction"},
        {"area": "Mohali Phase 7", "lat": 30.7046, "lng": 76.7179, "metro": "Mohali Stadium Station", "hub": "PCA Stadium & Phase 7 Market"}
    ],
    "Indore": [
        {"area": "Vijay Nagar", "lat": 22.7533, "lng": 75.8937, "metro": "Vijay Nagar Square Metro", "hub": "C21 Mall & Malhar Mega Mall"},
        {"area": "Palasia", "lat": 22.7244, "lng": 75.8839, "metro": "Palasia Square", "hub": "56 Dukan & Industry House"},
        {"area": "Super Corridor", "lat": 22.7758, "lng": 75.8236, "metro": "TCS Square Metro", "hub": "Infosys & TCS SEZ Campus"}
    ],
    "Lucknow": [
        {"area": "Gomti Nagar", "lat": 26.8524, "lng": 81.0006, "metro": "Vibhuti Khand Metro", "hub": "One Awadh Center & Wave Mall"},
        {"area": "Hazratganj", "lat": 26.8489, "lng": 80.9452, "metro": "Hazratganj Metro", "hub": "Ganj Market & Janpath"},
        {"area": "Aliganj", "lat": 26.8920, "lng": 80.9460, "metro": "IT Chauraha Metro", "hub": "Kapoorthala & Sahara Ganj"}
    ]
}

ROOM_IMAGES = [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=1200&auto=format&fit=crop&q=80"
]

ALL_AMENITIES = [
    "WiFi", "AC", "Power Backup", "Geyser", "Attached Bathroom", "Balcony",
    "Meals", "RO Water", "Fridge", "Microwave", "Modular Kitchen",
    "Laundry", "Housekeeping", "Wardrobe", "Lift",
    "CCTV", "Security Guard", "Biometric Lock", "Fire Safety",
    "Work Desk", "TV", "EV Charging",
    "Parking", "Gym", "Swimming Pool", "Clubhouse"
]

HOUSE_RULES = [
    "No loud music after 10 PM",
    "Keep common areas clean",
    "Guests allowed with prior notice",
    "No smoking inside bedrooms",
    "Lock main gate after 11 PM"
]

FIRST_NAMES = [
    "Aarav", "Priya", "Rahul", "Ananya", "Rohan", "Sneha", "Vikram", "Tanvi",
    "Aditya", "Neha", "Kunal", "Pooja", "Arjun", "Divya", "Siddharth", "Meera",
    "Varun", "Isha", "Nikhil", "Shreya", "Gaurav", "Rhea", "Manish", "Kavya",
    "Suresh", "Swati", "Harsh", "Deepika", "Amit", "Ritu"
]

LAST_NAMES = [
    "Sharma", "Verma", "Patel", "Kulkarni", "Deshmukh", "Reddy", "Nair", "Joshi",
    "Mehta", "Gupta", "Rao", "Iyer", "Chopra", "Bose", "Menon", "Malhotra",
    "Kapoor", "Chatterjee", "Singh", "Pandey"
]

OCCUPATIONS = [
    "Software Engineer", "Frontend Developer", "Product Manager",
    "Data Scientist", "UI/UX Designer", "Marketing Specialist",
    "MBA Student", "Financial Analyst", "Architect", "Consultant"
]

async def seed_database():
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.DB_NAME]
    print(f"Connecting to MongoDB {settings.MONGO_URI} [{settings.DB_NAME}]...")

    # Drop old collections for a fresh, squeaky-clean seed
    print("Dropping existing collections to ensure clean data...")
    collections = await db.list_collection_names()
    for col in collections:
        if not col.startswith("system."):
            await db[col].drop()

    now = datetime.now(timezone.utc)

    # 1. Create Admin Account
    print("Creating administrator account...")
    admin_id = (await db.users.insert_one({
        "email": "admin@myhouse.com",
        "hashed_password": get_password_hash("Admin@12345"),
        "full_name": "Admin Moderator",
        "phone": "+91 98765 00001",
        "role": "admin",
        "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=admin-myhouse",
        "age": 30,
        "gender": "other",
        "occupation": "Platform Administrator",
        "city": "Pune",
        "bio": "Official administrator account for My House community moderation.",
        "languages": ["English", "Hindi", "Marathi"],
        "budget_min": 10000,
        "budget_max": 50000,
        "lifestyle": {
            "smoking": "never", "drinking": "never", "food_preference": "any",
            "sleep_schedule": "flexible", "cleanliness": 5, "guests_allowed": True,
            "pets_allowed": True, "noise_level": "quiet", "work_from_home": True
        },
        "is_email_verified": True,
        "is_phone_verified": True,
        "is_blocked": False,
        "created_at": now - timedelta(days=60),
        "updated_at": now
    })).inserted_id

    # 2. Create Demo Lister & Seeker accounts
    print("Creating demo Lister and Seeker accounts...")
    lister_id = (await db.users.insert_one({
        "email": "owner@myhouse.com",
        "hashed_password": get_password_hash("Owner@12345"),
        "full_name": "Rajesh Singhania",
        "phone": "+91 98220 11223",
        "role": "owner",
        "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=RajeshSinghania",
        "age": 34,
        "gender": "male",
        "occupation": "Property Manager & Architect",
        "city": "Pune",
        "bio": "Managing premium student & working professional accommodations in Baner and Hinjawadi for over 6 years.",
        "languages": ["English", "Hindi", "Marathi"],
        "budget_min": 15000,
        "budget_max": 40000,
        "lifestyle": {
            "smoking": "never", "drinking": "occasionally", "food_preference": "veg",
            "sleep_schedule": "early_bird", "cleanliness": 5, "guests_allowed": True,
            "pets_allowed": False, "noise_level": "quiet", "work_from_home": False
        },
        "is_email_verified": True,
        "is_phone_verified": True,
        "is_blocked": False,
        "created_at": now - timedelta(days=45),
        "updated_at": now
    })).inserted_id

    seeker_id = (await db.users.insert_one({
        "email": "seeker@myhouse.com",
        "hashed_password": get_password_hash("Seeker@12345"),
        "full_name": "Aanya Sharma",
        "phone": "+91 97654 33221",
        "role": "seeker",
        "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=AanyaSharma",
        "age": 23,
        "gender": "female",
        "occupation": "Associate Software Engineer",
        "city": "Pune",
        "bio": "Relocating from Jaipur to Pune for my tech job. Looking for a clean, peaceful PG or friendly flatmate in Baner/Kothrud.",
        "languages": ["English", "Hindi"],
        "budget_min": 8000,
        "budget_max": 20000,
        "lifestyle": {
            "smoking": "never", "drinking": "never", "food_preference": "veg",
            "sleep_schedule": "early_bird", "cleanliness": 5, "guests_allowed": True,
            "pets_allowed": False, "noise_level": "quiet", "work_from_home": True
        },
        "is_email_verified": True,
        "is_phone_verified": True,
        "is_blocked": False,
        "created_at": now - timedelta(days=30),
        "updated_at": now
    })).inserted_id

    # 3. Create 30 Diverse Users
    print("Generating 30 realistic demo user profiles...")
    user_docs = []
    cities_list = list(CITY_AREAS.keys())

    for i in range(30):
        first = FIRST_NAMES[i]
        last = LAST_NAMES[i % len(LAST_NAMES)]
        full_name = f"{first} {last}"
        gender = "female" if i % 2 == 1 else "male"
        city = cities_list[i % len(cities_list)]
        user_email = f"{first.lower()}.{last.lower()}{i+1}@example.com"
        age = random.randint(21, 32)
        occupation = OCCUPATIONS[i % len(OCCUPATIONS)]
        
        lifestyle = {
            "smoking": random.choice(["never", "never", "never", "occasionally"]),
            "drinking": random.choice(["never", "occasionally", "occasionally", "regular"]),
            "food_preference": random.choice(["veg", "non-veg", "veg", "any"]),
            "sleep_schedule": random.choice(["early_bird", "night_owl", "flexible"]),
            "cleanliness": random.choice([3, 4, 4, 5, 5]),
            "guests_allowed": random.choice([True, True, False]),
            "pets_allowed": random.choice([False, False, True]),
            "noise_level": random.choice(["quiet", "moderate", "moderate"]),
            "work_from_home": random.choice([True, False])
        }

        user_doc = {
            "email": user_email,
            "hashed_password": get_password_hash("DemoPass@123"),
            "full_name": full_name,
            "phone": f"+91 9{random.randint(100000000, 999999999)}",
            "role": random.choice(["seeker", "owner", "seeker", "seeker"]),
            "avatar_url": f"https://api.dicebear.com/7.x/avataaars/svg?seed={full_name.replace(' ', '')}",
            "age": age,
            "gender": gender,
            "occupation": occupation,
            "city": city,
            "bio": f"Hi! I'm {first}, a {occupation.lower()} based in {city}. Looking for like-minded, respectful people.",
            "languages": random.sample(["English", "Hindi", "Marathi", "Kannada", "Tamil", "Telugu"], k=random.randint(2, 3)),
            "budget_min": random.choice([6000, 8000, 10000]),
            "budget_max": random.choice([15000, 22000, 28000, 35000]),
            "lifestyle": lifestyle,
            "is_email_verified": True,
            "is_phone_verified": random.choice([True, True, False]),
            "is_blocked": False,
            "created_at": now - timedelta(days=random.randint(10, 50)),
            "updated_at": now
        }
        user_docs.append(user_doc)

    res_users = await db.users.insert_many(user_docs)
    created_user_ids = res_users.inserted_ids
    all_users = [
        {"_id": admin_id, "full_name": "Admin Moderator", "role": "admin", "is_phone_verified": True},
        {"_id": lister_id, "full_name": "Rajesh Singhania", "role": "owner", "is_phone_verified": True},
        {"_id": seeker_id, "full_name": "Aanya Sharma", "role": "seeker", "is_phone_verified": True}
    ] + [{"_id": uid, **udoc} for uid, udoc in zip(created_user_ids, user_docs)]

    # 4. Create 60 Diverse Listings across the 6 cities (10 per city)
    print("Generating 60 rich listings with coordinates, photos, amenities...")
    listing_docs = []
    types_pool = ["PG", "PG", "Room", "1RK", "1BHK", "2BHK", "3BHK", "4BHK", "Shared room"]
    furnishings_pool = ["semi-furnished", "fully-furnished", "fully-furnished", "unfurnished"]

    listing_count = 0
    for city_name, areas in CITY_AREAS.items():
        # 10 listings per city
        for j in range(10):
            area_info = areas[j % len(areas)]
            owner = random.choice(all_users)
            l_type = types_pool[j % len(types_pool)]
            furnishing = furnishings_pool[j % len(furnishings_pool)]
            
            # Base rents according to city & type
            city_multiplier = 1.3 if city_name in ["Mumbai", "Bengaluru"] else 1.0
            type_base = {"PG": 8500, "Room": 9500, "1RK": 12000, "1BHK": 16000, "2BHK": 26000, "3BHK": 38000, "4BHK": 55000, "Shared room": 6500}[l_type]
            rent = int((type_base * city_multiplier) + random.randint(-1500, 3000))
            deposit = rent * random.choice([2, 3])
            maintenance = random.choice([0, 500, 1000, 1500])

            selected_amenities = random.sample(ALL_AMENITIES, k=random.randint(6, 12))
            # Pick 3-5 images for gallery
            images = random.sample(ROOM_IMAGES, k=random.randint(3, 5))

            # Small jitter to lat/lng so markers don't overlap exactly
            lat_jitter = area_info["lat"] + (random.uniform(-0.008, 0.008))
            lng_jitter = area_info["lng"] + (random.uniform(-0.008, 0.008))

            title = f"Spacious {furnishing.title()} {l_type} near {area_info['area']} Hub"
            if l_type == "PG":
                title = f"Comfortable Luxury PG for Professionals - {area_info['area']}"

            description = (
                f"Well-maintained {furnishing.lower()} {l_type.lower()} located in the heart of {area_info['area']}, {city_name}. "
                f"Close proximity to {area_info['metro']} and {area_info['hub']}. High-speed Wi-Fi, daily housekeeping, "
                f"24/7 power backup, and modern security surveillance. Ideal for working professionals and students."
            )

            views = random.randint(35, 420)
            inquiries = random.randint(3, 28)
            favorites = random.randint(2, 35)
            rating = round(random.uniform(4.2, 5.0), 1)

            listing_doc = {
                "owner_id": str(owner["_id"]),
                "owner_name": owner.get("full_name", "Host"),
                "owner_avatar": owner.get("avatar_url", f"https://api.dicebear.com/7.x/avataaars/svg?seed={owner['_id']}"),
                "owner_phone": owner.get("phone", "+91 98220 00000"),
                "owner_verified": bool(owner.get("is_phone_verified", True)),
                "title": title,
                "description": description,
                "type": l_type,
                "gender_preference": random.choice(["any", "any", "male", "female"]),
                "rent": rent,
                "deposit": deposit,
                "maintenance": maintenance,
                "available_from": "Immediate" if j % 3 == 0 else (now + timedelta(days=j*3)).strftime("%Y-%m-%d"),
                "city": city_name,
                "area": area_info["area"],
                "full_address": f"Flat {random.randint(101, 804)}, Green Horizon Heights, Near {area_info['hub']}, {area_info['area']}, {city_name}",
                "location": {
                    "type": "Point",
                    "coordinates": [round(lng_jitter, 5), round(lat_jitter, 5)] # [lng, lat]
                },
                "furnishing": furnishing,
                "amenities": selected_amenities,
                "house_rules": HOUSE_RULES,
                "nearby_places": [area_info["metro"], area_info["hub"], f"{city_name} Central Station", "Apollo Clinic"],
                "contact_preference": random.choice(["both", "chat", "both"]),
                "images": images,
                "status": "active",
                "views_count": views,
                "favorites_count": favorites,
                "inquiries_count": inquiries,
                "avg_rating": rating,
                "reviews_count": random.randint(2, 9),
                "created_at": now - timedelta(days=random.randint(3, 30)),
                "updated_at": now
            }
            listing_docs.append(listing_doc)
            listing_count += 1

    res_listings = await db.listings.insert_many(listing_docs)
    created_listing_ids = res_listings.inserted_ids
    print(f"Inserted {len(created_listing_ids)} listings across 6 cities.")

    # 5. Create Roommate Posts (20 posts)
    print("Generating roommate requirement and flatmate posts...")
    roommate_docs = []
    for k in range(20):
        u = random.choice(all_users)
        city_k = u.get("city", "Pune")
        areas = CITY_AREAS.get(city_k, CITY_AREAS["Pune"])
        area_choice = random.choice(areas)["area"]
        post_type = "need_roommate" if k % 2 == 0 else "looking_for_room"

        approx_rent = random.choice([7500, 9000, 11000, 14000, 18000])
        r_title = f"Looking for chill flatmate in {area_choice}, {city_k}" if post_type == "need_roommate" else f"Seeking shared room / 2BHK flatmate in {city_k}"

        roommate_doc = {
            "post_type": post_type,
            "title": r_title,
            "description": f"Hey! I'm looking for a responsible roommate. I work as a {u.get('occupation')} in {city_k}. Prefer someone who is neat and respects personal space.",
            "city": city_k,
            "preferred_areas": [area_choice, random.choice(areas)["area"]],
            "approx_rent": approx_rent,
            "approx_deposit": approx_rent * 2,
            "available_from": "Immediate",
            "gender_preference": random.choice(["any", "male", "female"]),
            "furnishing": random.choice(["semi-furnished", "fully-furnished"]),
            "amenities": random.sample(ALL_AMENITIES, k=5),
            "images": random.sample(ROOM_IMAGES, k=2),
            "lifestyle": u.get("lifestyle", {}),
            "user_id": str(u["_id"]),
            "user_name": u.get("full_name", "User"),
            "user_avatar": u.get("avatar_url"),
            "user_age": u.get("age", 24),
            "user_gender": u.get("gender", "other"),
            "user_occupation": u.get("occupation", "working"),
            "user_verified": bool(u.get("is_phone_verified", True)),
            "status": "active",
            "created_at": now - timedelta(days=random.randint(1, 20)),
            "updated_at": now
        }
        roommate_docs.append(roommate_doc)

    await db.roommate_posts.insert_many(roommate_docs)

    # 6. Create Reviews for Listings
    print("Generating demo reviews...")
    review_comments = [
        "The place is super well-maintained and matches the photos 100%. Owner is very cooperative!",
        "Excellent location, right next to the metro and supermarket. High-speed WiFi works great for WFH.",
        "Peaceful society with tight 24/7 security. The maid service is punctual and rooms are airy.",
        "Great value for money in this area. Clean washrooms and reliable power backup.",
        "Very smooth move-in process. Rajesh was very transparent about the deposit and utilities."
    ]
    review_docs = []
    for l_id in created_listing_ids[:15]:
        for _ in range(random.randint(1, 3)):
            rev_user = random.choice(all_users)
            review_docs.append({
                "target_id": str(l_id),
                "target_type": "listing",
                "author_id": str(rev_user["_id"]),
                "author_name": rev_user.get("full_name", "Resident"),
                "author_avatar": rev_user.get("avatar_url"),
                "rating": random.choice([4, 5, 5]),
                "comment": random.choice(review_comments),
                "created_at": now - timedelta(days=random.randint(2, 25))
            })
    await db.reviews.insert_many(review_docs)

    # 7. Create Demo Visit Requests
    print("Generating sample visit requests...")
    sample_listing = await db.listings.find_one({"owner_id": str(lister_id)})
    if not sample_listing:
        sample_listing = await db.listings.find_one({})

    visit_reqs = [
        {
            "listing_id": str(sample_listing["_id"]),
            "listing_title": sample_listing.get("title"),
            "listing_image": sample_listing.get("images", [None])[0],
            "listing_city": sample_listing.get("city"),
            "listing_area": sample_listing.get("area"),
            "seeker_id": str(seeker_id),
            "seeker_name": "Aanya Sharma",
            "seeker_phone": "+91 97654 33221",
            "owner_id": str(sample_listing.get("owner_id")),
            "owner_name": sample_listing.get("owner_name"),
            "visit_date": (now + timedelta(days=2)).strftime("%Y-%m-%d"),
            "visit_time_slot": "11:00 AM - 12:00 PM",
            "notes": "Looking to inspect the room and verify the WiFi speed. Excited to visit!",
            "status": "pending",
            "created_at": now - timedelta(hours=5),
            "updated_at": now - timedelta(hours=5)
        },
        {
            "listing_id": str(created_listing_ids[1]),
            "listing_title": "Luxury Studio near Baner Hub",
            "listing_image": ROOM_IMAGES[0],
            "listing_city": "Pune",
            "listing_area": "Baner",
            "seeker_id": str(seeker_id),
            "seeker_name": "Aanya Sharma",
            "seeker_phone": "+91 97654 33221",
            "owner_id": str(lister_id),
            "owner_name": "Rajesh Singhania",
            "visit_date": (now - timedelta(days=1)).strftime("%Y-%m-%d"),
            "visit_time_slot": "04:00 PM - 05:00 PM",
            "notes": "Completed visit. Place was great!",
            "status": "accepted",
            "created_at": now - timedelta(days=3),
            "updated_at": now - timedelta(days=1)
        }
    ]
    await db.visit_requests.insert_many(visit_reqs)

    # 8. Create Demo Chat Messages between Seeker and Lister
    print("Creating sample conversation and chat history...")
    conv_id = f"{str(lister_id)}_{str(seeker_id)}" if str(lister_id) < str(seeker_id) else f"{str(seeker_id)}_{str(lister_id)}"
    await db.conversations.insert_one({
        "conversation_id": conv_id,
        "participants": [str(seeker_id), str(lister_id)],
        "last_message": "Yes, visits are open this Saturday from 11 AM onwards! Feel free to book a slot.",
        "last_message_at": now - timedelta(minutes=15),
        "unread_" + str(seeker_id): 1,
        "unread_" + str(lister_id): 0,
        "updated_at": now - timedelta(minutes=15)
    })

    chat_messages = [
        {
            "conversation_id": conv_id,
            "sender_id": str(seeker_id),
            "sender_name": "Aanya Sharma",
            "sender_avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=AanyaSharma",
            "receiver_id": str(lister_id),
            "content": "Hi Rajesh ji! I saw your PG listing in Baner. Is the attached bathroom room still available?",
            "media_url": None,
            "is_read": True,
            "created_at": now - timedelta(hours=2)
        },
        {
            "conversation_id": conv_id,
            "sender_id": str(lister_id),
            "sender_name": "Rajesh Singhania",
            "sender_avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=RajeshSinghania",
            "receiver_id": str(seeker_id),
            "content": "Hello Aanya! Yes, one room with an attached balcony and washroom is available for immediate move-in.",
            "media_url": None,
            "is_read": True,
            "created_at": now - timedelta(hours=1, minutes=45)
        },
        {
            "conversation_id": conv_id,
            "sender_id": str(seeker_id),
            "sender_name": "Aanya Sharma",
            "sender_avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=AanyaSharma",
            "receiver_id": str(lister_id),
            "content": "Awesome! Can I visit this weekend to see the place in person?",
            "media_url": None,
            "is_read": True,
            "created_at": now - timedelta(minutes=30)
        },
        {
            "conversation_id": conv_id,
            "sender_id": str(lister_id),
            "sender_name": "Rajesh Singhania",
            "sender_avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=RajeshSinghania",
            "receiver_id": str(seeker_id),
            "content": "Yes, visits are open this Saturday from 11 AM onwards! Feel free to book a slot.",
            "media_url": None,
            "is_read": False,
            "created_at": now - timedelta(minutes=15)
        }
    ]
    await db.messages.insert_many(chat_messages)

    # 9. Create Notifications
    print("Generating demo notifications...")
    notifications = [
        {
            "user_id": str(seeker_id),
            "type": "message",
            "title": "New message from Rajesh Singhania",
            "message": "Yes, visits are open this Saturday from 11 AM onwards! Feel free to book a slot.",
            "link": f"/chat?with={lister_id}",
            "read": False,
            "created_at": now - timedelta(minutes=15)
        },
        {
            "user_id": str(seeker_id),
            "type": "match",
            "title": "94% Roommate Match in Baner!",
            "message": "Sneha Kulkarni is looking for a female roommate matching your habits.",
            "link": "/roommates",
            "read": False,
            "created_at": now - timedelta(hours=4)
        },
        {
            "user_id": str(lister_id),
            "type": "visit_request",
            "title": "New Visit Request Received",
            "message": "Aanya Sharma requested a visit for Saturday 11:00 AM.",
            "link": "/dashboard/lister",
            "read": False,
            "created_at": now - timedelta(hours=5)
        }
    ]
    await db.notifications.insert_many(notifications)

    # 10. Create Sample Reports
    print("Generating sample report for admin moderation queue...")
    await db.reports.insert_one({
        "reporter_id": str(seeker_id),
        "reporter_name": "Aanya Sharma",
        "reported_type": "listing",
        "reported_id": str(created_listing_ids[10]),
        "reported_title": "Listing in Whitefield",
        "reason": "Incorrect photos or description",
        "details": "The rent mentioned in the title says ₹10,000 but the description asks for ₹16,000.",
        "status": "pending",
        "created_at": now - timedelta(days=1)
    })

    print("\n" + "="*60)
    print("[SUCCESS] DATABASE SEED COMPLETED SUCCESSFULLY!")
    print(f"Created Admin: admin@myhouse.com / Admin@12345")
    print(f"Created Lister: owner@myhouse.com / Owner@12345")
    print(f"Created Seeker: seeker@myhouse.com / Seeker@12345")
    print(f"30 User Profiles across Pune, Mumbai, Bengaluru, Delhi, Hyderabad, Chennai")
    print(f"60 Realistic Listings with GeoJSON coordinates & photos")
    print(f"20 Roommate posts, reviews, visit requests, conversations, & notifications")
    print("="*60 + "\n")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
