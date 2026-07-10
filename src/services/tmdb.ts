/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Movie, Series, Actor } from '../types';

const TMDB_API_KEY = '2051bf8667c9988e8f221fb185dacc0d';
const BASE_URL = 'https://api.themoviedb.org/3';

export const getImageUrl = (path: string | null, size: 'w500' | 'original' = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const tmdbService = {
  /**
   * Searches for movies, TV shows, and people on TMDB
   */
  async searchMulti(query: string) {
    if (!query || query.trim() === '') return [];
    try {
      const response = await fetch(
        `${BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US`
      );
      if (!response.ok) throw new Error('Failed to search multi');
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error searching TMDB:', error);
      return [];
    }
  },

  /**
   * Searches specifically for movies on TMDB
   */
  async searchMovies(query: string) {
    if (!query || query.trim() === '') return [];
    try {
      const response = await fetch(
        `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US`
      );
      if (!response.ok) throw new Error('Failed to search movies');
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error searching movies:', error);
      return [];
    }
  },

  /**
   * Searches specifically for TV shows on TMDB
   */
  async searchTv(query: string) {
    if (!query || query.trim() === '') return [];
    try {
      const response = await fetch(
        `${BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US`
      );
      if (!response.ok) throw new Error('Failed to search TV shows');
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error searching TV shows:', error);
      return [];
    }
  },

  /**
   * Fetches movie details and its credits (cast, crew) from TMDB
   */
  async fetchMovieMetadata(tmdbId: string) {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits,recommendations`
      );
      if (!response.ok) throw new Error(`Movie with TMDB ID ${tmdbId} not found`);
      const data = await response.json();

      const credits = data.credits || { cast: [], crew: [] };
      const cast = credits.cast.slice(0, 10).map((c: any) => ({
        id: String(c.id),
        name: c.name,
        character: c.character,
        profilePath: c.profile_path ? getImageUrl(c.profile_path, 'w500') : null,
      }));

      const directorObj = credits.crew.find((c: any) => c.job === 'Director');
      const writerObj = credits.crew.find((c: any) => c.job === 'Writer' || c.job === 'Screenplay' || c.job === 'Story');
      const producerObj = credits.crew.find((c: any) => c.job === 'Producer');

      const genres = data.genres ? data.genres.map((g: any) => g.name) : [];
      const country = data.production_countries && data.production_countries.length > 0 
        ? data.production_countries[0].name 
        : 'United States';
      const studio = data.production_companies && data.production_companies.length > 0
        ? data.production_companies[0].name
        : 'Unknown Studio';

      return {
        title: data.title,
        originalTitle: data.original_title,
        releaseDate: data.release_date || '',
        releaseYear: data.release_date ? data.release_date.substring(0, 4) : '',
        genres,
        runtime: data.runtime || 120,
        posterPath: data.poster_path ? getImageUrl(data.poster_path, 'w500') : '',
        backdropPath: data.backdrop_path ? getImageUrl(data.backdrop_path, 'original') : '',
        rating: data.vote_average || 0,
        cast,
        director: directorObj ? directorObj.name : 'Unknown Director',
        writer: writerObj ? writerObj.name : 'Unknown Writer',
        producer: producerObj ? producerObj.name : 'Unknown Producer',
        studio,
        language: data.spoken_languages && data.spoken_languages.length > 0 ? data.spoken_languages[0].english_name : 'English',
        country,
      };
    } catch (error) {
      console.error('Error fetching movie details from TMDB:', error);
      throw error;
    }
  },

  /**
   * Fetches TV show metadata from TMDB including seasons and episodes
   */
  async fetchSeriesMetadata(tmdbId: string) {
    try {
      const response = await fetch(
        `${BASE_URL}/tv/${tmdbId}?api_key=${TMDB_API_KEY}`
      );
      if (!response.ok) throw new Error(`Series with TMDB ID ${tmdbId} not found`);
      const data = await response.json();

      const genres = data.genres ? data.genres.map((g: any) => g.name) : [];
      
      // Fetch series credits (cast & crew)
      let cast: any[] = [];
      let director = 'Unknown Director';
      let writer = 'Unknown Writer';
      let producer = 'Unknown Producer';

      try {
        const creditsResponse = await fetch(
          `${BASE_URL}/tv/${tmdbId}/credits?api_key=${TMDB_API_KEY}`
        );
        if (creditsResponse.ok) {
          const creditsData = await creditsResponse.json();
          cast = (creditsData.cast || [])
            .slice(0, 10)
            .map((c: any) => ({
              id: String(c.id),
              name: c.name,
              character: c.character || 'Unknown Character',
              profilePath: c.profile_path ? getImageUrl(c.profile_path, 'w500') : null
            }));

          const directors = (creditsData.crew || [])
            .filter((c: any) => c.job === 'Director' || c.job === 'Executive Producer' || c.job === 'Creator' || c.department === 'Directing')
            .slice(0, 3)
            .map((c: any) => c.name);
          if (directors.length > 0) director = directors.join(', ');

          const writers = (creditsData.crew || [])
            .filter((c: any) => c.job === 'Writer' || c.job === 'Screenplay' || c.department === 'Writing')
            .slice(0, 3)
            .map((c: any) => c.name);
          if (writers.length > 0) writer = writers.join(', ');

          const producers = (creditsData.crew || [])
            .filter((c: any) => c.job === 'Producer' || c.job === 'Executive Producer')
            .slice(0, 3)
            .map((c: any) => c.name);
          if (producers.length > 0) producer = producers.join(', ');
        }
      } catch (err) {
        console.error('Error fetching series credits:', err);
      }

      // Fallback for creators from main TV metadata
      if (data.created_by && data.created_by.length > 0) {
        const creators = data.created_by.map((c: any) => c.name).join(', ');
        if (director === 'Unknown Director') director = creators;
        if (writer === 'Unknown Writer') writer = creators;
      }

      const studio = data.production_companies && data.production_companies.length > 0
        ? data.production_companies[0].name
        : 'Unknown Studio';

      const country = data.production_countries && data.production_countries.length > 0
        ? data.production_countries[0].name
        : (data.origin_country && data.origin_country.length > 0 ? data.origin_country[0] : 'Unknown');

      // We will also fetch specific details for the seasons to get episodes
      const seasonsData = [];
      const totalSeasons = Math.min(data.number_of_seasons || 1, 10); // cap at 10 seasons for simplicity

      for (let i = 1; i <= totalSeasons; i++) {
        try {
          const seasonResponse = await fetch(
            `${BASE_URL}/tv/${tmdbId}/season/${i}?api_key=${TMDB_API_KEY}`
          );
          if (seasonResponse.ok) {
            const seasonData = await seasonResponse.json();
            seasonsData.push({
              seasonNumber: i,
              name: seasonData.name || `Season ${i}`,
              episodes: (seasonData.episodes || []).map((ep: any) => ({
                episodeNumber: ep.episode_number,
                name: ep.name || `Episode ${ep.episode_number}`,
                runtime: ep.runtime || data.episode_run_time?.[0] || 45,
                overview: ep.overview || '',
              })),
            });
          }
        } catch (err) {
          console.error(`Error fetching season ${i} of series ${tmdbId}:`, err);
        }
      }

      // If seasons data is empty, mock at least one season
      if (seasonsData.length === 0) {
        seasonsData.push({
          seasonNumber: 1,
          name: 'Season 1',
          episodes: [
            { episodeNumber: 1, name: 'Pilot', runtime: 45, overview: 'The series premiere episode.' }
          ]
        });
      }

      return {
        title: data.name,
        originalTitle: data.original_name,
        releaseYear: data.first_air_date ? data.first_air_date.substring(0, 4) : '',
        genres,
        posterPath: data.poster_path ? getImageUrl(data.poster_path, 'w500') : '',
        backdropPath: data.backdrop_path ? getImageUrl(data.backdrop_path, 'original') : '',
        status: data.status || 'Ended',
        network: data.networks && data.networks.length > 0 ? data.networks[0].name : 'Unknown Network',
        language: data.languages && data.languages.length > 0 ? data.languages[0].toUpperCase() : 'EN',
        rating: data.vote_average || 0,
        seasons: seasonsData,
        cast,
        director,
        writer,
        producer,
        studio,
        country,
      };
    } catch (error) {
      console.error('Error fetching series details from TMDB:', error);
      throw error;
    }
  },

  /**
   * Fetches detailed actor information from TMDB
   */
  async fetchActorMetadata(tmdbId: string): Promise<Actor> {
    try {
      const response = await fetch(
        `${BASE_URL}/person/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=combined_credits`
      );
      if (!response.ok) throw new Error(`Actor with TMDB ID ${tmdbId} not found`);
      const data = await response.json();

      const combinedCredits = data.combined_credits || { cast: [] };
      const filmography = combinedCredits.cast
        .filter((c: any) => c.poster_path && (c.release_date || c.first_air_date))
        .map((c: any) => ({
          id: String(c.id),
          title: c.title || c.name,
          type: c.media_type === 'tv' ? 'series' as const : 'movie' as const,
          character: c.character || 'Self',
          releaseYear: (c.release_date || c.first_air_date || '').substring(0, 4),
          posterPath: getImageUrl(c.poster_path, 'w500'),
        }))
        // Sort by release year descending
        .sort((a: any, b: any) => {
          const yearA = parseInt(a.releaseYear) || 0;
          const yearB = parseInt(b.releaseYear) || 0;
          return yearB - yearA;
        })
        .slice(0, 150); // top 150 roles

      const nationality = data.place_of_birth ? data.place_of_birth.split(',').pop()?.trim() : 'Unknown';

      return {
        id: String(data.id),
        name: data.name,
        profilePath: data.profile_path ? getImageUrl(data.profile_path, 'w500') : null,
        biography: data.biography || 'No biography available.',
        birthday: data.birthday || 'Unknown',
        nationality: nationality || 'Unknown',
        knownFor: data.known_for_department || 'Acting',
        filmography,
      };
    } catch (error) {
      console.error('Error fetching actor details from TMDB:', error);
      throw error;
    }
  },
};
