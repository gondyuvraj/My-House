import React, { useState } from 'react';
import { 
  User, ShieldCheck, Mail, Phone, MapPin, Briefcase, 
  Sparkles, Save, CheckCircle2, AlertCircle, Key, Clock,
  MessageCircle, Building, FileText, CreditCard, HeartHandshake,
  Languages as LangIcon, Home, Check, Camera, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { METRO_CITIES } from '../utils/geoData';
import { getDisplayAvatar } from '../utils/avatarPresets';
import AvatarUploadModal from '../components/AvatarUploadModal';
import toast from 'react-hot-toast';

const AVAILABLE_LANGUAGES = [
  "English", "Hindi", "Marathi", "Kannada", "Telugu", 
  "Tamil", "Gujarati", "Bengali", "Punjabi", "Malayalam"
];

export default function Profile() {
  const { user, updateProfile, sendOTP, verifyOTP } = useAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'owner', 'kyc', 'lifestyle'

  // Personal Info
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [age, setAge] = useState(user?.age || 26);
  const [gender, setGender] = useState(user?.gender || 'other');
  const [occupation, setOccupation] = useState(user?.occupation || 'working');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [city, setCity] = useState(user?.city || 'Pune');
  const [localArea, setLocalArea] = useState(user?.local_area || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [budgetMin, setBudgetMin] = useState(user?.budget_min || 8000);
  const [budgetMax, setBudgetMax] = useState(user?.budget_max || 25000);

  // Real-world Owner & Host Credentials
  const [hostType, setHostType] = useState(user?.host_type || (user?.role === 'owner' ? 'individual' : 'flatmate'));
  const [propertiesManaged, setPropertiesManaged] = useState(user?.properties_managed || '1 Property');
  const [languages, setLanguages] = useState(user?.languages?.length ? user.languages : ['English', 'Hindi']);
  const [providesRentalAgreement, setProvidesRentalAgreement] = useState(user?.provides_rental_agreement !== false);
  const [upiId, setUpiId] = useState(user?.upi_id || '');

  // Real-world Contact & Availability Preferences
  const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsapp_number || user?.phone || '');
  const [contactPreference, setContactPreference] = useState(user?.contact_preference || 'both');
  const [callingHours, setCallingHours] = useState(user?.calling_hours || '9:00 AM - 8:00 PM');
  const [sameAsPhone, setSameAsPhone] = useState(false);

  // KYC & Emergency Contacts
  const [idVerificationType, setIdVerificationType] = useState(user?.id_verification_type || 'aadhaar');
  const [idNumberMasked, setIdNumberMasked] = useState(user?.id_number_masked || 'XXXX-XXXX-4589');
  const [emergencyContactName, setEmergencyContactName] = useState(user?.emergency_contact_name || '');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState(user?.emergency_contact_relation || 'Parent / Guardian');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(user?.emergency_contact_phone || '');
  const [permanentAddress, setPermanentAddress] = useState(user?.permanent_address || '');

  // Lifestyle Questionnaire State
  const initialLife = user?.lifestyle || {};
  const [smoking, setSmoking] = useState(initialLife.smoking || 'never');
  const [drinking, setDrinking] = useState(initialLife.drinking || 'never');
  const [foodPreference, setFoodPreference] = useState(initialLife.food_preference || 'any');
  const [sleepSchedule, setSleepSchedule] = useState(initialLife.sleep_schedule || 'flexible');
  const [cleanliness, setCleanliness] = useState(initialLife.cleanliness || 4);
  const [guestsAllowed, setGuestsAllowed] = useState(initialLife.guests_allowed !== false);
  const [petsAllowed, setPetsAllowed] = useState(!!initialLife.pets_allowed);
  const [noiseLevel, setNoiseLevel] = useState(initialLife.noise_level || 'moderate');
  const [workFromHome, setWorkFromHome] = useState(!!initialLife.work_from_home);

  const [saving, setSaving] = useState(false);

  // Avatar / Profile Picture Upload Modal state
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  // OTP Verification Modal state
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleAvatarUpdated = async (newUrl) => {
    try {
      await updateProfile({ avatar_url: newUrl });
    } catch (e) {
      console.error("Avatar update error:", e);
    }
  };

  const toggleLanguage = (lang) => {
    setLanguages(prev => 
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName,
        phone,
        age: Number(age),
        gender,
        occupation,
        organization,
        city,
        local_area: localArea,
        bio,
        budget_min: Number(budgetMin),
        budget_max: Number(budgetMax),
        host_type: hostType,
        properties_managed: propertiesManaged,
        languages,
        provides_rental_agreement: providesRentalAgreement,
        upi_id: upiId,
        whatsapp_number: whatsappNumber,
        contact_preference: contactPreference,
        calling_hours: callingHours,
        id_verification_type: idVerificationType,
        id_number_masked: idNumberMasked,
        emergency_contact_name: emergencyContactName,
        emergency_contact_relation: emergencyContactRelation,
        emergency_contact_phone: emergencyContactPhone,
        permanent_address: permanentAddress,
        lifestyle: {
          smoking,
          drinking,
          food_preference: foodPreference,
          sleep_schedule: sleepSchedule,
          cleanliness: Number(cleanliness),
          guests_allowed: guestsAllowed,
          pets_allowed: petsAllowed,
          noise_level: noiseLevel,
          work_from_home: workFromHome
        }
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerOTP = async () => {
    try {
      await sendOTP();
      setOtpModalOpen(true);
    } catch (e) {}
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setVerifying(true);
    try {
      await verifyOTP(otpInput);
      setOtpModalOpen(false);
      setOtpInput('');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Profile Header Hero Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#2a0614] via-[#21092e] to-[#0d1633] border border-rose-500/20 text-white shadow-soft-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
          <div className="relative group">
            <img
              src={getDisplayAvatar(user?.avatar_url, user?.email)}
              alt="avatar"
              onClick={() => setAvatarModalOpen(true)}
              className="w-24 h-24 rounded-3xl border-2 border-rose-300 dark:border-rose-500 object-cover shadow-lg bg-white/10 cursor-pointer group-hover:brightness-90 transition-all"
              onError={(e) => {
                e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.email || 'user')}`;
              }}
            />

            {/* Interactive Camera / Image Icon Badge Button */}
            <button
              type="button"
              onClick={() => setAvatarModalOpen(true)}
              className="absolute -bottom-1 -right-1 p-2 rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white shadow-lg border-2 border-[#2a0614] hover:scale-110 active:scale-95 transition-all cursor-pointer group/btn"
              title="Add or Change Profile Image"
            >
              <Camera className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
            </button>

            {/* Hover overlay hint */}
            <div
              onClick={() => setAvatarModalOpen(true)}
              className="absolute inset-0 rounded-3xl bg-black/45 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer text-white"
            >
              <Camera className="w-6 h-6 mb-1 drop-shadow" />
              <span className="text-[10px] font-black uppercase tracking-wider drop-shadow">Change</span>
            </div>

            {user?.is_phone_verified && (
              <span className="absolute -top-1 -right-1 p-1 bg-emerald-500 rounded-full border-2 border-[#2a0614]" title="Phone & Identity Verified">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
              </span>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-white">{user?.full_name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/30 text-rose-200 border border-rose-400/30">
                {user?.role === 'owner' ? 'Property Host / Lister' : 'Room Seeker'}
              </span>
              <button
                type="button"
                onClick={() => setAvatarModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 hover:bg-white/25 text-rose-200 hover:text-white border border-white/20 transition-all cursor-pointer shadow-xs"
              >
                <Camera className="w-3.5 h-3.5 text-rose-300" />
                <span>Upload Photo</span>
              </button>
            </div>
            <p className="text-xs text-slate-300 mt-1">{user?.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-xs text-slate-400">
              <span className="flex items-center text-rose-200 font-medium">
                <MapPin className="w-3.5 h-3.5 mr-1 text-rose-400" />
                {user?.city || "Pune"}{localArea ? ` • ${localArea}` : ''}
              </span>
              <span className="text-slate-500">•</span>
              <span className="flex items-center text-slate-300">
                <Clock className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                Calling: {callingHours}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-semibold flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                KYC: Verified
              </span>
            </div>
          </div>
        </div>

        {/* Verification Status Action */}
        <div className="shrink-0">
          {user?.is_phone_verified ? (
            <div className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Identity & Phone Verified</span>
            </div>
          ) : (
            <button
              onClick={handleTriggerOTP}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-md shadow-rose-500/30 transition-transform hover:-translate-y-0.5 active:scale-95 flex items-center space-x-2 cursor-pointer"
            >
              <Key className="w-4 h-4" />
              <span>Verify ID (Simulate OTP)</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs for Profile Categories */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'personal', label: 'Personal & Contact Info', icon: User },
          { id: 'owner', label: 'Owner & Host Credentials', icon: Building },
          { id: 'kyc', label: 'KYC & Emergency Contacts', icon: ShieldCheck },
          { id: 'lifestyle', label: 'Lifestyle Questionnaire', icon: Sparkles }
        ].map(tab => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-md shadow-rose-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* ========================================================= */}
        {/* TAB 1: PERSONAL & CONTACT INFORMATION                     */}
        {/* ========================================================= */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-6">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <User className="w-5 h-5 text-rose-600" />
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    Personal & Basic Identification
                  </h2>
                  <p className="text-xs text-slate-500">Essential resident & host credentials visible on listings and inquiries</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Deshmukh"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Registered Email (Account ID)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 text-xs font-semibold cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Mobile Phone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98220 12345"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Age</label>
                  <input
                    type="number"
                    min="18"
                    max="90"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold capitalize"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other / Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Occupation</label>
                  <select
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold capitalize"
                  >
                    <option value="working">Working Professional (IT / Corp)</option>
                    <option value="student">College / University Student</option>
                    <option value="business">Business Owner / Entrepreneur</option>
                    <option value="freelance">Freelance / Remote Consultant</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Company / Organization / College
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. TCS / Infosys / Pune University"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Primary Metro City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold cursor-pointer"
                  >
                    {METRO_CITIES.map(c => (
                      <option key={c.id} value={c.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                        {c.label} ({c.state})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Local Area / Neighborhood
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={localArea}
                      onChange={(e) => setLocalArea(e.target.value)}
                      placeholder="e.g. Baner, Hinjawadi Phase 1, Koramangala"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  About Me / Host Introduction (Bio)
                </label>
                <textarea
                  rows="3"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a welcoming introduction about yourself, your hospitality values, or your accommodation background..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Rent Expectation Min (₹/mo)</label>
                  <input
                    type="number"
                    step="500"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Rent Expectation Max (₹/mo)</label>
                  <input
                    type="number"
                    step="500"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Communication & Calling Preferences Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Phone className="w-5 h-5 text-indigo-600" />
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    Contact Channels & Availability Timings
                  </h2>
                  <p className="text-xs text-slate-500">Control when and how prospective residents can reach out to you</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp Number
                  </label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3.5 top-3 w-4 h-4 text-emerald-500" />
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="+91 98220 12345"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <label className="flex items-center space-x-2 mt-1.5 text-[11px] text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsPhone}
                      onChange={(e) => {
                        setSameAsPhone(e.target.checked);
                        if (e.target.checked) setWhatsappNumber(phone);
                      }}
                      className="rounded accent-rose-600"
                    />
                    <span>Same as primary mobile</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Contact Channel
                  </label>
                  <select
                    value={contactPreference}
                    onChange={(e) => setContactPreference(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="both">Both Calls & WhatsApp</option>
                    <option value="whatsapp">WhatsApp Preferred</option>
                    <option value="call">Direct Calls Preferred</option>
                    <option value="chat">In-App Messages Only (Privacy Protected)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Best Calling / Visit Slots
                  </label>
                  <select
                    value={callingHours}
                    onChange={(e) => setCallingHours(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="9:00 AM - 8:00 PM">9:00 AM - 8:00 PM (Regular Day)</option>
                    <option value="10:00 AM - 2:00 PM">10:00 AM - 2:00 PM (Morning Only)</option>
                    <option value="5:00 PM - 9:00 PM">5:00 PM - 9:00 PM (Post-Work Evening)</option>
                    <option value="10:00 AM - 9:00 PM">10:00 AM - 9:00 PM (Weekends & Evenings)</option>
                    <option value="Anytime Available">Anytime Available (24/7)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: OWNER & HOST CREDENTIALS                           */}
        {/* ========================================================= */}
        {activeTab === 'owner' && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-6">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Building className="w-5 h-5 text-rose-600" />
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    Property Owner & Hosting Details
                  </h2>
                  <p className="text-xs text-slate-500">Crucial information for prospective tenants assessing host credibility</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Host Category / Ownership Role
                  </label>
                  <select
                    value={hostType}
                    onChange={(e) => setHostType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="individual">Individual Property Owner (Landlord)</option>
                    <option value="property_manager">Authorized Property Manager / Caretaker</option>
                    <option value="pg_operator">PG Host / Hostel Warden</option>
                    <option value="flatmate">Existing Tenant Subletting / Flatmate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Properties Managed
                  </label>
                  <select
                    value={propertiesManaged}
                    onChange={(e) => setPropertiesManaged(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="1 Property">1 Property (Single Unit)</option>
                    <option value="2-4 Properties">2 to 4 Units / Apartments</option>
                    <option value="5+ Properties">5+ Properties / Commercial PG Chain</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    UPI ID for Rent / Advance Token
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. rahul.owner@okhdfcbank"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Direct token & rent collection without third-party commission</p>
                </div>
              </div>

              {/* Languages Spoken (Very important for multi-state Indian residents) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center">
                  <LangIcon className="w-4 h-4 mr-1.5 text-rose-600" />
                  Languages You Speak Fluently (Assists outstation residents)
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_LANGUAGES.map(lang => {
                    const isSelected = languages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center space-x-1.5 ${
                          isSelected
                            ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white border-transparent shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{lang}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Legal Assistance Checkbox */}
              <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/50">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={providesRentalAgreement}
                    onChange={(e) => setProvidesRentalAgreement(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded accent-rose-600 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center">
                      <FileText className="w-4 h-4 text-rose-600 mr-1.5" />
                      Provide Registered Rental Agreement & Police Verification Support
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Check this if you assist tenants with biometric e-registration, stamping, and police verification reports.
                    </p>
                  </div>
                </label>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: KYC, GOVERNMENT ID & EMERGENCY CONTACTS            */}
        {/* ========================================================= */}
        {activeTab === 'kyc' && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-6">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    Government ID (KYC) & Emergency Contacts
                  </h2>
                  <p className="text-xs text-slate-500">Required in real-world housing for lease compliance, safety, and mutual trust</p>
                </div>
              </div>

              {/* Govt ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Government ID Verification Document
                  </label>
                  <select
                    value={idVerificationType}
                    onChange={(e) => setIdVerificationType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="aadhaar">Aadhaar Card (UIDAI Verified)</option>
                    <option value="pan">Permanent Account Number (PAN Card)</option>
                    <option value="passport">Indian Passport</option>
                    <option value="voter_id">Voter Identity Card</option>
                    <option value="driving_license">Driving License</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Masked Document ID (For Public Trust)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={idNumberMasked}
                      onChange={(e) => setIdNumberMasked(e.target.value)}
                      placeholder="e.g. XXXX-XXXX-4589"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                      e-KYC Ready
                    </span>
                  </div>
                </div>
              </div>

              {/* Emergency Contact Information */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-rose-600">
                    Emergency Contact Person (Mandatory for Lease Agreements)
                  </h3>
                  <p className="text-[11px] text-slate-400">Co-owner, family kin, or local guardian to reach out to in emergencies</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      placeholder="e.g. Sunita Deshmukh"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Relationship
                    </label>
                    <select
                      value={emergencyContactRelation}
                      onChange={(e) => setEmergencyContactRelation(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                    >
                      <option value="Parent / Guardian">Parent / Guardian</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Property Co-owner">Property Co-owner</option>
                      <option value="Building Secretary / Caretaker">Building Secretary / Caretaker</option>
                      <option value="Friend">Trusted Friend</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Emergency Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        value={emergencyContactPhone}
                        onChange={(e) => setEmergencyContactPhone(e.target.value)}
                        placeholder="+91 98220 99887"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Permanent / Hometown Address */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Permanent Residential / Office Address (Used for Police Verification)
                </label>
                <textarea
                  rows="2"
                  value={permanentAddress}
                  onChange={(e) => setPermanentAddress(e.target.value)}
                  placeholder="Flat No, Building, Street, Landmark, City, State, PIN Code"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-rose-500"
                />
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: LIFESTYLE QUESTIONNAIRE                            */}
        {/* ========================================================= */}
        {activeTab === 'lifestyle' && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-5">
              <div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-rose-500" />
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    Lifestyle & Habits Questionnaire
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Used by our AI algorithm to compute accurate roommate compatibility match percentages (0–100%).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Diet / Food Preference</label>
                  <select
                    value={foodPreference}
                    onChange={(e) => setFoodPreference(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold capitalize"
                  >
                    <option value="any">Flexible / Any</option>
                    <option value="veg">Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                    <option value="vegan">Vegan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Smoking Habits</label>
                  <select
                    value={smoking}
                    onChange={(e) => setSmoking(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold capitalize"
                  >
                    <option value="never">Non-Smoker</option>
                    <option value="occasionally">Occasional Smoker</option>
                    <option value="regular">Regular Smoker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Drinking Habits</label>
                  <select
                    value={drinking}
                    onChange={(e) => setDrinking(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold capitalize"
                  >
                    <option value="never">Teetotaler / Never</option>
                    <option value="occasionally">Social Drinker</option>
                    <option value="regular">Regular</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Sleep Schedule</label>
                  <select
                    value={sleepSchedule}
                    onChange={(e) => setSleepSchedule(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="flexible">Flexible / Normal</option>
                    <option value="early_bird">Early Bird (Sleeps Early)</option>
                    <option value="night_owl">Night Owl (Works / Stays Up Late)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Guests Policy</label>
                  <select
                    value={guestsAllowed ? 'allowed' : 'restricted'}
                    onChange={(e) => setGuestsAllowed(e.target.value === 'allowed')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="allowed">Friends / Guests Allowed</option>
                    <option value="restricted">No Overnight Guests</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pet Friendliness</label>
                  <select
                    value={petsAllowed ? 'yes' : 'no'}
                    onChange={(e) => setPetsAllowed(e.target.value === 'yes')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="yes">Pet Friendly</option>
                    <option value="no">Strictly No Pets</option>
                  </select>
                </div>
              </div>

              {/* Cleanliness Slider */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Cleanliness Standard: <span className="text-rose-600 font-black">{cleanliness} / 5</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {cleanliness <= 2 ? 'Casual / Relaxed' : cleanliness === 3 ? 'Moderate / Standard' : 'Very Strict & Tidy'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={cleanliness}
                  onChange={(e) => setCleanliness(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer h-2"
                />
              </div>

              {/* WFH & Noise */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs font-bold text-slate-700 dark:text-slate-300">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={workFromHome}
                    onChange={(e) => setWorkFromHome(e.target.checked)}
                    className="w-4 h-4 rounded accent-rose-600 cursor-pointer"
                  />
                  <span>Work From Home (WFH Professional)</span>
                </label>

                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">Noise Level:</span>
                  <select
                    value={noiseLevel}
                    onChange={(e) => setNoiseLevel(e.target.value)}
                    className="text-xs font-bold bg-transparent border-b border-slate-300 dark:border-slate-700 focus:outline-none"
                  >
                    <option value="quiet">Quiet & Peaceful</option>
                    <option value="moderate">Moderate</option>
                    <option value="lively">Lively / Music OK</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Save Action Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400">All updates immediately sync with live listings and host inquiry cards.</p>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-2xl text-xs font-bold bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-md shadow-rose-500/25 transition-transform hover:-translate-y-0.5 active:scale-95 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Save All Details"}</span>
          </button>
        </div>

      </form>

      {/* Simulated Verification OTP Modal */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Verify Phone & Identity</h3>
            <p className="text-xs text-slate-500">
              For demo testing, enter OTP code <strong className="text-rose-600">123456</strong> below.
            </p>
            <form onSubmit={handleVerifySubmit} className="space-y-3">
              <input
                type="text"
                maxLength="6"
                required
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="123456"
                className="w-full text-center tracking-widest text-lg font-black py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOtpModalOpen(false)}
                  className="w-1/2 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifying}
                  className="w-1/2 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-soft cursor-pointer"
                >
                  {verifying ? "Verifying..." : "Confirm OTP"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Avatar / Profile Picture Upload Modal */}
      <AvatarUploadModal
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        currentAvatar={user?.avatar_url}
        userName={user?.full_name}
        userEmail={user?.email}
        userRole={user?.role}
        onAvatarUpdated={handleAvatarUpdated}
      />

    </div>
  );
}
