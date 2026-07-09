/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Movie, Series, HomeSection, Actor } from '../types';

// Let's create an elegant, curated list of seed movies and series.
// All of these will have real TMDB IDs, custom human-written story summaries, and high-quality poster/backdrop URLs.
const SEED_MOVIES: Movie[] = [
  {
    id: 'dune-2',
    title: 'Dune: Part Two',
    originalTitle: 'Dune: Part Two',
    tmdbId: '693134',
    customStory: 'Follow the mythical journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.',
    subtitleType: 'Both',
    releaseDate: '2024-03-01',
    releaseYear: '2024',
    genres: ['Sci-Fi', 'Adventure', 'Action', 'Drama'],
    runtime: 166,
    featured: true,
    heroBanner: true,
    posterPath: 'https://image.tmdb.org/t/p/w500/heM4XKC0jA8fTSNe8F7oUkcJV7Z.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/eZ239CUp1d6OryZEBPnO2n87gMG.jpg',
    rating: 8.4,
    director: 'Denis Villeneuve',
    writer: 'Denis Villeneuve, Jon Spaihts',
    producer: 'Mary Parent, Cale Boyter, Denis Villeneuve',
    studio: 'Legendary Pictures',
    language: 'English',
    country: 'United States',
    addedAt: '2026-07-01T12:00:00.000Z',
    cast: [
      { id: '1190668', name: 'Timothée Chalamet', character: 'Paul Atreides', profilePath: 'https://image.tmdb.org/t/p/w500/dFxpwRpmzpVfP1zjluH68DeQhyj.jpg' },
      { id: '505710', name: 'Zendaya', character: 'Chani', profilePath: 'https://image.tmdb.org/t/p/w500/yCpzzMJ9gS7Rp7xgrVOsntW1m7D.jpg' },
      { id: '933238', name: 'Rebecca Ferguson', character: 'Lady Jessica', profilePath: 'https://image.tmdb.org/t/p/w500/lJloTOheuQSirSLXNA3JHsrMNfH.jpg' },
      { id: '86654', name: 'Austin Butler', character: 'Feyd-Rautha Harkonnen', profilePath: 'https://image.tmdb.org/t/p/w500/atdAs4pFGjUQ4m2W8kJYly7N6cC.jpg' }
    ]
  },
  {
    id: 'interstellar',
    title: 'Interstellar',
    originalTitle: 'Interstellar',
    tmdbId: '157336',
    customStory: 'In a dying future where Earth is ravaged by crop blights and severe dust storms, a team of courageous explorers undertakes the ultimate journey. Traveling through a newly discovered wormhole near Saturn, they search for a new home among the stars to ensure humanity’s survival, facing extreme time dilation and cosmic perils.',
    subtitleType: 'Both',
    releaseDate: '2014-11-07',
    releaseYear: '2014',
    genres: ['Sci-Fi', 'Drama', 'Adventure'],
    runtime: 169,
    featured: true,
    heroBanner: true,
    posterPath: 'https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/2ssWTSVklAEc98frZUQhgtGHx7s.jpg',
    rating: 8.6,
    director: 'Christopher Nolan',
    writer: 'Jonathan Nolan, Christopher Nolan',
    producer: 'Emma Thomas, Christopher Nolan, Lynda Obst',
    studio: 'Syncopy, Lynda Obst Productions',
    language: 'English',
    country: 'United States',
    addedAt: '2026-07-02T12:00:00.000Z',
    cast: [
      { id: '10297', name: 'Matthew McConaughey', character: 'Cooper', profilePath: 'https://image.tmdb.org/t/p/w500/lCySuYjhXix3FzQdS4oceDDrXKI.jpg' },
      { id: '1813', name: 'Anne Hathaway', character: 'Brand', profilePath: 'https://image.tmdb.org/t/p/w500/nbccV2pMoyLTCeg5DQip24Eq0Jp.jpg' },
      { id: '83002', name: 'Jessica Chastain', character: 'Murph', profilePath: 'https://image.tmdb.org/t/p/w500/eQKnihReJeB9vQEa5gySzAlKfZt.jpg' }
    ]
  },
  {
    id: 'oppenheimer',
    title: 'Oppenheimer',
    originalTitle: 'Oppenheimer',
    tmdbId: '872585',
    customStory: 'An epic, high-stakes biographical drama following theoretical physicist J. Robert Oppenheimer, the scientific director of the Manhattan Project. Witness the intense pressure, intellectual battles, and moral conflicts surrounding the development of the first nuclear weapons at Los Alamos, and the subsequent political fallout that shattered his life.',
    subtitleType: 'Myanmar',
    releaseDate: '2023-07-21',
    releaseYear: '2023',
    genres: ['Drama', 'History'],
    runtime: 180,
    featured: true,
    heroBanner: false,
    posterPath: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/neeNHeXjMF5fXoCJRsOmkNGC7q.jpg',
    rating: 8.1,
    director: 'Christopher Nolan',
    writer: 'Christopher Nolan, Kai Bird',
    producer: 'Emma Thomas, Charles Roven, Christopher Nolan',
    studio: 'Universal Pictures, Syncopy',
    language: 'English',
    country: 'United States',
    addedAt: '2026-07-03T12:00:00.000Z',
    cast: [
      { id: '2037', name: 'Cillian Murphy', character: 'J. Robert Oppenheimer', profilePath: 'https://image.tmdb.org/t/p/w500/2lKs67r7FI4bPu0AXxMUJZxmUXn.jpg' },
      { id: '5081', name: 'Emily Blunt', character: 'Kitty Oppenheimer', profilePath: 'https://image.tmdb.org/t/p/w500/5nCSG5TL1bP1geD8aaBfaLnLLCD.jpg' },
      { id: '1892', name: 'Matt Damon', character: 'Leslie Groves', profilePath: 'https://image.tmdb.org/t/p/w500/aCvBXTAR9B1qRjIRzMBYhhbm1fR.jpg' }
    ]
  },
  {
    id: 'spiderman-verse',
    title: 'Spider-Man: Across the Spider-Verse',
    originalTitle: 'Spider-Man: Across the Spider-Verse',
    tmdbId: '569094',
    customStory: 'After reuniting with Gwen Stacy, Brooklyn’s full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters the Spider-Society—a team of Spider-People charged with protecting the Multiverse’s very existence. But when the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
    subtitleType: 'Both',
    releaseDate: '2023-06-02',
    releaseYear: '2023',
    genres: ['Animation', 'Action', 'Adventure', 'Sci-Fi'],
    runtime: 140,
    featured: false,
    heroBanner: false,
    posterPath: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/9xfDWXAUbFXQK585JvByT5pEAhe.jpg',
    rating: 8.4,
    director: 'Joaquim Dos Santos, Kemp Powers, Justin K. Thompson',
    writer: 'Phil Lord, Christopher Miller, Dave Callaham',
    producer: 'Avi Arad, Amy Pascal, Phil Lord',
    studio: 'Columbia Pictures, Sony Pictures Animation',
    language: 'English',
    country: 'United States',
    addedAt: '2026-07-04T12:00:00.000Z',
    cast: [
      { id: '587506', name: 'Shameik Moore', character: 'Miles Morales (voice)', profilePath: 'https://image.tmdb.org/t/p/w500/ovUKfVOwJ7CadEHaG3NDsfA5xRq.jpg' },
      { id: '130640', name: 'Hailee Steinfeld', character: 'Gwen Stacy (voice)', profilePath: 'https://image.tmdb.org/t/p/w500/4K2dzM3odGiVZOQOD6RjVxNq2ZQ.jpg' }
    ]
  },
  {
    id: 'the-batman',
    title: 'The Batman',
    originalTitle: 'The Batman',
    tmdbId: '414906',
    customStory: 'In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler. Armed with only a few trusted allies amongst the city’s corrupt network of officials, the lone vigilante must establish himself as the sole embodiment of retribution.',
    subtitleType: 'Myanmar',
    releaseDate: '2022-03-04',
    releaseYear: '2022',
    genres: ['Crime', 'Mystery', 'Thriller', 'Action'],
    runtime: 176,
    featured: false,
    heroBanner: false,
    posterPath: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/IYUD7rAIXzBM91TT3Z5fILUS7n.jpg',
    rating: 7.7,
    director: 'Matt Reeves',
    writer: 'Matt Reeves, Peter Craig',
    producer: 'Dylan Clark, Matt Reeves',
    studio: 'Warner Bros. Pictures, 6th & Idaho',
    language: 'English',
    country: 'United States',
    addedAt: '2026-07-05T12:00:00.000Z',
    cast: [
      { id: '11288', name: 'Robert Pattinson', character: 'Bruce Wayne / Batman', profilePath: 'https://image.tmdb.org/t/p/w500/3qZ09UE7lN6AtorfXFRYpEtSY93.jpg' },
      { id: '110811', name: 'Zoë Kravitz', character: 'Selina Kyle / Catwoman', profilePath: 'https://image.tmdb.org/t/p/w500/n0mhAgmY6eJQmA7kaugsTZEJgHo.jpg' }
    ]
  }
];

const SEED_SERIES: Series[] = [
  {
    id: 'severance',
    title: 'Severance',
    originalTitle: 'Severance',
    tmdbId: '95396',
    customStory: 'Mark leads a team of office workers at Lumon Industries, whose memories have been surgically divided between their work and personal lives. When a mysterious colleague appears outside of work, it begins a journey to discover the truth about their jobs, raising questions about identity, corporate control, and the cost of escaping reality.',
    subtitleType: 'Both',
    releaseYear: '2022',
    genres: ['Sci-Fi', 'Mystery', 'Drama'],
    posterPath: 'https://image.tmdb.org/t/p/w500/pPHpeI2X1qEd1CS1SeyrdhZ4qnT.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/ixgFmf1X59PUZam2qbAfskx2gQr.jpg',
    status: 'Returning Series',
    network: 'Apple TV+',
    language: 'English',
    rating: 8.4,
    addedAt: '2026-07-01T13:00:00.000Z',
    seasons: [
      {
        seasonNumber: 1,
        name: 'Season 1',
        episodes: [
          { episodeNumber: 1, name: 'Good News About Hell', runtime: 57, overview: 'Mark is promoted to run the severed team. Out-of-office Mark meets a former colleague.' },
          { episodeNumber: 2, name: 'Half Loop', runtime: 52, overview: 'The team trains new employee Helly. Mark takes a personal day off.' },
          { episodeNumber: 3, name: 'In Perpetuity', runtime: 50, overview: 'The team explores the department archives. Petey’s daughter contacts Mark.' }
        ]
      }
    ]
  },
  {
    id: 'last-of-us',
    title: 'The Last of Us',
    originalTitle: 'The Last of Us',
    tmdbId: '100088',
    customStory: 'Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone. What starts as a small job soon becomes a brutal, heartbreaking journey, as they both must traverse the U.S. and depend on each other for survival.',
    subtitleType: 'Myanmar',
    releaseYear: '2023',
    genres: ['Drama', 'Action', 'Adventure', 'Sci-Fi'],
    posterPath: 'https://image.tmdb.org/t/p/w500/dmo6TYuuJgaYinXBPjrgG9mB5od.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/acevLdSl5I2MK5RYAm7gwAndt1w.jpg',
    status: 'Returning Series',
    network: 'HBO',
    language: 'English',
    rating: 8.6,
    addedAt: '2026-07-02T13:00:00.000Z',
    seasons: [
      {
        seasonNumber: 1,
        name: 'Season 1',
        episodes: [
          { episodeNumber: 1, name: 'When You\'re Lost in the Darkness', runtime: 81, overview: 'In 2003, a parasitic fungus begins destroying the world. In 2023, Joel attempts to escape.' },
          { episodeNumber: 2, name: 'Infected', runtime: 53, overview: 'Joel and Tess clash over Ellie\'s fate as they navigate the ruins of Boston.' }
        ]
      }
    ]
  }
];

const SEED_SECTIONS: HomeSection[] = [
  { id: 'sec-hero', title: 'Featured Hero', type: 'movies', listType: 'editors_picks', order: 0, isVisible: true },
  { id: 'sec-trending', title: 'Trending Movies', type: 'movies', listType: 'trending', order: 1, isVisible: true },
  { id: 'sec-series', title: 'Popular TV Series', type: 'series', listType: 'popular', order: 2, isVisible: true },
  { id: 'sec-recently', title: 'Recently Added', type: 'movies', listType: 'recently_added', order: 3, isVisible: true },
  { id: 'sec-scifi', title: 'Sci-Fi Universe', type: 'movies', listType: 'genre', value: 'Sci-Fi', order: 4, isVisible: true },
  { id: 'sec-drama', title: 'Captivating Dramas', type: 'movies', listType: 'genre', value: 'Drama', order: 5, isVisible: true }
];

// LocalStorage Keys
const KEYS = {
  MOVIES: 'cineapple_movies',
  SERIES: 'cineapple_series',
  SECTIONS: 'cineapple_sections',
  FAVORITES: 'cineapple_favorites',
  RECENTLY_VIEWED: 'cineapple_recent',
  ADMIN_TOKEN: 'cineapple_admin_token',
};

// Initialize DB with automatic schema and image repair migration
const initDatabase = () => {
  let existingMovies: Movie[] = [];
  try {
    existingMovies = JSON.parse(localStorage.getItem(KEYS.MOVIES) || '[]');
  } catch {}

  let existingSeries: Series[] = [];
  try {
    existingSeries = JSON.parse(localStorage.getItem(KEYS.SERIES) || '[]');
  } catch {}

  // If we already have movies in localStorage, migrate/patch their image paths if they match seed items but have hallucinated URLs
  if (existingMovies.length > 0) {
    let patched = false;
    const updatedMovies = existingMovies.map((m: Movie) => {
      const match = SEED_MOVIES.find((seed) => seed.tmdbId === m.tmdbId || seed.id === m.id);
      if (match) {
        let changed = false;
        if (m.posterPath !== match.posterPath || m.backdropPath !== match.backdropPath) {
          m.posterPath = match.posterPath;
          m.backdropPath = match.backdropPath;
          changed = true;
        }
        if (JSON.stringify(m.cast) !== JSON.stringify(match.cast)) {
          m.cast = match.cast;
          changed = true;
        }
        if (changed) patched = true;
      }
      return m;
    });
    if (patched) {
      localStorage.setItem(KEYS.MOVIES, JSON.stringify(updatedMovies));
    }
  } else {
    localStorage.setItem(KEYS.MOVIES, JSON.stringify(SEED_MOVIES));
  }

  // Same for TV Series
  if (existingSeries.length > 0) {
    let patched = false;
    const updatedSeries = existingSeries.map((s: Series) => {
      const match = SEED_SERIES.find((seed) => seed.tmdbId === s.tmdbId || seed.id === s.id);
      if (match && (s.posterPath !== match.posterPath || s.backdropPath !== match.backdropPath)) {
        s.posterPath = match.posterPath;
        s.backdropPath = match.backdropPath;
        patched = true;
      }
      return s;
    });
    if (patched) {
      localStorage.setItem(KEYS.SERIES, JSON.stringify(updatedSeries));
    }
  } else {
    localStorage.setItem(KEYS.SERIES, JSON.stringify(SEED_SERIES));
  }

  if (!localStorage.getItem(KEYS.SECTIONS)) {
    localStorage.setItem(KEYS.SECTIONS, JSON.stringify(SEED_SECTIONS));
  }
  if (!localStorage.getItem(KEYS.FAVORITES)) {
    localStorage.setItem(KEYS.FAVORITES, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.RECENTLY_VIEWED)) {
    localStorage.setItem(KEYS.RECENTLY_VIEWED, JSON.stringify([]));
  }
};

initDatabase();

export const dbService = {
  // --- MOVIES ---
  getMovies(): Movie[] {
    try {
      return JSON.parse(localStorage.getItem(KEYS.MOVIES) || '[]');
    } catch {
      return [];
    }
  },

  getMovie(id: string): Movie | undefined {
    return this.getMovies().find(m => m.id === id || m.tmdbId === id);
  },

  addMovie(movie: Omit<Movie, 'id' | 'addedAt'> & { id?: string }): Movie {
    const movies = this.getMovies();
    const newMovie: Movie = {
      ...movie,
      id: movie.id || `movie-${Date.now()}`,
      addedAt: new Date().toISOString(),
    };
    movies.push(newMovie);
    localStorage.setItem(KEYS.MOVIES, JSON.stringify(movies));
    return newMovie;
  },

  updateMovie(id: string, updatedMovie: Partial<Movie>): Movie {
    const movies = this.getMovies();
    const index = movies.findIndex(m => m.id === id);
    if (index === -1) throw new Error(`Movie with ID ${id} not found`);
    
    movies[index] = { ...movies[index], ...updatedMovie };
    localStorage.setItem(KEYS.MOVIES, JSON.stringify(movies));
    return movies[index];
  },

  deleteMovie(id: string): void {
    const movies = this.getMovies();
    const filtered = movies.filter(m => m.id !== id);
    localStorage.setItem(KEYS.MOVIES, JSON.stringify(filtered));
  },

  // --- SERIES ---
  getSeries(): Series[] {
    try {
      return JSON.parse(localStorage.getItem(KEYS.SERIES) || '[]');
    } catch {
      return [];
    }
  },

  getSeriesItem(id: string): Series | undefined {
    return this.getSeries().find(s => s.id === id || s.tmdbId === id);
  },

  addSeries(series: Omit<Series, 'id' | 'addedAt'> & { id?: string }): Series {
    const allSeries = this.getSeries();
    const newSeries: Series = {
      ...series,
      id: series.id || `series-${Date.now()}`,
      addedAt: new Date().toISOString(),
    };
    allSeries.push(newSeries);
    localStorage.setItem(KEYS.SERIES, JSON.stringify(allSeries));
    return newSeries;
  },

  updateSeries(id: string, updatedSeries: Partial<Series>): Series {
    const allSeries = this.getSeries();
    const index = allSeries.findIndex(s => s.id === id);
    if (index === -1) throw new Error(`Series with ID ${id} not found`);
    
    allSeries[index] = { ...allSeries[index], ...updatedSeries };
    localStorage.setItem(KEYS.SERIES, JSON.stringify(allSeries));
    return allSeries[index];
  },

  deleteSeries(id: string): void {
    const allSeries = this.getSeries();
    const filtered = allSeries.filter(s => s.id !== id);
    localStorage.setItem(KEYS.SERIES, JSON.stringify(filtered));
  },

  // --- HOME SECTIONS ---
  getHomeSections(): HomeSection[] {
    try {
      const sections = JSON.parse(localStorage.getItem(KEYS.SECTIONS) || '[]');
      return sections.sort((a: HomeSection, b: HomeSection) => a.order - b.order);
    } catch {
      return [];
    }
  },

  updateHomeSection(id: string, updated: Partial<HomeSection>): HomeSection {
    const sections = this.getHomeSections();
    const index = sections.findIndex(s => s.id === id);
    if (index === -1) throw new Error(`Section with ID ${id} not found`);
    
    sections[index] = { ...sections[index], ...updated };
    localStorage.setItem(KEYS.SECTIONS, JSON.stringify(sections));
    return sections[index];
  },

  saveHomeSections(sections: HomeSection[]): void {
    localStorage.setItem(KEYS.SECTIONS, JSON.stringify(sections));
  },

  addHomeSection(section: Omit<HomeSection, 'id'>): HomeSection {
    const sections = this.getHomeSections();
    const newSection: HomeSection = {
      ...section,
      id: `section-${Date.now()}`,
    };
    sections.push(newSection);
    localStorage.setItem(KEYS.SECTIONS, JSON.stringify(sections));
    return newSection;
  },

  deleteHomeSection(id: string): void {
    const sections = this.getHomeSections();
    const filtered = sections.filter(s => s.id !== id);
    localStorage.setItem(KEYS.SECTIONS, JSON.stringify(filtered));
  },

  // --- FAVORITES ---
  getFavorites(): string[] {
    try {
      return JSON.parse(localStorage.getItem(KEYS.FAVORITES) || '[]');
    } catch {
      return [];
    }
  },

  isFavorite(id: string): boolean {
    return this.getFavorites().includes(id);
  },

  toggleFavorite(id: string): boolean {
    const favorites = this.getFavorites();
    const index = favorites.indexOf(id);
    let favorited = false;
    if (index === -1) {
      favorites.push(id);
      favorited = true;
    } else {
      favorites.splice(index, 1);
    }
    localStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
    return favorited;
  },

  // --- RECENTLY VIEWED ---
  getRecentlyViewed(): string[] {
    try {
      return JSON.parse(localStorage.getItem(KEYS.RECENTLY_VIEWED) || '[]');
    } catch {
      return [];
    }
  },

  addToRecentlyViewed(id: string): void {
    let recent = this.getRecentlyViewed();
    recent = recent.filter(item => item !== id);
    recent.unshift(id);
    recent = recent.slice(0, 10); // cap at 10 items
    localStorage.setItem(KEYS.RECENTLY_VIEWED, JSON.stringify(recent));
  },

  // --- ADMIN AUTH (Perfect Firebase Auth simulations for Netlify/standalone compatibility) ---
  isAdminLoggedIn(): boolean {
    return !!localStorage.getItem(KEYS.ADMIN_TOKEN);
  },

  loginAdmin(email: string, pin: string): { success: boolean; error?: string } {
    if (email.trim().toLowerCase() !== 'herozboy@gmail.com') {
      return { success: false, error: 'Access denied: Only herozboy@gmail.com is authorized.' };
    }
    if (pin === 'admin123' || pin === 'apple2026') {
      localStorage.setItem(KEYS.ADMIN_TOKEN, `admin_session_${Date.now()}`);
      return { success: true };
    }
    return { success: false, error: 'Incorrect passcode. Please try again.' };
  },

  logoutAdmin(): void {
    localStorage.removeItem(KEYS.ADMIN_TOKEN);
  },
};
