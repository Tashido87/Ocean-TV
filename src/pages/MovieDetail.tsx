/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { dbService } from '../services/db';
import { Movie } from '../types';
import { Play, Heart, Star, Subtitles, Share2, Calendar, Clock, Globe, ArrowLeft, Users, Building, AlertCircle } from 'lucide-react';
import MovieCarousel from '../components/MovieCarousel';

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    // Scroll to top on load
    window.scrollTo(0, 0);

    const loadMovie = () => {
      const item = dbService.getMovie(id);
      if (item) {
        setMovie(item);
        setIsFavorited(dbService.isFavorite(item.id));
        
        // Track recently viewed
        dbService.addToRecentlyViewed(item.id);

        // Find related movies by sharing at least one genre (excluding current)
        const allMovies = dbService.getMovies();
        const related = allMovies.filter(
          m => m.id !== item.id && m.genres.some(g => item.genres.includes(g))
        );
        setRelatedMovies(related);
      } else {
        setMovie(null);
      }
    };

    loadMovie();
  }, [id]);

  const handleToggleFavorite = () => {
    if (!movie) return;
    const res = dbService.toggleFavorite(movie.id);
    setIsFavorited(res);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!movie) {
    return (
      <div className="w-full min-h-screen bg-apple-gray-900 flex flex-col items-center justify-center text-center p-6">
        <AlertCircle className="w-16 h-16 text-white/20 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Movie Not Found</h2>
        <p className="text-apple-gray-300 mb-6 max-w-sm">
          The requested movie record could not be loaded. It may have been removed by an administrator.
        </p>
        <button
          onClick={() => navigate('/movies')}
          className="px-6 py-2.5 bg-white text-black font-bold text-sm rounded-xl hover:bg-white/90 transition-all cursor-pointer"
        >
          Back to Movies
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-apple-gray-900 min-h-screen pb-20">
      
      {/* Cinematic Header Backdrop */}
      <div className="relative w-full h-[50vh] sm:h-[65vh] md:h-[80vh] overflow-hidden">
        <img
          src={movie.backdropPath}
          alt={movie.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top filter brightness-[0.7] blur-[1px]"
        />
        <div className="absolute inset-0 vignette-overlay z-1" />
        <div className="absolute inset-0 vignette-side z-1 hidden md:block" />

        {/* Back navigation button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-24 left-6 md:left-12 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 hover:bg-white text-white hover:text-black backdrop-blur-md border border-white/10 transition-all cursor-pointer text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Main Details Panel */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-24 sm:-mt-36 md:-mt-48 relative z-10 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Side: Poster Frame */}
        <div className="w-48 sm:w-64 md:w-80 flex-shrink-0 mx-auto lg:mx-0 rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-[2/3] bg-apple-gray-800">
          <img
            src={movie.posterPath}
            alt={movie.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side: Information Matrix */}
        <div className="flex-1 flex flex-col gap-6 w-full text-left">
          
          {/* Main Titles */}
          <div className="flex flex-col gap-2">
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl text-white tracking-tight leading-tight">
              {movie.title}
            </h1>
            {movie.originalTitle && movie.originalTitle !== movie.title && (
              <h2 className="text-lg sm:text-xl font-medium text-apple-gray-300 font-sans tracking-tight">
                Original Title: {movie.originalTitle}
              </h2>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm font-semibold text-apple-gray-300 border-y border-white/5 py-4">
            <div className="flex items-center gap-1 text-yellow-400">
              <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
              <span>{Number(movie.rating).toFixed(1)}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-white/50" />
              <span>{movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : movie.releaseYear}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-white/50" />
              <span>{movie.runtime} min</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-white/50" />
              <span>{movie.language}</span>
            </div>
          </div>

          {/* Interactive Button row */}
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
              <span>{copied ? 'Link Copied!' : 'Share Movie'}</span>
            </button>
          </div>

          {/* Story Summary Module */}
          <div className="flex flex-col gap-2.5 mt-2 bg-white/3 p-6 rounded-2xl border border-white/5 shadow-inner">
            <h3 className="text-xs font-black text-white/40 tracking-wider uppercase">
              Story Summary (Curated manually)
            </h3>
            <p className="font-sans text-sm sm:text-base text-apple-gray-100 leading-relaxed font-medium">
              {movie.customStory || "No story summary available. Write one in the Admin Dashboard."}
            </p>
          </div>

          {/* Production & Crew Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/2 p-6 rounded-2xl border border-white/5">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-white/40 tracking-wider uppercase flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Directing & Screenplay
              </span>
              <div className="text-sm font-bold text-white mt-1">
                <span className="text-apple-gray-300 text-xs font-medium">Director:</span> {movie.director || 'Unknown'}
              </div>
              <div className="text-sm font-bold text-white">
                <span className="text-apple-gray-300 text-xs font-medium">Writer:</span> {movie.writer || 'Unknown'}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-white/40 tracking-wider uppercase flex items-center gap-1">
                <Building className="w-3.5 h-3.5" /> Studio & Origins
              </span>
              <div className="text-sm font-bold text-white mt-1">
                <span className="text-apple-gray-300 text-xs font-medium">Studio:</span> {movie.studio || 'Unknown'}
              </div>
              <div className="text-sm font-bold text-white">
                <span className="text-apple-gray-300 text-xs font-medium">Country:</span> {movie.country || 'Unknown'}
              </div>
            </div>
          </div>

          {/* Genres row */}
          <div className="flex flex-wrap gap-2">
            {movie.genres?.map(g => (
              <span key={g} className="px-3.5 py-1.5 rounded-full bg-apple-gray-800 border border-white/5 text-xs font-semibold text-white/80">
                {g}
              </span>
            ))}
          </div>

        </div>
      </div>

      {/* Cast Component Section */}
      {movie.cast && movie.cast.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 md:px-12 mt-16 text-left">
          <h2 className="font-sans font-semibold text-xl sm:text-2xl text-white mb-6 tracking-tight">
            Cast & Characters
          </h2>
          <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-4">
            {movie.cast.map((actor) => (
              <Link
                key={actor.id}
                to={`/actor/${actor.id}`}
                className="flex flex-col items-center gap-2 text-center group flex-shrink-0 w-28"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-white/5 bg-apple-gray-800 shadow-md group-hover:scale-105 group-hover:border-white/20 transition-all duration-300">
                  <img
                    src={actor.profilePath || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200'}
                    alt={actor.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[100px]">
                    {actor.name}
                  </h4>
                  <p className="text-[10px] text-apple-gray-300 truncate max-w-[100px] mt-0.5">
                    {actor.character}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Movies Section */}
      {relatedMovies.length > 0 && (
        <div className="mt-12">
          <MovieCarousel
            title="Related Movies You May Enjoy"
            items={relatedMovies}
            type="movie"
          />
        </div>
      )}

    </div>
  );
}
