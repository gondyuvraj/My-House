import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home, Mail, Lock, User, Phone, MapPin, Sparkles, 
  Eye, EyeOff, ShieldCheck, Check, Smartphone, Building, 
  Search, ArrowRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import { METRO_CITIES } from '../utils/geoData';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Registration primary method: 'mobile' or 'email'
  const [registerMethod, setRegisterMethod] = useState('mobile'); // 'mobile' or 'email'

  // Role: Strictly 'seeker' or 'owner' (Admin removed completely)
  const [role, setRole] = useState('seeker'); // 'seeker' or 'owner'

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Pune');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Compute password strength
  const getPasswordStrength = () => {
    if (!password) return { score: 0, text: '', color: 'bg-slate-200' };
    if (password.length < 6) return { score: 1, text: 'Too short (min 6 chars)', color: 'bg-red-500' };
    const hasNum = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (password.length >= 8 && hasNum && hasSpecial) {
      return { score: 3, text: 'Strong password', color: 'bg-emerald-500' };
    }
    if (password.length >= 6 && (hasNum || hasSpecial)) {
      return { score: 2, text: 'Good password', color: 'bg-amber-500' };
    }
    return { score: 1, text: 'Weak', color: 'bg-rose-400' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreeTerms) {
      toast.error("Please agree to the Terms of Service to create an account.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (registerMethod === 'mobile') {
      if (!cleanPhone || cleanPhone.length < 10) {
        toast.error("Please enter a valid 10-digit mobile number.");
        return;
      }
    } else {
      if (!email.trim() || !email.includes('@')) {
        toast.error("Please enter a valid email address.");
        return;
      }
    }

    setLoading(true);
    try {
      const registeredUser = await register({
        full_name: fullName.trim(),
        email: email.trim() || undefined,
        phone: cleanPhone ? `+91 ${cleanPhone.slice(-10)}` : undefined,
        password,
        role, // strictly 'seeker' or 'owner'
        city
      });

      // Role-based onboarding navigation
      if (registeredUser.role === 'owner') {
        navigate('/dashboard/lister');
      } else {
        navigate('/explore');
      }
    } catch (err) {
      // toast shown in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-7 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-soft-lg space-y-6">
        
        {/* Shiny Header */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <BrandLogo size="lg" to="/" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            India's modern platform for verified PGs, rooms, and compatible flatmates
          </p>
        </div>

        {/* Customer Role Selection: Strictly Seeker vs Host */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            I am joining as:
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Seeker Option */}
            <button
              type="button"
              onClick={() => setRole('seeker')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                role === 'seeker'
                  ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {role === 'seeker' && (
                <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-black text-slate-900 dark:text-white">Room Seeker</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                Find PGs, private rooms, and compatible flatmates.
              </p>
              <span className="inline-block mt-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                ✓ 0% Brokerage
              </span>
            </button>

            {/* Host / Lister Option */}
            <button
              type="button"
              onClick={() => setRole('owner')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                role === 'owner'
                  ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 ring-2 ring-rose-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {role === 'owner' && (
                <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span className="text-xs font-black text-slate-900 dark:text-white">Host / Lister</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                List accommodations, approve visits, and manage tenants.
              </p>
              <span className="inline-block mt-2 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                ✓ Verified Tenants
              </span>
            </button>
          </div>
        </div>

        {/* Registration Method Switcher: Mobile vs Email */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setRegisterMethod('mobile')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              registerMethod === 'mobile'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Register with Mobile</span>
          </button>
          <button
            type="button"
            onClick={() => setRegisterMethod('email')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              registerMethod === 'email'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Register with Email</span>
          </button>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Rohit Sharma"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Conditional Primary Field: Mobile vs Email */}
          {registerMethod === 'mobile' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Primary Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 overflow-hidden focus-within:ring-2 focus-within:ring-rose-500">
                <span className="flex items-center px-3 text-xs font-bold bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="98220 12345"
                  className="w-full px-3.5 py-2.5 bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Primary Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rohit@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          )}

          {/* Secondary Field (Optional) */}
          {registerMethod === 'mobile' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address <span className="text-[10px] text-slate-400 font-normal">(Optional for invoices & receipts)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rohit@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Number <span className="text-[10px] text-slate-400 font-normal">(Optional for instant visit alerts)</span>
              </label>
              <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 overflow-hidden focus-within:ring-2 focus-within:ring-rose-500">
                <span className="flex items-center px-3 text-xs font-bold bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="98220 12345"
                  className="w-full px-3.5 py-2.5 bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* City Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Primary City
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
              >
                {METRO_CITIES.map(c => (
                  <option key={c.id} value={c.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    {c.label}, {c.state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Password with Show/Hide Toggle & Strength Meter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Create Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-1.5 space-y-1">
                <div className="flex h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${strength.color} ${
                    strength.score === 1 ? 'w-1/3' : strength.score === 2 ? 'w-2/3' : 'w-full'
                  }`} />
                </div>
                <span className="text-[10px] font-semibold text-slate-500">
                  Strength: {strength.text}
                </span>
              </div>
            )}
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="flex items-start space-x-2 pt-1 text-xs text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              id="agreeTerms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            <label htmlFor="agreeTerms" className="text-[11px] leading-snug cursor-pointer">
              I agree to My House <strong>Terms of Service</strong> and <strong>Zero-Brokerage Guarantee</strong>.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-md shadow-rose-500/25 transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>{loading ? "Creating Account..." : `Complete Registration as ${role === 'owner' ? 'Host' : 'Seeker'}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-rose-600 dark:text-rose-400 hover:underline">
            Sign In with Mobile or Email
          </Link>
        </p>

      </div>
    </div>
  );
}
