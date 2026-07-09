/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '../types';
import { dbService } from '../services/db';

interface HeroCarouselProps {
  movies: Movie[];
}

export default function HeroCarousel({ movies }: HeroCarouselProps) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(dbService.getFavorites());
  }, []);

  // Automatic transition every 8 seconds
  useEffect(() => {
    if (movies.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % movies.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [movies]);

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[activeIndex];

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dbService.toggleFavorite(id);
    setFavorites(dbService.getFavorites());
  };

  const isFavorited = favorites.includes(currentMovie.id);

  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? movies.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev === movies.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full h-[60vh] sm:h-[80vh] md:h-[95vh] overflow-hidden bg-apple-gray-900">
      {/* Background Backdrops with Fade Animation */}
      {movies.map((movie, idx) => (
        <div
          key={movie.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            idx === activeIndex ? 'opacity-100 z-0' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={movie.backdropPath}
            alt={movie.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top scale-102 filter brightness-[0.85]"
          />
        </div>
      ))}

      {/* Cinematic Vignette Overlays (Signature Apple TV Feel) */}
      <div className="absolute inset-0 vignette-overlay z-1" />
      <div className="absolute inset-0 vignette-side z-1 hidden md:block" />

      {/* Manual Slider Arrows (visible on hover) */}
      {movies.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/40 hover:bg-white text-white hover:text-black backdrop-blur-md border border-white/10 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-all duration-300 shadow-xl"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/40 hover:bg-white text-white hover:text-black backdrop-blur-md border border-white/10 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-all duration-300 shadow-xl"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Content Area */}
      <div className="absolute bottom-0 left-0 w-full z-10 px-6 md:px-12 pb-12 sm:pb-16 md:pb-24">
        <div className="max-w-4xl flex flex-col items-start gap-4 sm:gap-6">
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-white/90">
            <span className="px-2.5 py-0.5 rounded bg-white/15 backdrop-blur-md border border-white/10 text-[10px] font-black tracking-widest uppercase">
              FEATURED
            </span>
            <div className="flex items-center gap-1.5 text-yellow-400">
              <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
              <span>{Number(currentMovie.rating).toFixed(1)}</span>
            </div>
            <span>•</span>
            <span>{currentMovie.releaseYear}</span>
            <span>•</span>
            <span>{currentMovie.runtime} min</span>
            <span>•</span>
            <span className="text-white/60">{currentMovie.genres.join(', ')}</span>
          </div>

          {/* Animated Movie Title */}
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-7xl tracking-tight text-white leading-none">
            {currentMovie.title}
          </h1>

          {/* Short Description */}
          <p className="font-sans text-sm sm:text-base md:text-lg text-apple-gray-200/90 leading-relaxed max-w-2xl line-clamp-3 sm:line-clamp-none drop-shadow">
            {currentMovie.customStory}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 w-full sm:w-auto mt-2">
            <button
              onClick={() => navigate(`/movie/${currentMovie.id}`)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide bg-white text-black hover:bg-white/90 transition-all duration-300 shadow-xl hover:shadow-white/10 hover:scale-103 cursor-pointer"
            >
              <Play className="w-4.5 h-4.5 fill-black stroke-black" />
              View Info
            </button>

            <button
              onClick={(e) => handleToggleFavorite(currentMovie.id, e)}
              className={`p-3.5 rounded-xl flex items-center justify-center border transition-all duration-300 cursor-pointer shadow-xl hover:scale-103 ${
                isFavorited
                  ? 'bg-red-600/95 border-red-600 text-white shadow-red-600/20'
                  : 'bg-black/40 border-white/10 text-white hover:bg-white/10'
              }`}
              title={isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-white stroke-white' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Indicator Dots */}
      {movies.length > 1 && (
        <div className="absolute bottom-6 right-6 md:right-12 z-10 flex gap-2">
          {movies.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
