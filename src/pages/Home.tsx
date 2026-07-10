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
    let itemsList: (Movie | Series)[] = [];
    if (section.type === 'movies') {
      itemsList = movies;
    } else if (section.type === 'series') {
      itemsList = series;
    } else {
      itemsList = [...movies, ...series];
    }

    let filtered = [...itemsList];

    // 1. Filter by listType
    switch (section.listType) {
      case 'trending':
        if (!section.sortBy || section.sortBy === 'none') {
          filtered.sort((a, b) => b.rating - a.rating);
        }
        break;

      case 'popular':
        filtered = filtered.filter(item => item.rating >= 7.5);
        if (!section.sortBy || section.sortBy === 'none') {
          filtered.sort((a, b) => b.rating - a.rating);
        }
        break;

      case 'recently_added':
        if (!section.sortBy || section.sortBy === 'none') {
          filtered.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
        }
        break;

      case 'editors_picks':
        filtered = filtered.filter(item => (item as any).featured || (item as any).heroBanner);
        break;

      case 'genre':
        if (section.value) {
          const val = section.value.trim().toLowerCase();
          filtered = filtered.filter(item => 
            item.genres?.some(g => g.toLowerCase() === val)
          );
        }
        break;

      case 'language':
        if (section.value) {
          const val = section.value.trim().toLowerCase();
          filtered = filtered.filter(item => 
            item.language?.toLowerCase() === val
          );
        }
        break;

      case 'custom':
        if (section.value) {
          const ids = section.value.split(',').map(id => id.trim());
          filtered = filtered.filter(item => ids.includes(item.id));
        } else {
          filtered = [];
        }
        break;

      default:
        break;
    }

    // 2. Apply Custom Sorting override if specified
    if (section.sortBy && section.sortBy !== 'none') {
      if (section.sortBy === 'latest') {
        filtered.sort((a, b) => {
          const yearA = parseInt(a.releaseYear) || 0;
          const yearB = parseInt(b.releaseYear) || 0;
          if (yearB !== yearA) {
            return yearB - yearA;
          }
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        });
      } else if (section.sortBy === 'popular') {
        filtered.sort((a, b) => b.rating - a.rating);
      }
    }

    return filtered.slice(0, 15);
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
