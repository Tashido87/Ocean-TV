/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Film, Tv, User, Loader2, ArrowRight, Play } from 'lucide-react';
import { dbService } from '../services/db';
import { tmdbService } from '../services/tmdb';
import { Movie, Series } from '../types';
import MovieCard from '../components/MovieCard';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [localMovies, setLocalMovies] = useState<Movie[]>([]);
  const [localSeries, setLocalSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'movies' | 'series' | 'actors'>('all');

  useEffect(() => {
    window.scrollTo(0, 0);
    setLocalMovies(dbService.getMovies());
    setLocalSeries(dbService.getSeries());
  }, []);

  // Fetch live autocomplete suggestions from TMDB as the user types (debounced)
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await tmdbService.searchMulti(query);
        // limit to top 8 suggestions
        setSuggestions(results.slice(0, 8));
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Compute local matches
  const localMatches = useMemo(() => {
    if (query.trim() === '') return { movies: [], series: [] };
    const q = query.toLowerCase();

    const matchedMovies = localMovies.filter(
      m =>
        m.title.toLowerCase().includes(q) ||
        m.originalTitle?.toLowerCase().includes(q) ||
        m.genres.some(g => g.toLowerCase().includes(q)) ||
        m.customStory.toLowerCase().includes(q)
    );

    const matchedSeries = localSeries.filter(
      s =>
        s.title.toLowerCase().includes(q) ||
        s.originalTitle?.toLowerCase().includes(q) ||
        s.genres.some(g => g.toLowerCase().includes(q)) ||
        s.customStory.toLowerCase().includes(q)
    );

    return { movies: matchedMovies, series: matchedSeries };
  }, [query, localMovies, localSeries]);

  // Compute TMDB matching actors from the suggestions
  const tmdbActors = useMemo(() => {
    return suggestions.filter(item => item.media_type === 'person');
  }, [suggestions]);

  const hasResults =
    localMatches.movies.length > 0 ||
    localMatches.series.length > 0 ||
    tmdbActors.length > 0;

  return (
    <div className="w-full bg-apple-gray-900 min-h-screen pt-28 pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col gap-8 text-left">
        
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            Search
          </h1>
          <p className="text-sm text-apple-gray-300">
            Find movies, TV shows, directors, or actors in our database and live TMDB indexing
          </p>
        </div>

        {/* Big Apple TV-Style Search Bar */}
        <div className="relative w-full max-w-4xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, genre, director, or cast member..."
            className="w-full pl-16 pr-12 py-4 sm:py-5 bg-white/5 focus:bg-white/10 text-white rounded-2xl text-lg sm:text-xl border border-white/5 focus:border-white/20 focus:outline-none transition-all placeholder:text-white/30 font-medium"
            autoFocus
          />
          {loading && (
            <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/40 animate-spin" />
          )}
        </div>

        {query.trim().length >= 2 && (
          <>
            {/* Category Tab Row */}
            <div className="flex gap-2 border-b border-white/5 pb-4 mt-2 overflow-x-auto hide-scrollbar">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                All Results
              </button>
              <button
                onClick={() => setActiveTab('movies')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'movies'
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                Movies ({localMatches.movies.length})
              </button>
              <button
                onClick={() => setActiveTab('series')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'series'
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                TV Series ({localMatches.series.length})
              </button>
              <button
                onClick={() => setActiveTab('actors')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'actors'
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                Actors ({tmdbActors.length})
              </button>
            </div>

            {/* Results Display */}
            {hasResults ? (
              <div className="flex flex-col gap-10 mt-4">
                
                {/* MOVIES MATCHES ROW */}
                {(activeTab === 'all' || activeTab === 'movies') && localMatches.movies.length > 0 && (
                  <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-black text-white/40 tracking-wider uppercase flex items-center gap-2">
                      <Film className="w-4 h-4" /> Matched Movies
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-8">
                      {localMatches.movies.map(movie => (
                        <MovieCard key={movie.id} item={movie} type="movie" />
                      ))}
                    </div>
                  </div>
                )}

                {/* SERIES MATCHES ROW */}
                {(activeTab === 'all' || activeTab === 'series') && localMatches.series.length > 0 && (
                  <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-black text-white/40 tracking-wider uppercase flex items-center gap-2">
                      <Tv className="w-4 h-4" /> Matched TV Series
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-8">
                      {localMatches.series.map(show => (
                        <MovieCard key={show.id} item={show} type="series" />
                      ))}
                    </div>
                  </div>
                )}

                {/* ACTORS/PEOPLE MATCHES ROW */}
                {(activeTab === 'all' || activeTab === 'actors') && tmdbActors.length > 0 && (
                  <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-black text-white/40 tracking-wider uppercase flex items-center gap-2">
                      <User className="w-4 h-4" /> Found Actors & Filmmakers (TMDB)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                      {tmdbActors.map(person => (
                        <Link
                          key={person.id}
                          to={`/actor/${person.id}`}
                          className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col items-center text-center gap-3 hover:border-white/20 hover:scale-103 transition-all cursor-pointer shadow-md"
                        >
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-white/10 bg-apple-gray-800 flex-shrink-0">
                            {person.profile_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
                                alt={person.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-apple-gray-800 text-white/30">
                                <User className="w-10 h-10" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white leading-tight truncate max-w-[130px]">
                              {person.name}
                            </h4>
                            <span className="text-[10px] font-black tracking-widest text-white/40 uppercase mt-1 block">
                              {person.known_for_department || 'Acting'}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="w-full flex flex-col items-center justify-center py-24 text-center glass-panel rounded-3xl border border-white/5 mt-4">
                <Search className="w-12 h-12 text-white/20 mb-4" />
                <h3 className="text-lg font-bold text-white mb-1">No matches found</h3>
                <p className="text-sm text-apple-gray-300 max-w-md px-6 leading-relaxed">
                  We couldn't locate any records matching "<span className="font-bold text-white">{query}</span>" in our files or TMDB directory. Check spelling or try simpler search terms.
                </p>
              </div>
            )}
          </>
        )}

        {/* Popular Genres / Suggestions Box when search is empty */}
        {query.trim().length < 2 && (
          <div className="flex flex-col gap-6 mt-4">
            <h3 className="text-sm font-black text-white/40 tracking-wider uppercase">
              Popular Search Categories
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {['Sci-Fi', 'Action', 'Adventure', 'Drama', 'Mystery', 'Animation', 'Crime', 'Thriller', 'Apple TV+', 'HBO'].map((keyword) => (
                <button
                  key={keyword}
                  onClick={() => setQuery(keyword)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-white/80" />
                  {keyword}
                </button>
              ))}
            </div>

            {/* Quick Informational Tips */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 max-w-xl mt-6 flex gap-4 items-start shadow-lg">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-yellow-400">
                <User className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-1 text-xs sm:text-sm">
                <h4 className="font-bold text-white">Full-Range TMDB Indexing</h4>
                <p className="text-apple-gray-300 leading-relaxed">
                  Start typing the name of any actor (e.g. "Timothée Chalamet" or "Robert Pattinson") and our search bar will fetch their full biographic profile and movie history directly from TMDB API.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
