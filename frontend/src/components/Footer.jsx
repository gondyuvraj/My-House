import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, MapPin, Mail, Phone } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-slate-950 via-[#0c1222] to-[#070b14] text-slate-300 pt-16 pb-12 border-t border-rose-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="lg" to="/" />
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              India's premier modern housing network for finding verified PG accommodations, single rooms, flats, and lifestyle-matched roommates across 6 prime metro hubs.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center"><Shield className="w-4 h-4 text-emerald-400 mr-1" /> 100% Verified Hosts</span>
              <span className="flex items-center"><Sparkles className="w-4 h-4 text-rose-400 mr-1" /> Zero Commission Direct</span>
            </div>
          </div>

          {/* Popular Cities */}
          <div>
            <h4 className="text-white text-xs font-black tracking-widest uppercase mb-4 text-rose-400">Popular Cities</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/explore?city=Pune" className="hover:text-rose-400 transition-colors">Pune (Baner, Hinjawadi)</Link></li>
              <li><Link to="/explore?city=Mumbai" className="hover:text-rose-400 transition-colors">Mumbai (Bandra, Powai)</Link></li>
              <li><Link to="/explore?city=Bengaluru" className="hover:text-rose-400 transition-colors">Bengaluru (Koramangala)</Link></li>
              <li><Link to="/explore?city=Delhi" className="hover:text-rose-400 transition-colors">Delhi NCR (Hauz Khas)</Link></li>
              <li><Link to="/explore?city=Hyderabad" className="hover:text-rose-400 transition-colors">Hyderabad (HITEC City)</Link></li>
              <li><Link to="/explore?city=Chennai" className="hover:text-rose-400 transition-colors">Chennai (Adyar, OMR)</Link></li>
              <li><Link to="/explore?city=Kolkata" className="hover:text-rose-400 transition-colors">Kolkata (Salt Lake, New Town)</Link></li>
              <li><Link to="/explore?city=Jaipur" className="hover:text-rose-400 transition-colors">Jaipur (Malviya Nagar, Mansarovar)</Link></li>
              <li><Link to="/explore?city=Kochi" className="hover:text-rose-400 transition-colors">Kochi (Kakkanad Infopark)</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-black tracking-widest uppercase mb-4 text-rose-400">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/explore" className="hover:text-rose-400 transition-colors">Search All PGs</Link></li>
              <li><Link to="/roommates" className="hover:text-rose-400 transition-colors">Roommate Matcher</Link></li>
              <li><Link to="/post-listing" className="hover:text-rose-400 transition-colors">List Your Property</Link></li>
              <li><Link to="/wishlist" className="hover:text-rose-400 transition-colors">Saved Wishlist</Link></li>
              <li><Link to="/login" className="hover:text-rose-400 transition-colors">Owner Login</Link></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-white text-xs font-black tracking-widest uppercase mb-4 text-rose-400">Support & Trust</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center"><Mail className="w-4 h-4 text-rose-400 mr-2 shrink-0" /> support@myhouse.in</li>
              <li className="flex items-center"><Phone className="w-4 h-4 text-rose-400 mr-2 shrink-0" /> +91 (020) 4123 9900</li>
              <li className="flex items-center"><MapPin className="w-4 h-4 text-rose-400 mr-2 shrink-0" /> Baner High Street, Pune</li>
            </ul>
            <div className="mt-4 p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/25 text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                24/7 Safety Helpdesk
              </span>
              <p className="text-slate-400 text-[11px] mt-1">Community escalation hotline available round the clock for residents.</p>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} My House Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span className="hover:text-rose-400 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-rose-400 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-rose-400 cursor-pointer transition-colors">Safety Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
