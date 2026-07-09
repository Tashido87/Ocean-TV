/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Movie, Series } from '../types';
import MovieCard from './MovieCard';

interface MovieCarouselProps {
  key?: string | number;
  title: string;
  items: (Movie | Series)[];
  type: 'movie' | 'series' | 'movies';
  badgeText?: string;
}

export default function MovieCarousel({ title, items, type, badgeText }: MovieCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  
  const normalizedType = type === 'movies' ? 'movie' : type;

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setShowLeft(scrollLeft > 10);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      // Run initial check
      checkScroll();
      // Handle resize
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [items]);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const { clientWidth } = containerRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
      containerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="relative group/carousel my-8 px-6 md:px-12">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-sans font-semibold text-lg sm:text-2xl tracking-tight text-white/95">
          {title}
        </h2>
        {badgeText && (
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-black text-white/80 tracking-wider uppercase flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-yellow-400" />
            {badgeText}
          </span>
        )}
      </div>

      {/* Carousel Wrapper */}
      <div className="relative">
        {/* Left Arrow Button */}
        {showLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-[-20px] top-[40%] -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/60 hover:bg-white text-white hover:text-black flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg scale-0 group-hover/carousel:scale-100 transition-all duration-300"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Right Arrow Button */}
        {showRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-[-20px] top-[40%] -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/60 hover:bg-white text-white hover:text-black flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg scale-0 group-hover/carousel:scale-100 transition-all duration-300"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Horizontal Scroll Area */}
        <div
          ref={containerRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto hide-scrollbar scroll-smooth py-3 px-1 snap-x snap-mandatory"
        >
          {items.map((item, index) => (
            <div key={item.id || index} className="snap-start">
              <MovieCard item={item} type={normalizedType} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
