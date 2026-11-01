import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Mail, Lock, Phone, Sparkles, ArrowRight, Eye, 
  EyeOff, ShieldCheck, CheckCircle2, KeyRound, Smartphone 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, sendQuickOtp } = useAuth();

  // Mode: 'email' or 'mobile'
  const [loginMethod, setLoginMethod] = useState('mobile'); // 'mobile' or 'email'
  
  // Mobile login sub-mode: 'password' or 'otp'
  const [mobileAuthType, setMobileAuthType] = useState('password'); // 'password' or 'otp'

  // Input States
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [sendingReset, setSendingReset] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSendOtp = async () => {
    const cleanDigits = phone.replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number first.");
      return;
    }
    setSendingOtp(true);
    try {
      await sendQuickOtp(cleanDigits);
      setOtpSent(true);
      setOtp('123456'); // auto-fill demo OTP for user convenience
    } catch (err) {
      // toast shown in context
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const identifier = loginMethod === 'mobile' ? phone.trim() : email.trim();
    if (!identifier) {
      toast.error(`Please enter your ${loginMethod === 'mobile' ? 'mobile number' : 'email address'}.`);
      setLoading(false);
      return;
    }

    try {
      let loggedInUser;
      if (loginMethod === 'mobile' && mobileAuthType === 'otp') {
        if (!otp.trim()) {
          toast.error("Please enter the 6-digit OTP code.");
          setLoading(false);
          return;
        }
        loggedInUser = await login(identifier, null, otp.trim());
      } else {
        if (!password) {
          toast.error("Please enter your account password.");
          setLoading(false);
          return;
        }
        loggedInUser = await login(identifier, password);
      }

      // Smooth redirection strictly for Host or Seeker
      if (loggedInUser.role === 'owner') {
        navigate('/dashboard/lister');
      } else {
        navigate(from === '/' ? '/explore' : from);
      }
    } catch (err) {
      // error toast handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (roleType) => {
    if (roleType === 'owner') {
      if (loginMethod === 'mobile') {
        setPhone('9822011223');
        setPassword('Owner@12345');
      } else {
        setEmail('owner@myhouse.com');
        setPassword('Owner@12345');
      }
      toast.success("Loaded Demo Host / Lister credentials");
    } else {
      if (loginMethod === 'mobile') {
        setPhone('9765433221');
        setPassword('Seeker@12345');
      } else {
        setEmail('seeker@myhouse.com');
        setPassword('Seeker@12345');
      }
      toast.success("Loaded Demo Room Seeker credentials");
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setSendingReset(true);
    try {
      const res = await apiClient.post('/auth/forgot-password', { email: forgotEmail });
      toast.success(res.data.message || "Reset link generated!");
      if (res.data.dev_reset_token) {
        toast(`Dev reset link: /reset-password?token=${res.data.dev_reset_token}`, { duration: 6000 });
      }
      setForgotOpen(false);
    } catch (err) {
      toast.error("Failed to send reset link.");
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-7 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-soft-lg space-y-6">
        
        {/* Shiny Header */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <BrandLogo size="lg" to="/" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in as a <strong>Host</strong> or <strong>Seeker</strong> to browse properties & schedule visits
          </p>
        </div>

        {/* 1-Click Demo Logins (Admin completely removed) */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
              ⚡ 1-Click Fast Demo Login
            </span>
            <span className="text-[10px] text-slate-400">Customer Accounts</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('owner')}
              className="py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 hover:bg-rose-100 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>🏡 Host / Lister</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('seeker')}
              className="py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 hover:bg-indigo-100 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>🔍 Room Seeker</span>
            </button>
          </div>
        </div>

        {/* Login Method Switcher Tabs (Mobile Number vs Email) */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setLoginMethod('mobile')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              loginMethod === 'mobile'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Number</span>
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod('email')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              loginMethod === 'email'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Address</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Mobile Login Field */}
          {loginMethod === 'mobile' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number
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

              {/* Sub-toggle: Password vs OTP Login */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-semibold text-slate-500">Sign in with:</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setMobileAuthType('password')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      mobileAuthType === 'password'
                        ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileAuthType('otp')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      mobileAuthType === 'otp'
                        ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Fast OTP
                  </button>
                </div>
              </div>

              {/* If Mobile OTP mode */}
              {mobileAuthType === 'otp' && (
                <div className="space-y-2 pt-1 animate-in fade-in">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Enter 6-Digit OTP
                    </label>
                    <button
                      type="button"
                      disabled={sendingOtp}
                      onClick={handleSendOtp}
                      className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline disabled:opacity-50"
                    >
                      {sendingOtp ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP to Mobile"}
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 123456"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-black tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 mr-1 shrink-0" />
                    <span>Demo verification code: <strong className="text-slate-700 dark:text-slate-200">123456</strong></span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Email Login Field */}
          {loginMethod === 'email' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          )}

          {/* Password Field (when using password in either Email or Mobile mode) */}
          {(loginMethod === 'email' || (loginMethod === 'mobile' && mobileAuthType === 'password')) && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
            </div>
          )}

          {/* Remember Me */}
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <span className="font-medium">Remember this device</span>
            </label>
            <span className="text-[11px] text-slate-400">Zero Brokerage</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-md shadow-rose-500/25 transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>{loading ? "Signing in..." : "Sign In to Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-rose-600 dark:text-rose-400 hover:underline">
            Register as Host or Seeker
          </Link>
        </p>

      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Reset Password</h3>
            <p className="text-xs text-slate-500">
              Enter your registered email address to receive a secure password reset link (simulated in dev console).
            </p>
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  className="w-1/2 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingReset}
                  className="w-1/2 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-soft"
                >
                  {sendingReset ? "Sending..." : "Send Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
