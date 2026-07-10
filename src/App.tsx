/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import Movies from './pages/Movies';
import Series from './pages/Series';
import MovieDetail from './pages/MovieDetail';
import SeriesDetail from './pages/SeriesDetail';
import Actor from './pages/Actor';
import Director from './pages/Director';
import Search from './pages/Search';
import Favorites from './pages/Favorites';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import GoogleCallback from './pages/GoogleCallback';
import { AlertTriangle } from 'lucide-react';

function NotFoundPage() {
  return (
    <div className="w-full min-h-screen bg-apple-gray-900 flex flex-col items-center justify-center text-center p-6 pt-24">
      <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4 animate-pulse" />
      <h1 className="font-display font-extrabold text-3xl text-white tracking-tight mb-2">
        Page Not Found
      </h1>
      <p className="text-sm text-apple-gray-300 max-w-sm mb-8 leading-relaxed">
        The cinematic route you are attempting to view does not exist. Return home to browse our high-contrast Apple TV collection.
      </p>
      <a
        href="/"
        className="px-6 py-2.5 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-white/90 transition-all cursor-pointer shadow-lg"
      >
        Return to Home
      </a>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-apple-gray-900 text-apple-gray-50 selection:bg-white selection:text-black">
        {/* Apple TV Sticky Navigation */}
        <Navigation />

        {/* Core Layout Routed Pages */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/series" element={<Series />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/series/:id" element={<SeriesDetail />} />
            <Route path="/actor/:id" element={<Actor />} />
            <Route path="/director/:name" element={<Director />} />
            <Route path="/search" element={<Search />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            
            {/* Fallbacks */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />
      </div>
    </Router>
  );
}
