/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film, Tv, Search, Heart, ShieldAlert, LogOut, Menu, X, Waves } from 'lucide-react';
import { dbService } from '../services/db';

export default function Navigation() {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAdmin = () => {
      setIsAdmin(dbService.isAdminLoggedIn());
    };
    checkAdmin();

    // Listen for custom login/logout events to update navigation instantly
    window.addEventListener('admin_auth_changed', checkAdmin);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('admin_auth_changed', checkAdmin);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    dbService.logoutAdmin();
    setIsAdmin(false);
    window.dispatchEvent(new Event('admin_auth_changed'));
  };

  const navItems = [
    { label: 'Home', path: '/', icon: Film },
    { label: 'Movies', path: '/movies', icon: Film },
    { label: 'Series', path: '/series', icon: Tv },
    { label: 'Search', path: '/search', icon: Search },
    { label: 'Favorites', path: '/favorites', icon: Heart },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled || mobileMenuOpen
          ? 'glass-nav py-3'
          : 'bg-gradient-to-b from-black/80 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <span className="font-display font-extrabold text-xl tracking-tighter text-white">
            ocean <span className="font-light opacity-85 text-white/95">tv</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-5 py-1.5 rounded-full text-sm font-medium tracking-wide transition-all duration-300 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-black font-semibold shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-4 h-4 opacity-70" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Controls (Admin / Status) */}
        <div className="hidden md:flex items-center gap-3">
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Link
                to="/admin"
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 transition-all duration-300 shadow-lg shadow-red-600/20"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Admin Panel
              </Link>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-200"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden w-full h-[calc(100vh-60px)] flex flex-col justify-between p-6 bg-apple-gray-900/98 backdrop-blur-xl animate-fade-in border-t border-white/5">
          <div className="flex flex-col gap-4 mt-6">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-4 rounded-2xl flex items-center gap-4 text-base font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-white text-black shadow-lg'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5 opacity-80" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {isAdmin && (
            <div className="mb-8 border-t border-white/5 pt-6 flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-center font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/25"
                >
                  <ShieldAlert className="w-5 h-5" />
                  Go to Admin Panel
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-center font-semibold text-white/80 hover:text-white flex items-center justify-center gap-2 border border-white/5 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
