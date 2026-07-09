/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { dbService } from '../services/db';
import { Series } from '../types';
import { Play, Heart, Star, Subtitles, Share2, Calendar, Clock, Globe, ArrowLeft, Tv, Layers, AlertCircle } from 'lucide-react';
import MovieCarousel from '../components/MovieCarousel';

export default function SeriesDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [series, setSeries] = useState<Series | null>(null);
  const [relatedSeries, setRelatedSeries] = useState<Series[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedSeasonIdx, setSelectedSeasonIdx] = useState(0);

  useEffect(() => {
    if (!id) return;
    
    // Scroll to top
    window.scrollTo(0, 0);

    const loadSeries = () => {
      const item = dbService.getSeriesItem(id);
      if (item) {
        setSeries(item);
        setIsFavorited(dbService.isFavorite(item.id));
        setSelectedSeasonIdx(0);
        
        // Track recently viewed
        dbService.addToRecentlyViewed(item.id);

        // Find related series (sharing a genre)
        const allSeries = dbService.getSeries();
        const related = allSeries.filter(
          s => s.id !== item.id && s.genres.some(g => item.genres.includes(g))
        );
        setRelatedSeries(related);
      } else {
        setSeries(null);
      }
    };

    loadSeries();
  }, [id]);

  const handleToggleFavorite = () => {
    if (!series) return;
    const res = dbService.toggleFavorite(series.id);
    setIsFavorited(res);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!series) {
    return (
      <div className="w-full min-h-screen bg-apple-gray-900 flex flex-col items-center justify-center text-center p-6">
        <AlertCircle className="w-16 h-16 text-white/20 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Series Not Found</h2>
        <p className="text-apple-gray-300 mb-6 max-w-sm">
          The requested television show could not be loaded. It may have been removed by an administrator.
        </p>
        <button
          onClick={() => navigate('/series')}
          className="px-6 py-2.5 bg-white text-black font-bold text-sm rounded-xl hover:bg-white/90 transition-all cursor-pointer"
        >
          Back to Series
        </button>
      </div>
    );
  }

  const currentSeason = series.seasons?.[selectedSeasonIdx] || null;

  return (
    <div className="w-full bg-apple-gray-900 min-h-screen pb-20">
      
      {/* Background Backdrop */}
      <div className="relative w-full h-[50vh] sm:h-[65vh] md:h-[80vh] overflow-hidden">
        <img
          src={series.backdropPath}
          alt={series.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top filter brightness-[0.7] blur-[1px]"
        />
        <div className="absolute inset-0 vignette-overlay z-1" />
        <div className="absolute inset-0 vignette-side z-1 hidden md:block" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-24 left-6 md:left-12 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 hover:bg-white text-white hover:text-black backdrop-blur-md border border-white/10 transition-all cursor-pointer text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Main Panel */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-24 sm:-mt-36 md:-mt-48 relative z-10 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Poster Grid Frame */}
        <div className="w-48 sm:w-64 md:w-80 flex-shrink-0 mx-auto lg:mx-0 rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-[2/3] bg-apple-gray-800">
          <img
            src={series.posterPath}
            alt={series.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info Matrix */}
        <div className="flex-1 flex flex-col gap-6 w-full text-left">
          
          <div className="flex flex-col gap-2">
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl text-white tracking-tight leading-tight">
              {series.title}
            </h1>
            {series.originalTitle && series.originalTitle !== series.title && (
              <h2 className="text-lg sm:text-xl font-medium text-apple-gray-300 font-sans tracking-tight">
                Original Title: {series.originalTitle}
              </h2>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm font-semibold text-apple-gray-300 border-y border-white/5 py-4">
            <div className="flex items-center gap-1 text-yellow-400">
              <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
              <span>{Number(series.rating).toFixed(1)}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-white/50" />
              <span>Air Date: {series.releaseYear}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Tv className="w-4 h-4 text-white/50" />
              <span>Network: {series.network}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-white/50" />
              <span>{series.language}</span>
            </div>
            <span>•</span>
            <span className="text-emerald-400 uppercase tracking-wider font-extrabold text-[11px]">
              {series.status}
            </span>
          </div>

          {/* Subtitle Matrix Row */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-2 text-sm font-bold text-white shadow-md">
              <Subtitles className="w-4.5 h-4.5 text-emerald-400" />
              <span>Myanmar & Eng Subs Available</span>
            </div>

            <button
              onClick={handleToggleFavorite}
              className={`px-5 py-3 rounded-xl flex items-center gap-2 text-sm font-bold transition-all duration-300 shadow-md cursor-pointer ${
                isFavorited
                  ? 'bg-red-600 border border-red-600 text-white'
                  : 'bg-black/30 border border-white/10 text-white hover:bg-white/10'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-white stroke-white' : ''}`} />
              {isFavorited ? 'Favorited' : 'Add to Favorites'}
            </button>

            <button
              onClick={handleShare}
              className="px-5 py-3 rounded-xl bg-black/30 hover:bg-white/10 border border-white/10 text-white text-sm font-bold flex items-center gap-2 transition-all duration-300 shadow-md cursor-pointer relative"
            >
              <Share2 className="w-4 h-4" />
              <span>{copied ? 'Link Copied!' : 'Share Series'}</span>
            </button>
          </div>

          {/* Story Summary Module */}
          <div className="flex flex-col gap-2.5 mt-2 bg-white/3 p-6 rounded-2xl border border-white/5 shadow-inner">
            <h3 className="text-xs font-black text-white/40 tracking-wider uppercase">
              Story Summary (Curated manually)
            </h3>
            <p className="font-sans text-sm sm:text-base text-apple-gray-100 leading-relaxed font-medium">
              {series.customStory || "No story summary available. Write one in the Admin Dashboard."}
            </p>
          </div>

          {/* Specs */}
          <div className="flex flex-wrap gap-2">
            {series.genres?.map(g => (
              <span key={g} className="px-3.5 py-1.5 rounded-full bg-apple-gray-800 border border-white/5 text-xs font-semibold text-white/80">
                {g}
              </span>
            ))}
          </div>

        </div>
      </div>

      {/* Seasons & Episodes Tab Selector Section */}
      {series.seasons && series.seasons.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 md:px-12 mt-16 text-left">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5.5 h-5.5 text-white/80" />
              <h2 className="font-sans font-semibold text-xl sm:text-2xl text-white tracking-tight">
                Seasons & Episode Guide
              </h2>
            </div>

            {/* Season Selector Tabs */}
            <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
              {series.seasons.map((season, sIdx) => (
                <button
                  key={season.seasonNumber}
                  onClick={() => setSelectedSeasonIdx(sIdx)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    sIdx === selectedSeasonIdx
                      ? 'bg-white text-black shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {season.name || `Season ${season.seasonNumber}`}
                </button>
              ))}
            </div>
          </div>

          {/* Episode Grid Matrix */}
          {currentSeason && currentSeason.episodes && currentSeason.episodes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentSeason.episodes.map((ep) => (
                <div
                  key={ep.episodeNumber}
                  className="glass-panel p-5 rounded-2xl border border-white/5 flex gap-4 hover:border-white/10 hover:bg-white/4 transition-all duration-300"
                >
                  {/* Episode Index Circle */}
                  <div className="w-10 h-10 rounded-full bg-white/5 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 border border-white/5 shadow-inner">
                    {ep.episodeNumber}
                  </div>

                  {/* Episode metadata */}
                  <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-sans font-bold text-sm sm:text-base text-white truncate">
                        {ep.name}
                      </h4>
                      <span className="text-[10px] font-black text-apple-gray-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/5 uppercase whitespace-nowrap">
                        {ep.runtime} Min
                      </span>
                    </div>
                    {ep.overview ? (
                      <p className="text-xs sm:text-sm text-apple-gray-300 font-medium leading-relaxed line-clamp-2">
                        {ep.overview}
                      </p>
                    ) : (
                      <p className="text-xs sm:text-sm text-white/30 italic">
                        No episode overview available.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white/40 border border-white/5 rounded-2xl glass-panel">
              No episode lists available for this season.
            </div>
          )}

        </div>
      )}

      {/* Related Series Section */}
      {relatedSeries.length > 0 && (
        <div className="mt-12">
          <MovieCarousel
            title="Related TV Series"
            items={relatedSeries}
            type="series"
          />
        </div>
      )}

    </div>
  );
}
