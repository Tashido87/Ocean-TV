/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Actor {
  id: string; // tmdbId
  name: string;
  profilePath: string | null;
  biography?: string;
  birthday?: string;
  nationality?: string;
  knownFor?: string;
  filmography: FilmographyItem[];
}

export interface FilmographyItem {
  id: string; // movie or series id
  title: string;
  type: 'movie' | 'series';
  character: string;
  releaseYear: string;
  posterPath: string | null;
}

export interface Movie {
  id: string; // custom or tmdbId
  title: string;
  originalTitle?: string;
  tmdbId: string;
  customStory: string;
  subtitleType: 'Myanmar' | 'English' | 'Both' | 'None';
  releaseDate: string;
  releaseYear: string;
  genres: string[];
  runtime: number; // in minutes
  featured: boolean;
  heroBanner: boolean;
  posterPath: string;
  backdropPath: string;
  rating: number;
  cast: { id: string; name: string; character: string; profilePath: string | null }[];
  director: string;
  writer: string;
  producer: string;
  studio: string;
  language: string;
  country: string;
  addedAt: string; // ISO string
}

export interface Episode {
  episodeNumber: number;
  name: string;
  runtime: number;
  overview?: string;
}

export interface Season {
  seasonNumber: number;
  name: string;
  episodes: Episode[];
}

export interface Series {
  id: string; // custom or tmdbId
  title: string;
  originalTitle?: string;
  tmdbId: string;
  customStory: string;
  subtitleType: 'Myanmar' | 'English' | 'Both' | 'None';
  releaseYear: string;
  genres: string[];
  posterPath: string;
  backdropPath: string;
  status: string;
  network: string;
  language: string;
  rating: number;
  seasons: Season[];
  addedAt: string; // ISO string
}

export interface HomeSection {
  id: string;
  title: string;
  type: 'movies' | 'series';
  listType: 'trending' | 'popular' | 'recently_added' | 'editors_picks' | 'genre' | 'custom';
  value?: string; // genre name, or comma-separated list of IDs
  order: number;
  isVisible: boolean;
}
