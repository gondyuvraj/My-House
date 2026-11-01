import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('myhouse_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('myhouse_access_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await apiClient.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('myhouse_user', JSON.stringify(res.data));
        } catch (err) {
          console.error("Failed to restore session:", err);
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (identifier, password, otp = null) => {
    try {
      const payload = {
        identifier,
        email: identifier.includes('@') ? identifier : undefined,
        phone: !identifier.includes('@') ? identifier : undefined,
        password: password || undefined,
        otp: otp || undefined
      };
      const res = await apiClient.post('/auth/login', payload);
      const { access_token, refresh_token, user: userData } = res.data;
      localStorage.setItem('myhouse_access_token', access_token);
      localStorage.setItem('myhouse_refresh_token', refresh_token);
      localStorage.setItem('myhouse_user', JSON.stringify(userData));
      setToken(access_token);
      setUser(userData);
      toast.success(`Welcome back, ${userData.full_name}!`);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.detail || "Invalid email, phone number, or password.";
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const sendQuickOtp = async (phoneOrEmail) => {
    try {
      const res = await apiClient.post('/auth/send-quick-otp', { phone_or_email: phoneOrEmail });
      toast.success(res.data.message || "OTP code sent (123456)");
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to send OTP.";
      toast.error(msg);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await apiClient.post('/auth/register', userData);
      const { access_token, refresh_token, user: registeredUser } = res.data;
      localStorage.setItem('myhouse_access_token', access_token);
      localStorage.setItem('myhouse_refresh_token', refresh_token);
      localStorage.setItem('myhouse_user', JSON.stringify(registeredUser));
      setToken(access_token);
      setUser(registeredUser);
      toast.success("Account created successfully!");
      return registeredUser;
    } catch (err) {
      const msg = err.response?.data?.detail || "Registration failed.";
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('myhouse_access_token');
    localStorage.removeItem('myhouse_refresh_token');
    localStorage.removeItem('myhouse_user');
    setToken(null);
    setUser(null);
    toast.success("Logged out successfully");
  };

  const updateProfile = async (updates) => {
    try {
      const res = await apiClient.put('/users/profile', updates);
      setUser(res.data);
      localStorage.setItem('myhouse_user', JSON.stringify(res.data));
      toast.success("Profile updated successfully!");
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to update profile";
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const sendOTP = async () => {
    try {
      const res = await apiClient.post('/auth/send-otp');
      toast.success(res.data.message || "OTP sent! Check your console/phone (Code: 123456)");
      return res.data;
    } catch (err) {
      toast.error("Failed to send verification code");
      throw err;
    }
  };

  const verifyOTP = async (otp) => {
    try {
      const res = await apiClient.post('/auth/verify-otp', { otp });
      // Refresh profile
      const userRes = await apiClient.get('/auth/me');
      setUser(userRes.data);
      localStorage.setItem('myhouse_user', JSON.stringify(userRes.data));
      toast.success("Identity verified successfully!");
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.detail || "Invalid verification code";
      toast.error(msg);
      throw new Error(msg);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isOwner: user?.role === 'owner' || user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
        sendOTP,
        verifyOTP,
        sendQuickOtp
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

