/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Subtitles } from 'lucide-react';
import { Movie, Series } from '../types';

interface MovieCardProps {
  key?: string | number;
  item: Movie | Series;
  type: 'movie' | 'series' | 'both';
}

export default function MovieCard({ item, type }: MovieCardProps) {
  const isMovie = type === 'both' ? !('seasons' in item) : type === 'movie';
  const rating = item.rating ? Number(item.rating).toFixed(1) : 'N/A';
  
  // Custom badges for subtitle availability
  const renderSubtitleBadge = () => {
    if (!item.subtitleType || item.subtitleType === 'None') return null;
    let label = '';
    let colorClass = '';

    if (item.subtitleType === 'Myanmar') {
      label = 'MM';
      colorClass = 'bg-amber-500/90 text-black';
    } else if (item.subtitleType === 'English') {
      label = 'EN';
      colorClass = 'bg-blue-500/90 text-white';
    } else {
      label = 'MM + EN';
      colorClass = 'bg-emerald-500/95 text-black';
    }

    return (
      <span className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase flex items-center gap-1 shadow-md ${colorClass}`}>
        <Subtitles className="w-2.5 h-2.5" />
        {label}
      </span>
    );
  };

  return (
    <Link
      to={isMovie ? `/movie/${item.id}` : `/series/${item.id}`}
      className="group flex flex-col gap-3 w-[150px] sm:w-[200px] flex-shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/80 rounded-2xl"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-apple-gray-800 border border-white/5 shadow-md group-hover:shadow-2xl group-hover:scale-104 group-hover:border-white/20 transition-all duration-400 ease-out">
        <img
          src={item.posterPath}
          alt={item.title}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
        />

        {/* Highlight/Gleam Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Floating Rating Badge */}
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-bold text-yellow-400 flex items-center gap-1 shadow-md border border-white/5">
          <Star className="w-3 h-3 fill-yellow-400 stroke-yellow-400" />
          {rating}
        </div>

        {/* Subtitle Badge */}
        {renderSubtitleBadge()}

        {/* Quick View Frosted Bottom Bar */}
        <div className="absolute bottom-0 left-0 w-full p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-black/50 backdrop-blur-md border-t border-white/10 flex flex-col justify-end">
          <span className="text-[10px] font-bold text-white/60 tracking-wider uppercase">
            {isMovie ? 'Movie' : 'TV Series'}
          </span>
          <span className="text-xs font-semibold text-white truncate">
            {item.genres?.slice(0, 2).join(' • ')}
          </span>
        </div>
      </div>

      {/* Info below the poster */}
      <div className="flex flex-col px-1.5">
        <h3 className="font-sans font-semibold text-sm sm:text-base text-white/90 group-hover:text-white truncate transition-colors duration-200">
          {item.title}
        </h3>
        <p className="font-sans text-[11px] sm:text-xs text-apple-gray-300 font-medium mt-0.5">
          {isMovie ? `${(item as Movie).runtime}m` : `${(item as Series).seasons?.length || 1} Season`} • {item.releaseYear}
        </p>
      </div>
    </Link>
  );
}
