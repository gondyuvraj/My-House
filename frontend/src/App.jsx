import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Explore from './pages/Explore';
import ListingDetail from './pages/ListingDetail';
import Roommates from './pages/Roommates';
import Chat from './pages/Chat';
import Wishlist from './pages/Wishlist';
import SeekerDashboard from './pages/SeekerDashboard';
import ListerDashboard from './pages/ListerDashboard';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import PostListing from './pages/PostListing';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3500,
                  className: 'text-xs font-bold rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-white',
                  style: {
                    borderRadius: '16px',
                    padding: '12px 16px',
                  }
                }}
              />
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/listings/:id" element={<ListingDetail />} />
                  <Route path="/roommates" element={<Roommates />} />
                  
                  {/* Protected Routes */}
                  <Route path="/chat" element={
                    <ProtectedRoute><Chat /></ProtectedRoute>
                  } />
                  <Route path="/wishlist" element={
                    <ProtectedRoute><Wishlist /></ProtectedRoute>
                  } />
                  <Route path="/dashboard/seeker" element={
                    <ProtectedRoute><SeekerDashboard /></ProtectedRoute>
                  } />
                  <Route path="/dashboard/lister" element={
                    <ProtectedRoute><ListerDashboard /></ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute requireAdmin={true}><Admin /></ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute><Profile /></ProtectedRoute>
                  } />
                  <Route path="/post-listing" element={
                    <ProtectedRoute><PostListing /></ProtectedRoute>
                  } />

                  {/* Public Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
