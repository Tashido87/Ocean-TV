/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { Movie, Series, HomeSection } from '../types';
import HeroCarousel from '../components/HeroCarousel';
import MovieCarousel from '../components/MovieCarousel';

export default function Home() {
  const [heroMovies, setHeroMovies] = useState<Movie[]>([]);
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Series[]>([]);

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    const loadData = () => {
      const allMovies = dbService.getMovies();
      const allSeries = dbService.getSeries();
      const allSections = dbService.getHomeSections();

      setMovies(allMovies);
      setSeries(allSeries);
      setSections(allSections.filter(s => s.isVisible));

      // Get movies configured for the Hero Banner
      const heroes = allMovies.filter(m => m.heroBanner);
      // Fallback if no hero movies selected
      if (heroes.length === 0 && allMovies.length > 0) {
        setHeroMovies([allMovies[0]]);
      } else {
        setHeroMovies(heroes);
      }
    };

    loadData();

    // Reload data if database changes
    const handleStorageUpdate = () => {
      loadData();
    };
    window.addEventListener('storage', handleStorageUpdate);
    return () => window.removeEventListener('storage', handleStorageUpdate);
  }, []);

  // Resolves the list of movies/series for a specific section
  const resolveSectionItems = (section: HomeSection) => {
    const isMovies = section.type === 'movies';
    const itemsList = isMovies ? movies : series;

    switch (section.listType) {
      case 'trending':
        return [...itemsList].sort((a, b) => b.rating - a.rating).slice(0, 10);

      case 'popular':
        return [...itemsList].filter(item => item.rating >= 7.5).slice(0, 10);

      case 'recently_added':
        return [...itemsList]
          .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
          .slice(0, 10);

      case 'editors_picks':
        return [...itemsList].filter(item => item.featured).slice(0, 10);

      case 'genre':
        return [...itemsList]
          .filter(item => item.genres?.includes(section.value || ''))
          .slice(0, 10);

      case 'custom':
        if (!section.value) return [];
        const ids = section.value.split(',').map(id => id.trim());
        return itemsList.filter(item => ids.includes(item.id));

      default:
        return [];
    }
  };

  return (
    <div className="w-full bg-apple-gray-900 pb-20">
      {/* Cinematic Hero Slider */}
      {heroMovies.length > 0 && <HeroCarousel movies={heroMovies} />}

      {/* Dynamic Scrolling Sections */}
      <div className="relative z-10 -mt-16 sm:-mt-24 md:-mt-28 flex flex-col gap-4">
        {sections.map((section) => {
          const items = resolveSectionItems(section);
          if (items.length === 0) return null;

          return (
            <MovieCarousel
              key={section.id}
              title={section.title}
              items={items}
              type={section.type}
              badgeText={section.listType === 'editors_picks' ? "Editor's Pick" : undefined}
            />
          );
        })}
      </div>

      {/* Additional Branding Card */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-16">
        <div className="relative overflow-hidden rounded-3xl glass-panel p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10 shadow-2xl">
          <div className="flex flex-col items-start gap-3 max-w-xl">
            <span className="text-[10px] font-black tracking-widest text-white/50 uppercase">
              APPLE TV COMPANION
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-white leading-tight tracking-tight">
              Curate Your Cinematic Atmosphere
            </h2>
            <p className="font-sans text-sm sm:text-base text-apple-gray-300">
              Browse cinematic masterworks, explore aggregates, and track your favorites with our premium polished interface. Ready for desktop, mobile, and server environments.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex -space-x-3 overflow-hidden">
              <img className="inline-block h-12 w-12 rounded-full ring-2 ring-apple-gray-900 object-cover" src="https://image.tmdb.org/t/p/w500/c9X0ZALvImK8R0NfK2g87isIsfG.jpg" alt="" />
              <img className="inline-block h-12 w-12 rounded-full ring-2 ring-apple-gray-900 object-cover" src="https://image.tmdb.org/t/p/w500/6t29Tshn6F6vMhX1S3E6gGMyS0G.jpg" alt="" />
              <img className="inline-block h-12 w-12 rounded-full ring-2 ring-apple-gray-900 object-cover" src="https://image.tmdb.org/t/p/w500/6v7bYgTIsMyZ1mshX6Tq1YcT2gI.jpg" alt="" />
            </div>
            <span className="text-sm font-semibold text-white/80">
              1,000+ Synchronized Metadata Entries
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
