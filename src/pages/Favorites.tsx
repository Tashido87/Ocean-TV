/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { Movie, Series } from '../types';
import MovieCard from '../components/MovieCard';
import { Heart, PlayCircle, Library, Eye, SlidersHorizontal } from 'lucide-react';

export default function Favorites() {
  const [favorites, setFavorites] = useState<(Movie | Series)[]>([]);
  const [recentViews, setRecentViews] = useState<(Movie | Series)[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();

    window.addEventListener('storage', loadData);
    window.addEventListener('database_updated', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('database_updated', loadData);
    };
  }, []);

  const loadData = () => {
    // Load favorites
    const favIds = dbService.getFavorites();
    const allMovies = dbService.getMovies();
    const allSeries = dbService.getSeries();

    const favItems: (Movie | Series)[] = [];
    favIds.forEach(id => {
      const matchMovie = allMovies.find(m => m.id === id);
      if (matchMovie) {
        favItems.push(matchMovie);
      } else {
        const matchSeries = allSeries.find(s => s.id === id);
        if (matchSeries) favItems.push(matchSeries);
      }
    });
    setFavorites(favItems);

    // Load recently viewed
    const recentIds = dbService.getRecentlyViewed();
    const recentItems: (Movie | Series)[] = [];
    recentIds.forEach(id => {
      const matchMovie = allMovies.find(m => m.id === id);
      if (matchMovie) {
        recentItems.push(matchMovie);
      } else {
        const matchSeries = allSeries.find(s => s.id === id);
        if (matchSeries) recentItems.push(matchSeries);
      }
    });
    setRecentViews(recentItems);
  };

  const handleClearFavorites = () => {
    dbService.clearFavorites();
  };

  const handleClearRecent = () => {
    localStorage.setItem('cineapple_recent', JSON.stringify([]));
    setRecentViews([]);
  };

  return (
    <div className="w-full bg-apple-gray-900 min-h-screen pt-28 pb-8 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col gap-12 text-left">
        
        {/* FAVORITES BLOCK */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
                My Favorites
              </h1>
              <span className="text-xs font-black bg-red-600/20 text-red-400 px-2.5 py-1 rounded-full border border-red-500/10 ml-2">
                {favorites.length} Items
              </span>
            </div>

            {favorites.length > 0 && (
              <button
                onClick={handleClearFavorites}
                className="text-xs font-bold text-apple-gray-300 hover:text-white px-3.5 py-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
              >
                Clear Favorites List
              </button>
            )}
          </div>

          {favorites.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-8">
              {favorites.map((item) => {
                const isMovie = 'runtime' in item;
                return (
                  <div key={item.id} className="flex justify-center">
                    <MovieCard item={item} type={isMovie ? 'movie' : 'series'} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center py-20 text-center glass-panel rounded-3xl border border-white/5">
              <Heart className="w-12 h-12 text-white/20 mb-4" />
              <h3 className="text-lg font-bold text-white mb-1">Your Favorites List is Empty</h3>
              <p className="text-sm text-apple-gray-300 max-w-sm px-6">
                Explore our curated library and press the favorite heart button on details and hero banners to build your watchlists!
              </p>
            </div>
          )}
        </div>

        {/* RECENTLY VIEWED / CONTINUE BROWSING BLOCK */}
        <div className="flex flex-col gap-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <Eye className="w-6 h-6 text-white/80" />
              <h2 className="font-sans font-semibold text-xl sm:text-2xl text-white tracking-tight">
                Recently Viewed
              </h2>
              <span className="text-xs font-semibold bg-white/10 text-white/70 px-2 py-0.5 rounded-md border border-white/5 ml-2">
                Continue Browsing
              </span>
            </div>

            {recentViews.length > 0 && (
              <button
                onClick={handleClearRecent}
                className="text-xs font-bold text-apple-gray-300 hover:text-white px-3.5 py-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
              >
                Clear Browsing History
              </button>
            )}
          </div>

          {recentViews.length > 0 ? (
            <div className="flex gap-4 sm:gap-6 overflow-x-auto hide-scrollbar scroll-smooth py-3 px-1">
              {recentViews.map((item) => {
                const isMovie = 'runtime' in item;
                return (
                  <div key={`recent-${item.id}`} className="flex-shrink-0">
                    <MovieCard item={item} type={isMovie ? 'movie' : 'series'} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center py-16 text-center glass-panel rounded-3xl border border-white/5">
              <Library className="w-12 h-12 text-white/20 mb-4" />
              <h3 className="text-sm font-bold text-white mb-1">No browsing history</h3>
              <p className="text-xs text-apple-gray-300 max-w-xs px-6">
                Your recently viewed film and series detail pages will appear here.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
