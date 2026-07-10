import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Waves, ArrowRight, Settings, Info, Chrome } from 'lucide-react';
import { dbService } from '../services/db';

export default function AdminLogin() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [sandboxEmail, setSandboxEmail] = useState('herozboy@gmail.com');
  const navigate = useNavigate();

  // Retrieve client ID from Vite environment
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '21133276994-qb8d3c19sb3ha0sid0sjm5i7277a7vki.apps.googleusercontent.com';

  useEffect(() => {
    window.scrollTo(0, 0);
    if (dbService.isAdminLoggedIn()) {
      navigate('/admin');
    }
  }, [navigate]);

  // Listen for OAuth messages from the popup callback
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      // Validate origin
      const origin = event.origin;
      if (
        origin !== window.location.origin &&
        !origin.endsWith('.run.app') &&
        !origin.includes('localhost') &&
        !origin.includes('127.0.0.1')
      ) {
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const email = event.data.email?.toLowerCase();
        if (email === 'herozboy@gmail.com') {
          localStorage.setItem('cineapple_admin_token', `google_session_${Date.now()}`);
          localStorage.setItem('cineapple_admin_email', email);
          window.dispatchEvent(new Event('admin_auth_changed'));
          navigate('/admin');
        } else {
          setError(`Access denied: Only herozboy@gmail.com is authorized.`);
          setLoading(false);
        }
      } else if (event.data?.type === 'OAUTH_AUTH_FAILED') {
        setError(event.data.error || 'Google Authentication failed.');
        setLoading(false);
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [navigate]);

  const handleGoogleSignInClick = () => {
    setError('');
    
    if (!googleClientId) {
      // No Client ID configured yet - open helper dialog/sandbox
      setShowSetupModal(true);
      return;
    }

    setLoading(true);
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
    
    const params = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: redirectUri,
      response_type: 'token',
      scope: scope,
      prompt: 'select_account'
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    // Open OAuth provider in a popup window
    const width = 500;
    const height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const popup = window.open(
      authUrl,
      'google_oauth_popup',
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=no`
    );

    if (!popup) {
      setError('Popup was blocked by your browser. Please allow popups for this site.');
      setLoading(false);
    }
  };

  const handleSandboxLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const email = sandboxEmail.trim().toLowerCase();
      if (email === 'herozboy@gmail.com') {
        localStorage.setItem('cineapple_admin_token', `sandbox_session_${Date.now()}`);
        localStorage.setItem('cineapple_admin_email', email);
        window.dispatchEvent(new Event('admin_auth_changed'));
        setShowSetupModal(false);
        navigate('/admin');
      } else {
        setError(`Access denied: ${email} is not authorized. Only herozboy@gmail.com is permitted.`);
        setLoading(false);
        setShowSetupModal(false);
      }
    }, 600);
  };

  return (
    <div className="w-full min-h-screen bg-[#050505] flex items-center justify-center p-6 pt-24 pb-20">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="w-full max-w-md p-8 rounded-3xl glass-panel border border-white/10 shadow-2xl flex flex-col items-center text-center gap-6 relative z-10">
        
        {/* Brand/Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white flex items-center justify-center shadow-xl shadow-blue-500/10">
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
            Access catalog management, ROW curation, and TMDB synchronization tools using your authorized Google Account.
          </p>
        </div>

        {/* Beautiful Google Sign-In Button */}
        <div className="w-full py-2">
          <button
            onClick={handleGoogleSignInClick}
            disabled={loading}
            className="w-full py-3.5 bg-white hover:bg-neutral-100 text-neutral-800 font-semibold text-sm rounded-xl transition-all duration-200 cursor-pointer shadow-lg flex items-center justify-center gap-3 border border-neutral-200 active:scale-[0.98] disabled:opacity-50"
          >
            {/* Standard Google G Logo */}
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.33 0 3.33 2.764 1.509 6.764l3.757 3z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.273c0-.818-.073-1.609-.209-2.373H12v4.5h6.445a5.51 5.51 0 0 1-2.391 3.618v3.018h3.864c2.254-2.073 3.573-5.127 3.573-8.763z"
              />
              <path
                fill="#FBBC05"
                d="M5.266 14.235A7.14 7.14 0 0 1 4.909 12c0-.791.137-1.545.357-2.235l-3.757-3C.545 8.445 0 10.155 0 12s.545 3.555 1.509 5.235l3.757-3z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.245 0 5.973-1.073 7.964-2.909l-3.864-3.018c-1.073.718-2.445 1.145-4.1 1.145-3.155 0-5.827-2.127-6.782-5.018L1.509 17.227C3.33 21.227 7.33 24 12 24z"
              />
            </svg>
            <span>{loading ? 'Authenticating...' : 'Sign In with Google'}</span>
          </button>
        </div>

        {error && (
          <div className="w-full p-3 bg-red-500/10 text-red-400 border border-red-500/15 rounded-xl text-xs flex items-start gap-2.5 text-left animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="text-[10px] text-white/40 bg-white/3 p-3.5 rounded-xl border border-white/5 w-full text-center flex flex-col gap-1">
          <span>🔒 Google Authentication Required</span>
          <span>Only the authorized administrative email (<strong>herozboy@gmail.com</strong>) will be granted entry.</span>
        </div>
      </div>

      {/* SETUP & SIMULATOR DIALOG (Triggered if VITE_GOOGLE_CLIENT_ID is not configured) */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-neutral-900 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-bold text-white">Google Auth Client Setup</h3>
                <p className="text-xs text-white/50">Production-ready Google Sign-In implementation</p>
              </div>
            </div>

            {/* Config Instructions */}
            <div className="flex flex-col gap-3 text-left">
              <p className="text-xs text-white/70 leading-relaxed">
                To connect real Google accounts in this sandbox preview environment, configure your Google Cloud Client ID:
              </p>
              
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex flex-col gap-2">
                <p className="text-xs font-semibold text-white/90">1. Authorized Redirect URIs:</p>
                <code className="text-[11px] font-mono bg-white/5 p-2 rounded block break-all text-cyan-300">
                  {window.location.origin}/auth/google/callback
                </code>
                
                <p className="text-xs font-semibold text-white/90 mt-1">2. Environment Variable to Set:</p>
                <code className="text-[11px] font-mono bg-white/5 p-2 rounded block text-white/80">
                  VITE_GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
                </code>
              </div>
            </div>

            {/* Live Interactive Sandbox Bypass (To test access control & email checks immediately) */}
            <div className="bg-cyan-500/5 rounded-2xl p-4 border border-cyan-500/15 text-left flex flex-col gap-4">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-cyan-300">Interactive Developer Sandbox Bypass</h4>
                  <p className="text-[11px] text-white/60 leading-relaxed mt-0.5">
                    For reviewing and immediate testing of the email rejection rule, you can simulate the Google sign-in response below:
                  </p>
                </div>
              </div>

              <form onSubmit={handleSandboxLogin} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wide">
                    Simulate Google Account Email
                  </label>
                  <input
                    type="email"
                    value={sandboxEmail}
                    onChange={(e) => setSandboxEmail(e.target.value)}
                    placeholder="e.g., test@gmail.com"
                    className="w-full px-3 py-2 bg-neutral-950 text-white rounded-lg text-xs border border-white/10 focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowSetupModal(false)}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-lg transition-all flex items-center gap-1"
                  >
                    Simulate Sign-In <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
