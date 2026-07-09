import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, KeyRound, AlertCircle, Waves, ArrowRight } from 'lucide-react';
import { dbService } from '../services/db';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (dbService.isAdminLoggedIn()) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network delay for a high-fidelity interaction feel
    setTimeout(() => {
      const result = dbService.loginAdmin(email, pin);
      if (result.success) {
        window.dispatchEvent(new Event('admin_auth_changed'));
        navigate('/admin');
      } else {
        setError(result.error || 'Authentication failed.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="w-full min-h-screen bg-[#050505] flex items-center justify-center p-6 pt-24 pb-20">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="w-full max-w-md p-8 rounded-3xl glass-panel border border-white/10 shadow-2xl flex flex-col items-center text-center gap-6 relative z-10">
        
        {/* Brand/Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white flex items-center justify-center shadow-xl shadow-blue-500/10 animate-fade-in">
            <Waves className="w-7 h-7" />
          </div>
          <div className="mt-2">
            <h2 className="font-display font-extrabold text-2xl text-white tracking-tighter">
              ocean<span className="font-light opacity-85 text-white/95">tv</span><span className="font-light text-cyan-400/90 ml-0.5">+</span>
            </h2>
            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mt-1">
              Secure Admin Gateway
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 -mt-2">
          <h1 className="text-lg font-bold text-white tracking-tight">
            Sign In to Control Panel
          </h1>
          <p className="text-xs text-white/60">
            Access catalog management, ROW curation, and TMDB synchronization tools
          </p>
        </div>

        <form onSubmit={handleLoginSubmit} className="w-full flex flex-col gap-4 text-left">
          {/* Email input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-white/40 tracking-wider uppercase pl-1">
              Authorized Gmail
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. herozboy@gmail.com"
                className="w-full pl-11 pr-4 py-3 bg-white/5 focus:bg-white/10 text-white rounded-xl text-sm border border-white/5 focus:border-cyan-500/40 focus:outline-none transition-all placeholder:text-white/20"
                required
              />
            </div>
          </div>

          {/* Passcode/PIN input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-white/40 tracking-wider uppercase pl-1">
              Admin Passcode
            </label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-white/5 focus:bg-white/10 text-white rounded-xl text-sm border border-white/5 focus:border-cyan-500/40 focus:outline-none transition-all placeholder:text-white/20"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/15 rounded-xl text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white hover:bg-white/90 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-[10px] text-white/40 bg-white/3 p-3.5 rounded-xl border border-white/5 w-full text-center">
          🔑 Security Notice: Only authorized administrative accounts are permitted.
        </div>
      </div>
    </div>
  );
}
