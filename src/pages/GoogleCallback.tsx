import React, { useEffect } from 'react';

export default function GoogleCallback() {
  useEffect(() => {
    // Parse Google response from URL hash (implicit grant flow)
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    const error = params.get('error');

    if (error) {
      if (window.opener) {
        window.opener.postMessage(
          { type: 'OAUTH_AUTH_FAILED', error: `Google Auth Error: ${error}` },
          '*'
        );
        window.close();
      }
      return;
    }

    if (!accessToken) {
      // Try search params as fallback
      const searchParams = new URLSearchParams(window.location.search);
      const queryError = searchParams.get('error');
      if (window.opener) {
        window.opener.postMessage(
          { type: 'OAUTH_AUTH_FAILED', error: queryError ? `Google Auth Error: ${queryError}` : 'No access token received from Google.' },
          '*'
        );
        window.close();
      }
      return;
    }

    // Fetch authenticated user's profile from Google APIs
    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to retrieve user profile from Google.');
        }
        return res.json();
      })
      .then((data) => {
        const email = data.email?.trim().toLowerCase();
        
        if (email === 'herozboy@gmail.com') {
          // Authorized successfully
          localStorage.setItem('cineapple_admin_token', `google_session_${Date.now()}`);
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', email }, '*');
            window.close();
          } else {
            window.location.href = '/admin';
          }
        } else {
          // Reject other emails
          if (window.opener) {
            window.opener.postMessage(
              { type: 'OAUTH_AUTH_FAILED', error: `Access denied: ${email || 'this account'} is not authorized. Only herozboy@gmail.com is permitted.` },
              '*'
            );
            window.close();
          } else {
            window.location.href = '/admin-login?error=unauthorized';
          }
        }
      })
      .catch((err) => {
        if (window.opener) {
          window.opener.postMessage({ type: 'OAUTH_AUTH_FAILED', error: err.message }, '*');
          window.close();
        }
      });
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-sm text-white/60">Completing secure Google Sign-In...</p>
    </div>
  );
}
