/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';
import { dbService } from '../services/db';
import { Actor, Movie, Series } from '../types';
import { ArrowLeft, User, Calendar, MapPin, Award, PlayCircle, Star, Sparkles } from 'lucide-react';

export default function ActorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [actor, setActor] = useState<Actor | null>(null);
  const [localMovies, setLocalMovies] = useState<Movie[]>([]);
  const [localSeries, setLocalSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Load local database items for filtering
    setLocalMovies(dbService.getMovies());
    setLocalSeries(dbService.getSeries());
  }, []);

  useEffect(() => {
    if (!id) return;
    window.scrollTo(0, 0);
    setImageError(false);

    const loadActor = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await tmdbService.fetchActorMetadata(id);
        setActor(data);
      } catch (err) {
        console.error('Error loading actor metadata from TMDB:', err);
        setError('Failed to retrieve actor information from TMDB. Please check your internet connection or try again.');
      } finally {
        setLoading(false);
      }
    };

    loadActor();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-apple-gray-900 flex flex-col items-center justify-center text-center p-6 pt-24">
        {/* Apple Style Loader Skeleton */}
        <div className="animate-pulse flex flex-col items-center gap-6 max-w-4xl w-full">
          <div className="w-40 h-40 rounded-full bg-white/5" />
          <div className="h-8 w-64 bg-white/5 rounded-xl" />
          <div className="h-4 w-40 bg-white/5 rounded-xl" />
          <div className="h-32 w-full bg-white/5 rounded-2xl mt-4" />
        </div>
      </div>
    );
  }

  if (error || !actor) {
    return (
      <div className="w-full min-h-screen bg-apple-gray-900 flex flex-col items-center justify-center text-center p-6 pt-24">
        <User className="w-16 h-16 text-white/20 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Actor Profile Unavailable</h2>
        <p className="text-apple-gray-300 mb-6 max-w-sm">
          {error || "The requested actor credentials could not be retrieved."}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 bg-white text-black font-bold text-sm rounded-xl hover:bg-white/90 transition-all cursor-pointer"
        >
          Back
        </button>
      </div>
    );
  }

  const filteredFilmography = (() => {
    if (!actor) return [];

    const itemsMap = new Map<string, {
      id: string;
      title: string;
      type: 'movie' | 'series';
      character: string;
      releaseYear: string;
      posterPath: string | null;
      dbId: string;
    }>();

    // 1. Scan local movies where the actor is listed in the cast list
    localMovies.forEach(m => {
      const castMember = m.cast?.find(c => 
        String(c.id) === String(id) || 
        c.name.trim().toLowerCase() === actor.name.trim().toLowerCase()
      );
      if (castMember) {
        itemsMap.set(m.id, {
          id: m.tmdbId || m.id,
          dbId: m.id,
          title: m.title,
          type: 'movie',
          character: castMember.character || 'Cast',
          releaseYear: m.releaseYear,
          posterPath: m.posterPath || null
        });
      }
    });

    // 2. Scan local series where the actor is listed in the cast list
    localSeries.forEach(s => {
      const castMember = s.cast?.find(c => 
        String(c.id) === String(id) || 
        c.name.trim().toLowerCase() === actor.name.trim().toLowerCase()
      );
      if (castMember) {
        itemsMap.set(s.id, {
          id: s.tmdbId || s.id,
          dbId: s.id,
          title: s.title,
          type: 'series',
          character: castMember.character || 'Cast',
          releaseYear: s.releaseYear,
          posterPath: s.posterPath || null
        });
      }
    });

    // 3. Scan actor's TMDB filmography and match with local items to cover any extra edge cases
    actor.filmography.forEach(role => {
      if (role.type === 'movie') {
        const match = localMovies.find(m => m.tmdbId === role.id || m.id === role.id);
        if (match && !itemsMap.has(match.id)) {
          itemsMap.set(match.id, {
            id: role.id,
            dbId: match.id,
            title: match.title || role.title,
            type: 'movie',
            character: role.character || 'Cast',
            releaseYear: match.releaseYear || role.releaseYear,
            posterPath: match.posterPath || role.posterPath,
          });
        }
      } else {
        const match = localSeries.find(s => s.tmdbId === role.id || s.id === role.id);
        if (match && !itemsMap.has(match.id)) {
          itemsMap.set(match.id, {
            id: role.id,
            dbId: match.id,
            title: match.title || role.title,
            type: 'series',
            character: role.character || 'Cast',
            releaseYear: match.releaseYear || role.releaseYear,
            posterPath: match.posterPath || role.posterPath,
          });
        }
      }
    });

    // Convert map to array and sort by releaseYear descending
    return Array.from(itemsMap.values()).sort((a, b) => {
      const yearA = parseInt(a.releaseYear) || 0;
      const yearB = parseInt(b.releaseYear) || 0;
      return yearB - yearA;
    });
  })();

  return (
    <div className="w-full bg-apple-gray-900 min-h-screen pb-20 pt-28 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Back navigation */}
        <button
          onClick={() => navigate(-1)}
          className="self-start flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white text-white hover:text-black transition-all border border-white/5 cursor-pointer text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Profile Card Matrix */}
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/8 flex flex-col md:flex-row gap-8 sm:gap-12 items-start text-left shadow-2xl">
          {/* Large circular profile picture */}
          <div className="w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-2 border-white/10 bg-apple-gray-800 flex-shrink-0 mx-auto md:mx-0 shadow-lg">
            {actor.profilePath && !imageError ? (
              <img
                src={actor.profilePath}
                alt={actor.name}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-apple-gray-800 text-white/40">
                <User className="w-16 h-16" />
              </div>
            )}
          </div>

          {/* Biography and Specs */}
          <div className="flex-1 flex flex-col gap-5 w-full">
            <div className="flex flex-col gap-1.5">
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-none">
                {actor.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs sm:text-sm text-apple-gray-300 font-semibold">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-white/40" />
                  <span>Born: {actor.birthday || 'N/A'}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-white/40" />
                  <span>Nationality: {actor.nationality || 'N/A'}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Award className="w-4 h-4" />
                  <span>Dept: {actor.knownFor || 'Acting'}</span>
                </div>
              </div>
            </div>

            {/* Biography text */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-black text-white/35 tracking-wider uppercase">Biography</h3>
              <p className="font-sans text-sm sm:text-base text-apple-gray-200 leading-relaxed max-h-[220px] overflow-y-auto custom-scrollbar pr-3 font-medium">
                {actor.biography || "No detailed biography found on TMDB."}
              </p>
            </div>
          </div>
        </div>

        {/* Filmography Section */}
        <div className="text-left flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4">
            <PlayCircle className="w-6 h-6 text-white" />
            <h2 className="font-sans font-semibold text-xl sm:text-2xl text-white tracking-tight">
              Filmography & Roles in OceanTV
            </h2>
            <span className="text-xs font-black bg-cyan-950/60 text-cyan-400 px-2.5 py-1 rounded-full border border-cyan-500/20 ml-2">
              {filteredFilmography.length} {filteredFilmography.length === 1 ? 'Entry' : 'Entries'}
            </span>
          </div>

          {filteredFilmography.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-8">
              {filteredFilmography.map((role) => {
                return (
                  <Link
                    key={`${role.id}-${role.character}`}
                    to={role.type === 'movie' ? `/movie/${role.dbId}` : `/series/${role.dbId}`}
                    className="group flex flex-col gap-2.5 cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-white rounded-2xl"
                  >
                    <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-apple-gray-800 border border-white/5 group-hover:scale-104 group-hover:border-white/20 transition-all duration-300 shadow-md group-hover:shadow-xl">
                      <img
                        src={role.posterPath || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=200'}
                        alt={role.title}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] font-bold text-white uppercase tracking-wider">
                        {role.type === 'movie' ? 'Movie' : 'TV Show'}
                      </div>
                    </div>
                    <div className="px-1">
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-400 transition-colors duration-200 truncate">
                        {role.title}
                      </h4>
                      <p className="text-[10px] text-apple-gray-300 truncate mt-0.5 font-medium leading-none">
                        As <span className="text-white/80 font-bold">{role.character}</span>
                      </p>
                      <p className="text-[10px] text-white/40 mt-1 font-mono">
                        {role.releaseYear || 'N/A'}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-white/30 border border-white/5 rounded-2xl glass-panel">
              No movies or TV shows featuring {actor.name} are currently in OceanTV.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
