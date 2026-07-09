/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { dbService } from '../services/db';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard';
import { SlidersHorizontal, Search, RotateCcw, LayoutGrid } from 'lucide-react';

export default function Movies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedRating, setSelectedRating] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    window.scrollTo(0, 0);
    setMovies(dbService.getMovies());
  }, []);

  // Extract unique genres, years, and languages for filtering options
  const genresList = useMemo(() => {
    const list = new Set<string>();
    movies.forEach(m => m.genres?.forEach(g => list.add(g)));
    return ['All', ...Array.from(list)];
  }, [movies]);

  const yearsList = useMemo(() => {
    const list = new Set<string>();
    movies.forEach(m => {
      if (m.releaseYear) list.add(m.releaseYear);
    });
    return ['All', ...Array.from(list).sort((a, b) => b.localeCompare(a))];
  }, [movies]);

  const languagesList = useMemo(() => {
    const list = new Set<string>();
    movies.forEach(m => {
      if (m.language) list.add(m.language);
    });
    return ['All', ...Array.from(list)];
  }, [movies]);

  // Handle resets
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedGenre('All');
    setSelectedYear('All');
    setSelectedRating('All');
    setSelectedLanguage('All');
    setSortBy('newest');
  };

  // Filter and sort computation
  const filteredAndSortedMovies = useMemo(() => {
    let result = [...movies];

    // Search filter
    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        m =>
          m.title.toLowerCase().includes(query) ||
          m.originalTitle?.toLowerCase().includes(query) ||
          m.director.toLowerCase().includes(query)
      );
    }

    // Genre filter
    if (selectedGenre !== 'All') {
      result = result.filter(m => m.genres?.includes(selectedGenre));
    }

    // Year filter
    if (selectedYear !== 'All') {
      result = result.filter(m => m.releaseYear === selectedYear);
    }

    // Rating filter
    if (selectedRating !== 'All') {
      const minRating = parseFloat(selectedRating);
      result = result.filter(m => m.rating >= minRating);
    }

    // Language filter
    if (selectedLanguage !== 'All') {
      result = result.filter(m => m.language === selectedLanguage);
    }

    // Sort sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.releaseDate || b.addedAt).getTime() - new Date(a.releaseDate || a.addedAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.releaseDate || a.addedAt).getTime() - new Date(b.releaseDate || b.addedAt).getTime();
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [movies, searchTerm, selectedGenre, selectedYear, selectedRating, selectedLanguage, sortBy]);

  return (
    <div className="w-full bg-apple-gray-900 min-h-screen pt-28 pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Page Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
              <LayoutGrid className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
                Explore Movies
              </h1>
              <p className="text-xs sm:text-sm text-apple-gray-300 font-medium">
                Browse our curated catalogue of films with English & Myanmar subtitles
              </p>
            </div>
          </div>

          <div className="text-sm font-semibold text-white/50 bg-white/5 px-4 py-2 rounded-full border border-white/5 self-start">
            Total Movies: <span className="text-white">{filteredAndSortedMovies.length}</span>
          </div>
        </div>

        {/* Filter and Search Panel */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/8 flex flex-col gap-6 shadow-2xl">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch">
            {/* Live Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search movies by title, director, or story..."
                className="w-full pl-11 pr-4 py-3 bg-white/5 focus:bg-white/8 text-white rounded-xl text-sm border border-white/5 focus:border-white/20 focus:outline-none transition-all placeholder:text-white/35 font-medium"
              />
            </div>

            {/* SorBy Select */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-apple-gray-300 tracking-wider uppercase whitespace-nowrap">
                Sort By
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-apple-gray-800 text-white border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-white/20 cursor-pointer min-w-[150px]"
              >
                <option value="newest">Newest Releases</option>
                <option value="oldest">Oldest Releases</option>
                <option value="rating">Highest Rated</option>
                <option value="alphabetical">Alphabetical (A-Z)</option>
              </select>

              <button
                onClick={handleResetFilters}
                className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/5 transition-colors"
                title="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Categorized Dropdown Selectors */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-2 border-t border-white/5">
            {/* Genre Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-apple-gray-300 tracking-wider uppercase">Genre</label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="bg-apple-gray-800/60 text-white/80 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-white/20 cursor-pointer"
              >
                {genresList.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-apple-gray-300 tracking-wider uppercase">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-apple-gray-800/60 text-white/80 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-white/20 cursor-pointer"
              >
                {yearsList.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-apple-gray-300 tracking-wider uppercase">Min Rating</label>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="bg-apple-gray-800/60 text-white/80 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-white/20 cursor-pointer"
              >
                <option value="All">All Ratings</option>
                <option value="8.5">8.5+ Stellar</option>
                <option value="8.0">8.0+ Highly Rated</option>
                <option value="7.0">7.0+ Recommended</option>
                <option value="6.0">6.0+ Good</option>
              </select>
            </div>

            {/* Language Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-apple-gray-300 tracking-wider uppercase">Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-apple-gray-800/60 text-white/80 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-white/20 cursor-pointer"
              >
                {languagesList.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Movies Grid */}
        {filteredAndSortedMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-8 mt-4">
            {filteredAndSortedMovies.map((movie) => (
              <div key={movie.id} className="flex justify-center">
                <MovieCard item={movie} type="movie" />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center py-24 text-center glass-panel rounded-3xl border border-white/5">
            <SlidersHorizontal className="w-12 h-12 text-white/20 mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">No movies match your filters</h3>
            <p className="text-sm text-apple-gray-300 max-w-md px-6">
              Try readjusting your selection criteria, resetting the filter values, or typing a different search query.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-6 px-5 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-white/90 transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
