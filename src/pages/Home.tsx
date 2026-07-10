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
    window.addEventListener('database_updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('database_updated', handleStorageUpdate);
    };
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
    <div className="w-full bg-apple-gray-900 pb-6">
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


    </div>
  );
}
