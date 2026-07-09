/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link } from 'react-router-dom';
import { Waves } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-apple-gray-900 py-12 px-6 md:px-12 mt-16 text-sm text-apple-gray-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-blue-600 to-cyan-400 text-white flex items-center justify-center">
            <Waves className="w-4 h-4" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-white">
            Ocean TV
          </span>
          <span className="text-apple-gray-400 text-xs ml-2">
            © 2026 Ocean TV Immersive Style Library
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs font-medium text-apple-gray-400">
          <Link to="/" className="hover:text-white transition-colors duration-200">Home</Link>
          <Link to="/movies" className="hover:text-white transition-colors duration-200">Movies</Link>
          <Link to="/series" className="hover:text-white transition-colors duration-200">TV Shows</Link>
          <Link to="/search" className="hover:text-white transition-colors duration-200">Search</Link>
          <Link to="/favorites" className="hover:text-white transition-colors duration-200">My Favorites</Link>
          <Link to="/admin" className="hover:text-white transition-colors duration-200 text-red-400/80 hover:text-red-400">Admin Control</Link>
        </div>

        <div className="text-center md:text-right text-xs text-apple-gray-400">
          Curated Myanmar & English Subtitles Movie Library
        </div>
      </div>
    </footer>
  );
}
