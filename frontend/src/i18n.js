import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', region: 'Global / All India' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', region: 'North & Central India' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', region: 'Maharashtra / Pune & Mumbai' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', region: 'West Bengal & East' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', region: 'Telangana & Andhra Pradesh' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', region: 'Tamil Nadu / Chennai' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', region: 'Karnataka / Bengaluru' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', region: 'Gujarat & Western India' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം', region: 'Kerala & South' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', region: 'Punjab & Delhi NCR' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ', region: 'Odisha' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া', region: 'Assam & Northeast' },
  { code: 'ur', label: 'Urdu', native: 'اردو', region: 'Delhi, Hyderabad & Lucknow' },
  { code: 'kok', label: 'Konkani', native: 'कोंकणी', region: 'Goa & Coastal Coast' },
];

const resources = {
  en: {
    translation: {
      brand_name: "My House",
      nav: {
        explore: "Explore",
        roommates: "Find Roommates",
        wishlist: "Wishlist",
        messages: "Messages",
        dashboard: "Dashboard",
        admin: "Admin Moderation",
        post_listing: "Post a Listing",
        sign_in: "Sign In",
        register: "Register",
        logout: "Log Out",
        my_profile: "My Profile"
      },
      hero: {
        badge: "Verified PGs & Roommates across 13 Indian Metro Cities",
        title_1: "Find your perfect",
        title_highlight: "PG, room or roommate",
        subtitle: "Safe, transparent, and roommate-matched accommodations in Pune, Mumbai, Bengaluru, Delhi NCR, Hyderabad, Chennai, Kolkata, Jaipur, Kochi & more.",
        search_city: "Select City",
        search_type: "Property Type",
        search_budget: "Max Budget",
        search_btn: "Search Homes",
        stat_listings: "Verified Properties",
        stat_roommates: "Compatible Roommates",
        stat_cities: "Prime Indian Cities",
        stat_rating: "Average Resident Rating"
      },
      common: {
        all_cities: "All Cities",
        all_types: "All Types",
        rent_per_month: "/ month",
        deposit: "Deposit",
        available_from: "Available",
        verified: "Verified",
        view_details: "View Details",
        schedule_visit: "Schedule Visit",
        contact_owner: "Contact Owner",
        save_to_wishlist: "Save",
        saved: "Saved",
        compatibility: "Match Score",
        loading: "Loading...",
        no_results: "No listings found matching your search.",
        apply_filters: "Apply Filters",
        reset_filters: "Reset All",
        filter_by: "Filter Properties",
        sort_by: "Sort by",
        view_grid: "Grid",
        view_list: "List",
        view_map: "Map",
        near_me: "Near Me"
      },
      roommates: {
        title: "Smart Roommate Finder",
        subtitle: "Match with like-minded flatmates based on lifestyle, cleanliness, food habits, and budget compatibility.",
        need_roommate: "Have a Flat (Need Roommate)",
        looking_for_room: "Looking for a Room / Flatmate",
        post_requirement: "Post Requirement",
        why_match: "Why this matches you:"
      }
    }
  },
  hi: {
    translation: {
      brand_name: "माई हाउस (My House)",
      nav: {
        explore: "आवास खोजें",
        roommates: "रूममेट खोजें",
        wishlist: "पसंदीदा (Wishlist)",
        messages: "संदेश",
        dashboard: "डैशबोर्ड",
        admin: "एडमिन पैनल",
        post_listing: "कमरा / फ्लैट लिस्ट करें",
        sign_in: "लॉग इन",
        register: "साइन अप",
        logout: "लॉग आउट",
        my_profile: "मेरी प्रोफाइल"
      },
      hero: {
        badge: "6 प्रमुख शहरों में सत्यापित पीजी और रूममेट्स",
        title_1: "अपने लिए सही",
        title_highlight: "पीजी, कमरा या रूममेट खोजें",
        subtitle: "पुणे, मुंबई, बेंगलुरु, दिल्ली, हैदराबाद और चेन्नई में सुरक्षित और पारदर्शी आवास।",
        search_city: "शहर चुनें",
        search_type: "आवास का प्रकार",
        search_budget: "अधिकतम बजट",
        search_btn: "घर खोजें",
        stat_listings: "सत्यापित संपत्तियां",
        stat_roommates: "संगत रूममेट्स",
        stat_cities: "प्रमुख भारतीय शहर",
        stat_rating: "औसत रेटिंग"
      },
      common: {
        all_cities: "सभी शहर",
        all_types: "सभी प्रकार",
        rent_per_month: "/ महीना",
        deposit: "जमानत राशि",
        available_from: "उपलब्ध",
        verified: "सत्यापित",
        view_details: "विवरण देखें",
        schedule_visit: "विजिट शेड्यूल करें",
        contact_owner: "मालिक से संपर्क करें",
        save_to_wishlist: "सेव करें",
        saved: "सेव किया",
        compatibility: "मैच स्कोर",
        loading: "लोड हो रहा है...",
        no_results: "कोई परिणाम नहीं मिला।",
        apply_filters: "फ़िल्टर लागू करें",
        reset_filters: "रीसेट करें",
        filter_by: "फ़िल्टर",
        sort_by: "क्रमबद्ध करें",
        view_grid: "ग्रिड",
        view_list: "सूची",
        view_map: "नक्शा",
        near_me: "मेरे पास"
      },
      roommates: {
        title: "स्मार्ट रूममेट फाइंडर",
        subtitle: "अपनी जीवनशैली, स्वच्छता और बजट के अनुसार सही रूममेट खोजें।",
        need_roommate: "मेरे पास कमरा है (रूममेट चाहिए)",
        looking_for_room: "कमरा / रूममेट चाहिए",
        post_requirement: "आवश्यकता पोस्ट करें",
        why_match: "मैच होने का कारण:"
      }
    }
  },
  mr: {
    translation: {
      brand_name: "माझं घर (My House)",
      nav: {
        explore: "घरे शोधा",
        roommates: "रूममेट शोधा",
        wishlist: "माझी आवड (Wishlist)",
        messages: "संदेश",
        dashboard: "डॅशबोर्ड",
        admin: "प्रशासक पॅनेल",
        post_listing: "घर भाड्याने द्या",
        sign_in: "लॉग इन करा",
        register: "नोंदणी करा",
        logout: "बाहेर पडा",
        my_profile: "माझे प्रोफाईल"
      },
      hero: {
        badge: "६ प्रमुख शहरांमध्ये पडताळणी केलेले PG आणि रूममेट्स",
        title_1: "तुमच्या पसंतीचे योग्य",
        title_highlight: "PG, खोली किंवा रूममेट",
        subtitle: "पुणे, मुंबई, बेंगळुरू, दिल्ली, हैदराबाद आणि चेन्नईमध्ये सुरक्षित आणि सुसंगत राहण्याची जागा मिळवा.",
        search_city: "शहर निवडा",
        search_type: "घराचा प्रकार",
        search_budget: "कमाल बजेट",
        search_btn: "घरे शोधा",
        stat_listings: "पडताळणी केलेली घरे",
        stat_roommates: "सुसंगत रूममेट्स",
        stat_cities: "प्रमुख शहरे",
        stat_rating: "सरासरी रेटिंग"
      },
      common: {
        all_cities: "सर्व शहरे",
        all_types: "सर्व प्रकार",
        rent_per_month: "/ महिना",
        deposit: "डिपॉझिट",
        available_from: "उपलब्ध",
        verified: "पडताळणी केलेले",
        view_details: "तपशील पहा",
        schedule_visit: "भेट निश्चित करा",
        contact_owner: "मालकाशी संपर्क",
        save_to_wishlist: "जतन करा",
        saved: "जतन केले",
        compatibility: "सुसंगतता स्कोअर",
        loading: "लोड होत आहे...",
        no_results: "कोणतेही निकाल आढळले नाहीत.",
        apply_filters: "फिल्टर लावा",
        reset_filters: "रीसेट करा",
        filter_by: "फिल्टर",
        sort_by: "क्रमवारी",
        view_grid: "ग्रिड",
        view_list: "यादी",
        view_map: "नकाशा",
        near_me: "माझ्या जवळ"
      },
      roommates: {
        title: "स्मार्ट रूममेट शोध",
        subtitle: "जीवनशैली, स्वच्छता, खाण्याच्या सवयी आणि बजेटच्या सुसंगततेवर आधारित तुमच्यासारख्या रूममेट्सशी जुळा.",
        need_roommate: "माझ्याकडे जागा आहे (रूममेट हवा)",
        looking_for_room: "खोली किंवा रूममेट शोधत आहे",
        post_requirement: "गरज पोस्ट करा",
        why_match: "सुसंगत असण्याचे कारण:"
      }
    }
  },
  bn: {
    translation: {
      brand_name: "মাই হাউস (My House)",
      nav: {
        explore: "খুঁজুন",
        roommates: "রুমমেট খুঁজুন",
        wishlist: "পছন্দের তালিকা",
        messages: "বার্তা",
        dashboard: "ড্যাশবোর্ড",
        admin: "অ্যাডমিন প্যানেল",
        post_listing: "বিজ্ঞাপন দিন",
        sign_in: "লগইন",
        register: "নিবন্ধন",
        logout: "লগআউট",
        my_profile: "আমার প্রোফাইল"
      },
      hero: {
        badge: "৬টি প্রধান শহরে যাচাইকৃত পিজি ও রুমমেট",
        title_1: "আপনার উপযুক্ত",
        title_highlight: "পিজি, রুম বা রুমমেট খুঁজুন",
        subtitle: "পুনে, মুম্বই, বেঙ্গালুরু, দিল্লি, হায়দ্রাবাদ এবং চেন্নাইয়ে নিরাপদ ও স্বচ্ছ বাসস্থান।",
        search_city: "শহর বাছুন",
        search_type: "ধরন",
        search_budget: "সর্বোচ্চ বাজেট",
        search_btn: "বাড়ি খুঁজুন",
        stat_listings: "যাচাইকৃত বাড়ি",
        stat_roommates: "উপযুক্ত রুমমেট",
        stat_cities: "প্রধান শহর",
        stat_rating: "গড় রেটিং"
      },
      common: {
        all_cities: "সব শহর",
        all_types: "সব ধরন",
        rent_per_month: "/ মাস",
        deposit: "জামানত",
        available_from: "উপলব্ধ",
        verified: "যাচাইকৃত",
        view_details: "বিস্তারিত দেখুন",
        schedule_visit: "পরিদর্শন নির্ধারণ",
        contact_owner: "মালিকের সাথে যোগাযোগ",
        save_to_wishlist: "সংরক্ষণ",
        saved: "সংরক্ষিত",
        compatibility: "ম্যাচ স্কোর",
        loading: "লোড হচ্ছে...",
        no_results: "কোনো ফলাফল পাওয়া যায়নি।",
        apply_filters: "ফিল্টার প্রয়োগ",
        reset_filters: "রিসেট",
        filter_by: "ফিল্টার",
        sort_by: "সাজান",
        view_grid: "গ্রিড",
        view_list: "তালিকা",
        view_map: "মানচিত্র",
        near_me: "আমার কাছে"
      },
      roommates: {
        title: "স্মার্ট রুমমেট ফাইন্ডার",
        subtitle: "জীবনধারা, খাদ্যাভ্যাস এবং বাজেটের ভিত্তিতে মনের মতো রুমমেট খুঁজুন।",
        need_roommate: "রুম আছে (রুমমেট চাই)",
        looking_for_room: "রুম / রুমমেট খুঁজছি",
        post_requirement: "প্রয়োজন পোস্ট করুন",
        why_match: "ম্যাচ করার কারণ:"
      }
    }
  },
  te: {
    translation: {
      brand_name: "మై హౌస్ (My House)",
      nav: {
        explore: "అన్వేషించండి",
        roommates: "రూమ్‌మేట్లను కనుగొనండి",
        wishlist: "ఇష్టమైనవి",
        messages: "సందేశాలు",
        dashboard: "డ్యాష్‌బోర్డ్",
        admin: "అడ్మిన్ ప్యానెల్",
        post_listing: "ఇంటి వివరాలు చేర్చండి",
        sign_in: "లాగిన్",
        register: "రిజిస్టర్",
        logout: "లాగ్ అవుట్",
        my_profile: "నా ప్రొఫైల్"
      },
      hero: {
        badge: "6 ప్రధాన నగరాల్లో ధృవీకరించబడిన PG & రూమ్‌మేట్లు",
        title_1: "మీకు సరైన",
        title_highlight: "PG, గది లేదా రూమ్‌మేట్‌ను కనుగొనండి",
        subtitle: "పూణే, ముంబై, బెంగళూరు, ఢిల్లీ, హైదరాబాద్ మరియు చెన్నైలో సురక్షితమైన వసతి.",
        search_city: "నగరాన్ని ఎంచుకోండి",
        search_type: "రకం",
        search_budget: "గరిష్ట బడ్జెట్",
        search_btn: "ఇళ్లను శోధించండి",
        stat_listings: "ధృవీకరించబడిన ఇళ్లు",
        stat_roommates: "సరిపోయే రూమ్‌మేట్లు",
        stat_cities: "నగరాలు",
        stat_rating: "సగటు రేటింగ్"
      },
      common: {
        all_cities: "అన్ని నగరాలు",
        all_types: "అన్ని రకాలు",
        rent_per_month: "/ నెలకు",
        deposit: "డిపాజిట్",
        available_from: "లభ్యం",
        verified: "ధృవీకరించబడింది",
        view_details: "వివరాలు చూడండి",
        schedule_visit: "సందర్శన సమయం కేటాయించండి",
        contact_owner: "యజమానిని సంప్రదించండి",
        save_to_wishlist: "సేవ్ చేయండి",
        saved: "సేవ్ చేయబడింది",
        compatibility: "మ్యాచ్ స్కోరు",
        loading: "లోడ్ అవుతోంది...",
        no_results: "ఫలితాలు లేవు.",
        apply_filters: "ఫిల్టర్లు వర్తింపజేయండి",
        reset_filters: "రీసెట్ చేయండి",
        filter_by: "ఫిల్టర్",
        sort_by: "క్రమబద్ధీకరించండి",
        view_grid: "గ్రిడ్",
        view_list: "జాబితా",
        view_map: "మ్యాప్",
        near_me: "నా దగ్గర"
      },
      roommates: {
        title: "స్మార్ట్ రూమ్‌మేట్ ఫైండర్",
        subtitle: "జీవనశైలి, అలవాట్లు మరియు బడ్జెట్ ఆధారంగా సరిపోయే రూమ్‌మేట్లను ఎంచుకోండి.",
        need_roommate: "గది ఉంది (రూమ్‌మేట్ కావాలి)",
        looking_for_room: "గది కోసం వెతుకుతున్నాను",
        post_requirement: "పోస్ట్ చేయండి",
        why_match: "సరిపోవడానికి కారణం:"
      }
    }
  },
  ta: {
    translation: {
      brand_name: "மை ஹவுஸ் (My House)",
      nav: {
        explore: "ஆராயுங்கள்",
        roommates: "ரூம்மேட் தேடுங்கள்",
        wishlist: "விருப்பப்பட்டியல்",
        messages: "செய்திகள்",
        dashboard: "டாஷ்போர்டு",
        admin: "நிர்வாகி பேனல்",
        post_listing: "வீடு வாடகைக்கு பதிவிட",
        sign_in: "உள்நுழைக",
        register: "பதிவு செய்க",
        logout: "வெளியேறு",
        my_profile: "என் சுயவிவரம்"
      },
      hero: {
        badge: "6 முக்கிய நகரங்களில் சரிபார்க்கப்பட்ட PG மற்றும் ரூம்மேட்ஸ்",
        title_1: "உங்களுக்கான சிறந்த",
        title_highlight: "PG, அறை அல்லது ரூம்மேட்டை கண்டறியவும்",
        subtitle: "புனே, மும்பை, பெங்களூரு, டெல்லி, ஹைதராபாத் மற்றும் சென்னையில் பாதுகாப்பான தங்குமிடம்.",
        search_city: "நகரத்தை தேர்வு செய்க",
        search_type: "வகை",
        search_budget: "அதிகபட்ச பட்ஜெட்",
        search_btn: "வீடுகளை தேடுங்கள்",
        stat_listings: "சரிபார்க்கப்பட்ட வீடுகள்",
        stat_roommates: "பொருத்தமான ரூம்மேட்ஸ்",
        stat_cities: "முக்கிய நகரங்கள்",
        stat_rating: "சராசரி மதிப்பீடு"
      },
      common: {
        all_cities: "அனைத்து நகரங்கள்",
        all_types: "அனைத்து வகைகள்",
        rent_per_month: "/ மாதம்",
        deposit: "முன்பணம்",
        available_from: "கிடைக்கும் நாள்",
        verified: "சரிபார்க்கப்பட்டது",
        view_details: "விவரங்களை காண்க",
        schedule_visit: "பார்வையிட முன்பதிவு",
        contact_owner: "உரிமையாளரை தொடர்பு கொள்ள",
        save_to_wishlist: "சேமி",
        saved: "சேமிக்கப்பட்டது",
        compatibility: "பொருத்தம் மதிப்பெண்",
        loading: "ஏற்றுகிறது...",
        no_results: "முடிவுகள் எதுவும் இல்லை.",
        apply_filters: "வடிகட்டிகளை பயன்படுத்துக",
        reset_filters: "மீட்டமை",
        filter_by: "வடிகட்டுக",
        sort_by: "வரிசைப்படுத்து",
        view_grid: "கட்டம்",
        view_list: "பட்டியல்",
        view_map: "வரைபடம்",
        near_me: "என் அருகில்"
      },
      roommates: {
        title: "ஸ்மார்ட் ரூம்மேட் தேடல்",
        subtitle: "வாழ்க்கை முறை, தூய்மை மற்றும் பட்ஜெட் அடிப்படையில் சிறந்த அறை தோழரை கண்டறியவும்.",
        need_roommate: "அறை உள்ளது (தோழர் தேவை)",
        looking_for_room: "அறை தேடுகிறேன்",
        post_requirement: "தேவையை பதிவிட",
        why_match: "பொருந்துவதற்கான காரணம்:"
      }
    }
  },
  kn: {
    translation: {
      brand_name: "ಮೈ ಹೌಸ್ (My House)",
      nav: {
        explore: "ಅನ್ವೇಷಿಸಿ",
        roommates: "ರೂಮ್‌ಮೇಟ್ ಹುಡುಕಿ",
        wishlist: "ಮೆಚ್ಚಿನವುಗಳು",
        messages: "ಸಂದೇಶಗಳು",
        dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
        admin: "ನಿರ್ವಾಹಕ ಪ್ಯಾನೆಲ್",
        post_listing: "ಮನೆ ಬಾಡಿಗೆಗೆ ನೀಡಿ",
        sign_in: "ಲಾಗಿನ್",
        register: "ನೋಂದಣಿ",
        logout: "ಲಾಗ್ ಔಟ್",
        my_profile: "ನನ್ನ ಪ್ರೊಫೈಲ್"
      },
      hero: {
        badge: "6 ಪ್ರಮುಖ ನಗರಗಳಲ್ಲಿ ಪರಿಶೀಲಿಸಿದ PG & ರೂಮ್‌ಮೇಟ್‌ಗಳು",
        title_1: "ನಿಮಗಾಗಿ ಪರಿಪೂರ್ಣ",
        title_highlight: "PG, ಕೊಠಡಿ ಅಥವಾ ರೂಮ್‌ಮೇಟ್ ಹುಡುಕಿ",
        subtitle: "ಪುಣೆ, ಮುಂಬೈ, ಬೆಂಗಳೂರು, ದೆಹಲಿ, ಹೈದರಾಬಾದ್ ಮತ್ತು ಚೆನ್ನೈನಲ್ಲಿ ಸುರಕ್ಷಿತ ವಸತಿ.",
        search_city: "ನಗರ ಆಯ್ಕೆಮಾಡಿ",
        search_type: "ಮನೆಯ ಪ್ರಕಾರ",
        search_budget: "ಗರಿಷ್ಠ ಬಜೆಟ್",
        search_btn: "ಮನೆ ಹುಡುಕಿ",
        stat_listings: "ಪರಿಶೀಲಿಸಿದ ಮನೆಗಳು",
        stat_roommates: "ಹೊಂದಿಕೊಳ್ಳುವ ರೂಮ್‌ಮೇಟ್‌ಗಳು",
        stat_cities: "ಪ್ರಮುಖ ನಗರಗಳು",
        stat_rating: "ಸರಾಸರಿ ರೇಟಿಂಗ್"
      },
      common: {
        all_cities: "ಎಲ್ಲಾ ನಗರಗಳು",
        all_types: "ಎಲ್ಲಾ ಪ್ರಕಾರಗಳು",
        rent_per_month: "/ ತಿಂಗಳಿಗೆ",
        deposit: "ಠೇವಣಿ",
        available_from: "ಲಭ್ಯವಿದೆ",
        verified: "ಪರಿಶೀಲಿಸಲಾಗಿದೆ",
        view_details: "ವಿವರ ವೀಕ್ಷಿಸಿ",
        schedule_visit: "ಭೇಟಿ ನಿಗದಿಪಡಿಸಿ",
        contact_owner: "ಮಾಲೀಕರನ್ನು ಸಂಪರ್ಕಿಸಿ",
        save_to_wishlist: "ಉಳಿಸಿ",
        saved: "ಉಳಿಸಲಾಗಿದೆ",
        compatibility: "ಹೊಂದಾಣಿಕೆ ಸ್ಕೋರ್",
        loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
        no_results: "ಯಾವುದೇ ಫಲಿತಾಂಶಗಳಿಲ್ಲ.",
        apply_filters: "ಫಿಲ್ಟರ್ ಅನ್ವಯಿಸಿ",
        reset_filters: "ಮರುಹೊಂದಿಸಿ",
        filter_by: "ಫಿಲ್ಟರ್",
        sort_by: "ವಿಂಗಡಿಸಿ",
        view_grid: "ಗ್ರಿಡ್",
        view_list: "ಪಟ್ಟಿ",
        view_map: "ನಕ್ಷೆ",
        near_me: "ನನ್ನ ಹತ್ತಿರ"
      },
      roommates: {
        title: "ಸ್ಮಾರ್ಟ್ ರೂಮ್‌ಮೇಟ್ ಅನ್ವೇಷಕ",
        subtitle: "ಜೀವನಶೈಲಿ, ಆಹಾರ ಪದ್ಧತಿ ಮತ್ತು ಬಜೆಟ್‌ಗೆ ತಕ್ಕಂತೆ ಹೊಂದಾಣಿಕೆಯಾಗುವ ರೂಮ್‌ಮೇಟ್ ಪಡೆಯಿರಿ.",
        need_roommate: "ಕೊಠಡಿ ಇದೆ (ರೂಮ್‌ಮೇಟ್ ಬೇಕು)",
        looking_for_room: "ಕೊಠಡಿ ಹುಡುಕುತ್ತಿದ್ದೇನೆ",
        post_requirement: "ಅವಶ್ಯಕತೆ ಪೋಸ್ಟ್ ಮಾಡಿ",
        why_match: "ಹೊಂದಾಣಿಕೆಯಾಗುವ ಕಾರಣ:"
      }
    }
  },
  gu: {
    translation: {
      brand_name: "માય હાઉસ (My House)",
      nav: {
        explore: "શોધો",
        roommates: "રૂમમેટ શોધો",
        wishlist: "પસંદગી",
        messages: "સંદેશ",
        dashboard: "ડેશબોર્ડ",
        admin: "એડમિન પેનલ",
        post_listing: "મકાન લિસ્ટ કરો",
        sign_in: "લૉગ ઇન",
        register: "રજીસ્ટર",
        logout: "લૉગ આઉટ",
        my_profile: "મારી પ્રોફાઇલ"
      },
      hero: {
        badge: "૬ મુખ્ય શહેરોમાં ચકાસાયેલ પીજી અને રૂમમેટ્સ",
        title_1: "તમારા માટે શ્રેષ્ઠ",
        title_highlight: "પીજી, રૂમ અથવા રૂમમેટ શોધો",
        subtitle: "પુણે, મુંબઈ, બેંગલુરુ, દિલ્હી, હૈદરાબાદ અને ચેન્નાઈમાં સુરક્ષિત રહેઠાણ.",
        search_city: "શહેર પસંદ કરો",
        search_type: "મકાનનો પ્રકાર",
        search_budget: "મહત્તમ બજેટ",
        search_btn: "ઘર શોધો",
        stat_listings: "ચકાસાયેલ મકાનો",
        stat_roommates: "સુસંગત રૂમમેટ્સ",
        stat_cities: "મુખ્ય શહેરો",
        stat_rating: "સરેરાશ રેટિંગ"
      },
      common: {
        all_cities: "બધા શહેરો",
        all_types: "બધા પ્રકાર",
        rent_per_month: "/ મહિને",
        deposit: "ડિપોઝિટ",
        available_from: "ઉપલબ્ધ",
        verified: "ચકાસાયેલ",
        view_details: "વિગતો જુઓ",
        schedule_visit: "મુલાકાત શેડ્યૂલ કરો",
        contact_owner: "માલિકનો સંપર્ક કરો",
        save_to_wishlist: "સાચવો",
        saved: "સાચવ્યું",
        compatibility: "મેચ સ્કોર",
        loading: "લોડ થઈ રહ્યું છે...",
        no_results: "કોઈ પરિણામ મળ્યું નથી.",
        apply_filters: "ફિલ્ટર લાગુ કરો",
        reset_filters: "રીસેટ કરો",
        filter_by: "ફિલ્ટર",
        sort_by: "ક્રમબદ્ધ કરો",
        view_grid: "ગ્રીડ",
        view_list: "યાદી",
        view_map: "નકશો",
        near_me: "મારી નજીક"
      },
      roommates: {
        title: "સ્માર્ટ રૂમમેટ શોધ",
        subtitle: "જીવનશૈલી, સ્વચ્છતા અને બજેટ અનુસાર તમારા જેવા રૂમમેટ્સ શોધો.",
        need_roommate: "રૂમ છે (રૂમમેટ જોઈએ છે)",
        looking_for_room: "રૂમ શોધું છું",
        post_requirement: "જરૂરિયાત પોસ્ટ કરો",
        why_match: "સુસંગત હોવાનું કારણ:"
      }
    }
  },
  ml: {
    translation: {
      brand_name: "മൈ ഹൗസ് (My House)",
      nav: {
        explore: "കണ്ടെത്തുക",
        roommates: "റൂംമേറ്റിനെ കണ്ടെത്തുക",
        wishlist: "പ്രിയപ്പെട്ടവ",
        messages: "സന്ദേശങ്ങൾ",
        dashboard: "ഡാഷ്‌ബോർഡ്",
        admin: "അഡ്മിൻ പാനൽ",
        post_listing: "താമസസ്ഥലം ലിസ്റ്റ് ചെയ്യുക",
        sign_in: "ലോഗിൻ",
        register: "രജിസ്റ്റർ",
        logout: "ലോഗ് ഔട്ട്",
        my_profile: "എന്റെ പ്രൊഫൈൽ"
      },
      hero: {
        badge: "6 പ്രധാന നഗരങ്ങളിൽ പരിശോധിച്ചുറപ്പിച്ച പി.ജി & റൂംമേറ്റ്സ്",
        title_1: "നിങ്ങൾക്ക് അനുയോജ്യമായ",
        title_highlight: "പി.ജി, മുറി അല്ലെങ്കിൽ റൂംമേറ്റിനെ കണ്ടെത്തൂ",
        subtitle: "പൂനെ, മുംബൈ, ബെംഗളൂരു, ഡൽഹി, ഹൈദരാബാദ്, ചെന്നൈ എന്നിവിടങ്ങളിൽ സുരക്ഷിത താമസം.",
        search_city: "നഗരം തിരഞ്ഞെടുക്കുക",
        search_type: "തരം",
        search_budget: "പരമാവധി ബജറ്റ്",
        search_btn: "വീടുകൾ തിരയുക",
        stat_listings: "പരിശോധിച്ച വീടുകൾ",
        stat_roommates: "യോജിച്ച റൂംമേറ്റുകൾ",
        stat_cities: "പ്രധാന നഗരങ്ങൾ",
        stat_rating: "ശരാശരി റേറ്റിംഗ്"
      },
      common: {
        all_cities: "എല്ലാ നഗരങ്ങളും",
        all_types: "എല്ലാ തരങ്ങളും",
        rent_per_month: "/ മാസം",
        deposit: "ഡെപ്പോസിറ്റ്",
        available_from: "ലഭ്യമായ തീയതി",
        verified: "സ്ഥിരീകരിച്ചത്",
        view_details: "വിവരങ്ങൾ കാണുക",
        schedule_visit: "സന്ദർശനം നിശ്ചയിക്കുക",
        contact_owner: "ഉടമയുമായി ബന്ധപ്പെടുക",
        save_to_wishlist: "സേവ് ചെയ്യുക",
        saved: "സേവ് ചെയ്തു",
        compatibility: "മാച്ച് സ്കോർ",
        loading: "ലോഡ് ചെയ്യുന്നു...",
        no_results: "ഫലങ്ങളൊന്നും ലഭ്യമല്ല.",
        apply_filters: "ഫിൽട്ടർ പ്രയോഗിക്കുക",
        reset_filters: "റീസെറ്റ് ചെയ്യുക",
        filter_by: "ഫിൽട്ടർ",
        sort_by: "ക്രമീകരിക്കുക",
        view_grid: "ഗ്രിഡ്",
        view_list: "പട്ടിക",
        view_map: "മാപ്പ്",
        near_me: "അടുത്ത്"
      },
      roommates: {
        title: "സ്മാർട്ട് റൂംമേറ്റ് ഫൈൻഡർ",
        subtitle: "ജീവിതരീതിയും ഭക്ഷണശീലങ്ങളും ബജറ്റും ഒത്തുപോകുന്ന റൂംമേറ്റിനെ കണ്ടെത്തുക.",
        need_roommate: "മുറിയുണ്ട് (റൂംമേറ്റിനെ വേണം)",
        looking_for_room: "മുറി അന്വേഷിക്കുന്നു",
        post_requirement: "പോസ്റ്റ് ചെയ്യുക",
        why_match: "യോജിക്കുന്ന കാരണം:"
      }
    }
  },
  pa: {
    translation: {
      brand_name: "ਮਾਈ ਹਾਊਸ (My House)",
      nav: {
        explore: "ਖੋਜੋ",
        roommates: "ਰੂਮਮੇਟ ਲੱਭੋ",
        wishlist: "ਪਸੰਦੀਦਾ",
        messages: "ਸੁਨੇਹੇ",
        dashboard: "ਡੈਸ਼ਬੋਰਡ",
        admin: "ਐਡਮਿਨ ਪੈਨਲ",
        post_listing: "ਲਿਸਟ ਕਰੋ",
        sign_in: "ਲੌਗ ਇਨ",
        register: "ਰਜਿਸਟਰ",
        logout: "ਲੌਗ ਆਉਟ",
        my_profile: "ਮੇਰੀ ਪ੍ਰੋਫਾਈਲ"
      },
      hero: {
        badge: "6 ਵੱਡੇ ਸ਼ਹਿਰਾਂ ਵਿੱਚ ਵੈਰੀਫਾਈਡ ਪੀਜੀ ਅਤੇ ਰੂਮਮੇਟ",
        title_1: "ਆਪਣੇ ਲਈ ਸਹੀ",
        title_highlight: "ਪੀਜੀ, ਕਮਰਾ ਜਾਂ ਰੂਮਮੇਟ ਲੱਭੋ",
        subtitle: "ਪੁਣੇ, ਮੁੰਬਈ, ਬੈਂਗਲੁਰੂ, ਦਿੱਲੀ, ਹੈਦਰਾਬਾਦ ਅਤੇ ਚੇਨਈ ਵਿੱਚ ਸੁਰੱਖਿਅਤ ਰਿਹਾਇਸ਼।",
        search_city: "ਸ਼ਹਿਰ ਚੁਣੋ",
        search_type: "ਕਿਸਮ",
        search_budget: "ਵੱਧ ਤੋਂ ਵੱਧ ਬਜਟ",
        search_btn: "ਘਰ ਲੱਭੋ",
        stat_listings: "ਵੈਰੀਫਾਈਡ ਘਰ",
        stat_roommates: "ਯੋਗ ਰੂਮਮੇਟ",
        stat_cities: "ਮੁੱਖ ਸ਼ਹਿਰ",
        stat_rating: "ਔਸਤ ਰੇਟਿੰਗ"
      },
      common: {
        all_cities: "ਸਾਰੇ ਸ਼ਹਿਰ",
        all_types: "ਸਾਰੀਆਂ ਕਿਸਮਾਂ",
        rent_per_month: "/ ਮਹੀਨਾ",
        deposit: "ਡਿਪਾਜ਼ਿਟ",
        available_from: "ਉਪਲਬਧ",
        verified: "ਵੈਰੀਫਾਈਡ",
        view_details: "ਵੇਰਵੇ ਦੇਖੋ",
        schedule_visit: "ਮੁਲਾਕਾਤ ਤੈਅ ਕਰੋ",
        contact_owner: "ਮਾਲਕ ਨਾਲ ਸੰਪਰਕ ਕਰੋ",
        save_to_wishlist: "ਸੇਵ ਕਰੋ",
        saved: "ਸੇਵ ਕੀਤਾ",
        compatibility: "ਮੈਚ ਸਕੋਰ",
        loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
        no_results: "ਕੋਈ ਨਤੀਜਾ ਨਹੀਂ ਮਿਲਿਆ।",
        apply_filters: "ਫਿਲਟਰ ਲਗਾਓ",
        reset_filters: "ਰੀਸੈਟ ਕਰੋ",
        filter_by: "ਫਿਲਟਰ",
        sort_by: "ਤਰਤੀਬ ਦਿਓ",
        view_grid: "ਗਰਿੱਡ",
        view_list: "ਸੂਚੀ",
        view_map: "ਨਕਸ਼ਾ",
        near_me: "ਮੇਰੇ ਨੇੜੇ"
      },
      roommates: {
        title: "ਸਮਾਰਟ ਰੂਮਮੇਟ ਫਾਈਂਡਰ",
        subtitle: "ਜੀਵਨ ਸ਼ੈਲੀ, ਸਫਾਈ ਅਤੇ ਬਜਟ ਅਨੁਸਾਰ ਵਧੀਆ ਰੂਮਮੇਟ ਲੱਭੋ।",
        need_roommate: "ਕਮਰਾ ਹੈ (ਰੂਮਮੇਟ ਚਾਹੀਦਾ ਹੈ)",
        looking_for_room: "ਕਮਰਾ ਲੱਭ ਰਿਹਾ ਹਾਂ",
        post_requirement: "ਜ਼ਰੂਰਤ ਪੋਸਟ ਕਰੋ",
        why_match: "ਮੈਚ ਹੋਣ ਦਾ ਕਾਰਨ:"
      }
    }
  },
  or: {
    translation: {
      brand_name: "ମାଇ ହାଉସ (My House)",
      nav: {
        explore: "ଖୋଜନ୍ତୁ",
        roommates: "ରୁମମେଟ୍ ଖୋଜନ୍ତୁ",
        wishlist: "ପସନ୍ଦ ତାଲିକା",
        messages: "ବାର୍ତ୍ତା",
        dashboard: "ଡ୍ୟାସବୋର୍ଡ",
        admin: "ଆଡମିନ ପ୍ୟାନେଲ",
        post_listing: "ଲିଷ୍ଟ କରନ୍ତୁ",
        sign_in: "ଲଗ୍ ଇନ୍",
        register: "ପଞ୍ଜୀକରଣ",
        logout: "ଲଗ୍ ଆଉଟ୍",
        my_profile: "ମୋ ପ୍ରୋଫାଇଲ୍"
      },
      hero: {
        badge: "୬ଟି ପ୍ରମୁଖ ସହରରେ ଯାଞ୍ଚ ହୋଇଥିବା PG ଏବଂ ରୁମମେଟ୍",
        title_1: "ଆପଣଙ୍କ ପାଇଁ ଉପଯୁକ୍ତ",
        title_highlight: "PG, ରୁମ୍ କିମ୍ବା ରୁମମେଟ୍ ଖୋଜନ୍ତୁ",
        subtitle: "ପୁଣେ, ମୁମ୍ବାଇ, ବେଙ୍ଗାଲୁରୁ, ଦିଲ୍ଲୀ, ହାଇଦ୍ରାବାଦ ଏବଂ ଚେନ୍ନାଇରେ ସୁରକ୍ଷିତ ବାସସ୍ଥାନ।",
        search_city: "ସହର ବାଛନ୍ତୁ",
        search_type: "ପ୍ରକାର",
        search_budget: "ସର୍ବାଧିକ ବଜେଟ୍",
        search_btn: "ଘର ଖୋଜନ୍ତୁ",
        stat_listings: "ଯାଞ୍ଚ ହୋଇଥିବା ଘର",
        stat_roommates: "ଉପଯୁକ୍ତ ରୁମମେଟ୍",
        stat_cities: "ମୁଖ୍ୟ ସହର",
        stat_rating: "ହାରାହାରି ରେଟିଂ"
      },
      common: {
        all_cities: "ସମସ୍ତ ସହର",
        all_types: "ସମସ୍ତ ପ୍ରକାର",
        rent_per_month: "/ ମାସ",
        deposit: "ଡିପୋଜିଟ୍",
        available_from: "ଉପଲବ୍ଧ",
        verified: "ଯାଞ୍ଚିତ",
        view_details: "ବିବରଣୀ ଦେଖନ୍ତୁ",
        schedule_visit: "ଭେଟିବା ସମୟ ସ୍ଥିର କରନ୍ତୁ",
        contact_owner: "ମାଲିକଙ୍କ ସହ ଯୋଗାଯୋଗ",
        save_to_wishlist: "ସାଇତନ୍ତୁ",
        saved: "ସାଇତାଗଲା",
        compatibility: "ମ୍ୟାଚ୍ ସ୍କୋର",
        loading: "ଲୋଡ୍ ହେଉଛି...",
        no_results: "କୌଣସି ଫଳାଫଳ ମିଳିଲା ନାହିଁ।",
        apply_filters: "ଫିଲ୍ଟର୍ ଲଗାନ୍ତୁ",
        reset_filters: "ରିସେଟ୍ କରନ୍ତୁ",
        filter_by: "ଫିଲ୍ଟର୍",
        sort_by: "କ୍ରମ",
        view_grid: "ଗ୍ରୀଡ୍",
        view_list: "ତାଲିକା",
        view_map: "ମାନଚିତ୍ର",
        near_me: "ମୋ ନିକଟରେ"
      },
      roommates: {
        title: "ସ୍ମାର୍ଟ ରୁମମେଟ୍ ଫାଇଣ୍ଡର୍",
        subtitle: "ଜୀବନଶୈଳୀ, ଖାଦ୍ୟାଭ୍ୟାସ ଏବଂ ବଜେଟ୍ ଅନୁସାରେ ସଠିକ୍ ରୁମମେଟ୍ ବାଛନ୍ତୁ।",
        need_roommate: "ରୁମ୍ ଅଛି (ରୁମମେଟ୍ ଦରକାର)",
        looking_for_room: "ରୁମ୍ ଖୋଜୁଛି",
        post_requirement: "ଆବଶ୍ୟକତା ପୋଷ୍ଟ କରନ୍ତୁ",
        why_match: "ମେଳ ଖାଉଥିବା କାରଣ:"
      }
    }
  },
  as: {
    translation: {
      brand_name: "মাই হাউচ (My House)",
      nav: {
        explore: "অন্বেষণ কৰক",
        roommates: "ৰুমমেট বিচাৰক",
        wishlist: "পছন্দ তালিকা",
        messages: "বাৰ্তা",
        dashboard: "ডেশ্ববৰ্ড",
        admin: "এডমিন পেনেল",
        post_listing: "বিজ্ঞাপন দিয়ক",
        sign_in: "লগ ইন",
        register: "পঞ্জীয়ন",
        logout: "লগ আউট",
        my_profile: "মোৰ প্ৰফাইল"
      },
      hero: {
        badge: "৬খন মুখ্য চহৰত পৰীক্ষিত পিজি আৰু ৰুমমেট",
        title_1: "আপোনাৰ বাবে উপযুক্ত",
        title_highlight: "পিজি, ৰুম বা ৰুমমেট বিচাৰক",
        subtitle: "পুনে, মুম্বাই, বেংগালুৰু, দিল্লী, হায়দৰাবাদ আৰু চেন্নাইত সুৰক্ষিত বাসস্থান।",
        search_city: "চহৰ বাছক",
        search_type: "প্ৰকাৰ",
        search_budget: "সৰ্বাধিক বাজেট",
        search_btn: "ঘৰ বিচাৰক",
        stat_listings: "পৰীক্ষিত ঘৰ",
        stat_roommates: "উপযুক্ত ৰুমমেট",
        stat_cities: "প্ৰধান চহৰ",
        stat_rating: "গড় ৰেটিং"
      },
      common: {
        all_cities: "সকলো চহৰ",
        all_types: "সকলো প্ৰকাৰ",
        rent_per_month: "/ মাহে",
        deposit: "আমানত",
        available_from: "উপলব্ধ",
        verified: "পৰীক্ষিত",
        view_details: "বিৱৰণ চাওক",
        schedule_visit: "পৰিদৰ্শন সময় নিৰ্ধাৰণ",
        contact_owner: "মালিকৰ সৈতে যোগাযোগ",
        save_to_wishlist: "সংৰক্ষণ",
        saved: "সংৰক্ষিত",
        compatibility: "মেচ স্ক'ৰ",
        loading: "লোড হৈ আছে...",
        no_results: "কোনো ফলাফল পোৱা নগ'ল।",
        apply_filters: "ফিল্টাৰ প্ৰয়োগ",
        reset_filters: "ৰিচেট",
        filter_by: "ফিল্টাৰ",
        sort_by: "ক্ৰম",
        view_grid: "গ্ৰিড",
        view_list: "তালিকা",
        view_map: "মানচিত্ৰ",
        near_me: "মোৰ ওচৰত"
      },
      roommates: {
        title: "স্মাৰ্ট ৰুমমেট সন্ধান",
        subtitle: "জীৱনশৈলী, খাদ্যভ্যাস আৰু বাজেটৰ ভিত্তিত উপযুক্ত ৰুমমেট বাছনি কৰক।",
        need_roommate: "ৰুম আছে (ৰুমমেট লাগে)",
        looking_for_room: "ৰুম বিচাৰি আছো",
        post_requirement: "প্ৰয়োজন পোষ্ট কৰক",
        why_match: "মেচ হোৱাৰ কাৰণ:"
      }
    }
  },
  ur: {
    translation: {
      brand_name: "مائی ہاؤس (My House)",
      nav: {
        explore: "تلاش کریں",
        roommates: "روم میٹ تلاش کریں",
        wishlist: "پسندیدہ",
        messages: "پیغامات",
        dashboard: "ڈیش بورڈ",
        admin: "ایڈمن پینل",
        post_listing: "مکان شامل کریں",
        sign_in: "لاگ ان",
        register: "رجسٹر",
        logout: "لاگ آؤٹ",
        my_profile: "میری پروفائل"
      },
      hero: {
        badge: "6 بڑے شہروں میں تصدیق شدہ پی جی اور روم میٹس",
        title_1: "اپنے لیے بہترین",
        title_highlight: "پی جی، کمرہ یا روم میٹ تلاش کریں",
        subtitle: "پونے، ممبئی، بنگلور، دہلی، حیدرآباد اور چنئی میں محفوظ رہائش۔",
        search_city: "شہر منتخب کریں",
        search_type: "قسم",
        search_budget: "زیادہ سے زیادہ بجٹ",
        search_btn: "گھر تلاش کریں",
        stat_listings: "تصدیق شدہ مکانات",
        stat_roommates: "مناسب روم میٹس",
        stat_cities: "اہم شہر",
        stat_rating: "اوسط درجہ بندی"
      },
      common: {
        all_cities: "تمام شہر",
        all_types: "تمام اقسام",
        rent_per_month: "/ ماہانہ",
        deposit: "ڈپازٹ",
        available_from: "دستیاب",
        verified: "تصدیق شدہ",
        view_details: "تفصیلات دیکھیں",
        schedule_visit: "معائنے کا وقت طے کریں",
        contact_owner: "مالک سے رابطہ کریں",
        save_to_wishlist: "محفوظ کریں",
        saved: "محفوظ کر لیا",
        compatibility: "مطابقت اسکور",
        loading: "لوڈ ہو رہا ہے...",
        no_results: "کوئی نتیجہ نہیں ملا۔",
        apply_filters: "فلٹر لگائیں",
        reset_filters: "ری سیٹ کریں",
        filter_by: "فلٹر",
        sort_by: "ترتیب دیں",
        view_grid: "گرڈ",
        view_list: "فہرست",
        view_map: "نقشہ",
        near_me: "میرے قریب"
      },
      roommates: {
        title: "اسمارٹ روم میٹ تلاش",
        subtitle: "طرز زندگی، صفائی اور بجٹ کے مطابق بہترین روم میٹ منتخب کریں۔",
        need_roommate: "کمرہ دستیاب ہے (روم میٹ درکار)",
        looking_for_room: "کمرے کی تلاش ہے",
        post_requirement: "ضرورت پوسٹ کریں",
        why_match: "مطابقت کی وجہ:"
      }
    }
  },
  kok: {
    translation: {
      brand_name: "म्हजें ಘರ್ (My House)",
      nav: {
        explore: "ಸೋಧಾತ್",
        roommates: "ರೂಮ್‌ಮೇಟ್ ಸೋಧಾತ್",
        wishlist: "ಆವಡ್ತೆಂ",
        messages: "ಸಂದೇಶ್",
        dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
        admin: "ಅಡ್ಮಿನ್ ಪ್ಯಾನೆಲ್",
        post_listing: "ಘರ್ ಪೋಸ್ಟ್ ಕರಾತ್",
        sign_in: "ಲಾಗಿನ್",
        register: "ರಜಿಸ್ಟರ್",
        logout: "ಲॉग ಔಟ್",
        my_profile: "ಮ್ಹಜಿ ಪ್ರೊಫೈಲ್"
      },
      hero: {
        badge: "೬ ಮುಖ್ಯ ಶಹರಾಂನಿ ವೆರಿಫೈಡ್ ಪಿಜಿ ಆನಿ ರೂಮ್‌ಮೇಟ್ಸ್",
        title_1: "ತುಮ್ಚ್ಯಾ ಖಾತಿರ್ ಯೋಗ್ಯ್",
        title_highlight: "ಪಿಜಿ, ರೂಮ್ ಯಾ ರೂಮ್‌ಮೇಟ್ ಸೋಧಾತ್",
        subtitle: "ಪುಣೆ, ಮುಂಬೈ, ಬೆಂಗಳೂರು, ದಿಲ್ಲಿ, ಹೈದರಾಬಾದ್ ಆನಿ ಚೆನ್ನೈಂತ್ ಸುರಕ್ಷಿತ್ ರಾವ್ಣೆಂ.",
        search_city: "ಶಹರ್ ವಿಂಚಾತ್",
        search_type: "ಘರ್ಚೊ ಪ್ರಕಾರ್",
        search_budget: "ಚಡಾಂತ್ ಚಡ್ ಬಜೆಟ್",
        search_btn: "ಘರ್ ಸೋಧಾತ್",
        stat_listings: "ವೆರಿಫೈಡ್ ಘರಾಂ",
        stat_roommates: "ಯೋಗ್ಯ್ ರೂಮ್‌ಮೇಟ್ಸ್",
        stat_cities: "ಮುಖ್ಯ ಶಹರಾಂ",
        stat_rating: "ಸರಾಸರಿ ರೇಟಿಂಗ್"
      },
      common: {
        all_cities: "ಸಗ್ಳಿಂ ಶಹರಾಂ",
        all_types: "ಸಗ್ಳೆ ಪ್ರಕಾರ್",
        rent_per_month: "/ ಮ್ಹಯ್ನ್ಯಾಕ್",
        deposit: "ಡಿಪೋಸಿಟ್",
        available_from: "ಉಪಲಬ್ಧ್",
        verified: "ವೆರಿಫೈಡ್",
        view_details: "ವಿವರಾಂ ಪಳೆಯಾತ್",
        schedule_visit: "ಭೆಟ್ ನಿಗದಿ ಕರಾತ್",
        contact_owner: "ಮಾಲಿಕಾ ಕಡೆನ್ ಸಂಪರ್ಕ್",
        save_to_wishlist: "ಸಾಂಬಾಳಾತ್",
        saved: "ಸಾಂಬಾಳ್ಳೆಂ",
        compatibility: "ಮ್ಯಾಚ್ ಸ್ಕೋರ್",
        loading: "ಲೋಡ್ ಜಾತಾ...",
        no_results: "ಕಾಂಯ್ಚ್ ಮೆಳೊಂಕ್ ನಾ.",
        apply_filters: "ಫಿಲ್ಟರ್ ಲಾವಾತ್",
        reset_filters: "ರಿಸೆಟ್ ಕರಾತ್",
        filter_by: "ಫಿಲ್ಟರ್",
        sort_by: "ಕ್ರಮಬದ್ಧ್",
        view_grid: "ಗ್ರಿಡ್",
        view_list: "ವಳೆರಿ",
        view_map: "ನಕ್ಷೊ",
        near_me: "ಮ್ಹಜ್ಯಾ ಲಾಗಿಂ"
      },
      roommates: {
        title: "ಸ್ಮಾರ್ಟ್ ರೂಮ್‌ಮೇಟ್ ಸೋಧ್",
        subtitle: "ಜೀವನಶೈಲಿ ಆನಿ ಬಜೆಟಾ ಪ್ರಮಾಣೆಂ ತುಮ್ಚ್ಯಾ ತಸಲೊಚ್ ರೂಮ್‌ಮೇಟ್ ಸೋಧಾತ್.",
        need_roommate: "ರೂಮ್ ಆಸಾ (ರೂಮ್‌ಮೇಟ್ ಜಾಯ್)",
        looking_for_room: "ರೂಮ್ ಸೋಧ್ತಾಂ",
        post_requirement: "ಗರ್ಜ್ ಪೋಸ್ಟ್ ಕರಾತ್",
        why_match: "ಮ್ಯಾಚ್ ಜಾವ್ಯಾಕ್ ಕಾರಣ್:"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('myhouse_lang') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
