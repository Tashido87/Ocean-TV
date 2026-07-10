/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { tmdbService, getImageUrl } from '../services/tmdb';
import { dbService } from '../services/db';
import { Movie, Series, Actor } from '../types';
import { ArrowLeft, User, Calendar, MapPin, Award, PlayCircle, Film } from 'lucide-react';

export default function DirectorPage() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [director, setDirector] = useState<Partial<Actor> | null>(null);
  const [localMovies, setLocalMovies] = useState<Movie[]>([]);
  const [localSeries, setLocalSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch local database items
  useEffect(() => {
    setLocalMovies(dbService.getMovies());
    setLocalSeries(dbService.getSeries());
  }, []);

  useEffect(() => {
    if (!name) return;
    window.scrollTo(0, 0);

    const loadDirectorDetails = async () => {
      setLoading(true);
      try {
        // Search for the person on TMDB to get their TMDB ID
        const searchUrl = `https://api.themoviedb.org/3/search/person?api_key=2051bf8667c9988e8f221fb185dacc0d&query=${encodeURIComponent(name)}&language=en-US`;
        const res = await fetch(searchUrl);
        if (res.ok) {
          const data = await res.json();
          const person = data.results?.[0];
          if (person) {
            // Fetch detailed metadata from TMDB using the actor/person fetcher
            const fullDetails = await tmdbService.fetchActorMetadata(String(person.id));
            setDirector(fullDetails);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching director details from TMDB:', err);
      }

      // Fallback if TMDB search doesn't find them or fails
      setDirector({
        name: name,
        profilePath: null,
        biography: 'No biography available for this director.',
        birthday: 'N/A',
        nationality: 'N/A',
        knownFor: 'Directing',
      });
      setLoading(false);
    };

    loadDirectorDetails();
  }, [name]);

  // Filter local movies and series directed by this director
  const directedMovies = localMovies.filter((movie) => {
    if (!movie.director) return false;
    return movie.director.toLowerCase().includes(name?.toLowerCase() || '');
  });

  const directedSeries = localSeries.filter((series) => {
    // Check if series has a director field (even if it's not in the typescript type, some might have it dynamically)
    const seriesDir = (series as any).director;
    if (!seriesDir) return false;
    return String(seriesDir).toLowerCase().includes(name?.toLowerCase() || '');
  });

  const totalEntries = directedMovies.length + directedSeries.length;

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-apple-gray-900 flex flex-col items-center justify-center text-center p-6 pt-24">
        <div className="animate-pulse flex flex-col items-center gap-6 max-w-4xl w-full">
          <div className="w-40 h-40 rounded-full bg-white/5" />
          <div className="h-8 w-64 bg-white/5 rounded-xl" />
          <div className="h-4 w-40 bg-white/5 rounded-xl" />
          <div className="h-32 w-full bg-white/5 rounded-2xl mt-4" />
        </div>
      </div>
    );
  }

  const displayName = director?.name || name || 'Unknown Director';

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
            {director?.profilePath ? (
              <img
                src={director.profilePath}
                alt={displayName}
                referrerPolicy="no-referrer"
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
                {displayName}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs sm:text-sm text-apple-gray-300 font-semibold">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-white/40" />
                  <span>Born: {director?.birthday || 'N/A'}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-white/40" />
                  <span>Nationality: {director?.nationality || 'N/A'}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Award className="w-4 h-4" />
                  <span>Dept: {director?.knownFor || 'Directing'}</span>
                </div>
              </div>
            </div>

            {/* Biography text */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-black text-white/35 tracking-wider uppercase">Biography</h3>
              <p className="font-sans text-sm sm:text-base text-apple-gray-200 leading-relaxed max-h-[220px] overflow-y-auto custom-scrollbar pr-3 font-medium">
                {director?.biography || "No detailed biography found."}
              </p>
            </div>
          </div>
        </div>

        {/* Directed Works Section */}
        <div className="text-left flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4">
            <PlayCircle className="w-6 h-6 text-white" />
            <h2 className="font-sans font-semibold text-xl sm:text-2xl text-white tracking-tight">
              Directed Works in OceanTV
            </h2>
            <span className="text-xs font-black bg-cyan-950/60 text-cyan-400 px-2.5 py-1 rounded-full border border-cyan-500/20 ml-2">
              {totalEntries} {totalEntries === 1 ? 'Entry' : 'Entries'}
            </span>
          </div>

          {totalEntries > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-8">
              {/* Movies list */}
              {directedMovies.map((movie) => (
                <Link
                  key={movie.id}
                  to={`/movie/${movie.id}`}
                  className="group flex flex-col gap-2.5 cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-white rounded-2xl"
                >
                  <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-apple-gray-800 border border-white/5 group-hover:scale-104 group-hover:border-white/20 transition-all duration-300 shadow-md group-hover:shadow-xl">
                    <img
                      src={movie.posterPath || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=200'}
                      alt={movie.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] font-bold text-white uppercase tracking-wider">
                      Movie
                    </div>
                  </div>
                  <div className="px-1">
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-400 transition-colors duration-200 truncate">
                      {movie.title}
                    </h4>
                    <p className="text-[10px] text-white/40 mt-1 font-mono">
                      {movie.releaseYear || 'N/A'}
                    </p>
                  </div>
                </Link>
              ))}

              {/* Series list */}
              {directedSeries.map((show) => (
                <Link
                  key={show.id}
                  to={`/series/${show.id}`}
                  className="group flex flex-col gap-2.5 cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-white rounded-2xl"
                >
                  <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-apple-gray-800 border border-white/5 group-hover:scale-104 group-hover:border-white/20 transition-all duration-300 shadow-md group-hover:shadow-xl">
                    <img
                      src={show.posterPath || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=200'}
                      alt={show.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] font-bold text-white uppercase tracking-wider">
                      TV Show
                    </div>
                  </div>
                  <div className="px-1">
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-400 transition-colors duration-200 truncate">
                      {show.title}
                    </h4>
                    <p className="text-[10px] text-white/40 mt-1 font-mono">
                      {show.releaseYear || 'N/A'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-white/30 border border-white/5 rounded-2xl glass-panel">
              No movies or TV shows directed by {displayName} are currently in OceanTV.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
