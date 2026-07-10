/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../services/db';
import { tmdbService } from '../services/tmdb';
import { Movie, Series, HomeSection, Season, Episode } from '../types';
import { 
  Lock, KeyRound, Film, Tv, Layout, Sliders, Check, Trash2, Edit2, Plus, 
  RefreshCw, Eye, EyeOff, Save, ChevronUp, ChevronDown, CheckCircle2, AlertCircle, LogOut, Search, Loader2 
} from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'movies' | 'series' | 'homepage' | 'settings'>('movies');

  // --- STATE FOR MOVIE MANAGEMENT ---
  const [movies, setMovies] = useState<Movie[]>([]);
  const [editingMovie, setEditingMovie] = useState<Partial<Movie> | null>(null);
  const [movieForm, setMovieForm] = useState<Partial<Movie>>({
    title: '', originalTitle: '', tmdbId: '', customStory: '', subtitleType: 'Both',
    releaseDate: '', releaseYear: '', genres: [], runtime: 120, featured: false,
    heroBanner: false, posterPath: '', backdropPath: '', rating: 7.0, director: '',
    writer: '', producer: '', studio: '', language: 'English', country: 'United States', cast: []
  });
  const [movieSyncing, setMovieSyncing] = useState(false);
  const [movieStatusMsg, setMovieStatusMsg] = useState('');

  // --- STATE FOR SERIES MANAGEMENT ---
  const [series, setSeries] = useState<Series[]>([]);
  const [editingSeries, setEditingSeries] = useState<Partial<Series> | null>(null);
  const [seriesForm, setSeriesForm] = useState<Partial<Series>>({
    title: '', originalTitle: '', tmdbId: '', customStory: '', subtitleType: 'Both',
    releaseYear: '', genres: [], posterPath: '', backdropPath: '', status: 'Returning Series',
    network: 'Apple TV+', language: 'English', rating: 7.5, seasons: []
  });
  const [seriesSyncing, setSeriesSyncing] = useState(false);
  const [seriesStatusMsg, setSeriesStatusMsg] = useState('');
  const [editorExpandedSeasonIdx, setEditorExpandedSeasonIdx] = useState<number | null>(null);

  const handleAddSeasonToForm = () => {
    const currentSeasons = seriesForm.seasons ? [...seriesForm.seasons] : [];
    const nextNum = currentSeasons.length + 1;
    const newSeason: Season = {
      seasonNumber: nextNum,
      name: `Season ${nextNum}`,
      episodes: []
    };
    setSeriesForm(prev => ({
      ...prev,
      seasons: [...currentSeasons, newSeason]
    }));
    setEditorExpandedSeasonIdx(currentSeasons.length);
  };

  const handleUpdateSeasonInForm = (sIdx: number, updatedSeason: Partial<Season>) => {
    if (!seriesForm.seasons) return;
    const updatedSeasons = seriesForm.seasons.map((s, idx) => {
      if (idx === sIdx) {
        return { ...s, ...updatedSeason } as Season;
      }
      return s;
    });
    setSeriesForm(prev => ({
      ...prev,
      seasons: updatedSeasons
    }));
  };

  const handleDeleteSeasonFromForm = (sIdx: number) => {
    if (!seriesForm.seasons) return;
    const updatedSeasons = seriesForm.seasons.filter((_, idx) => idx !== sIdx);
    setSeriesForm(prev => ({
      ...prev,
      seasons: updatedSeasons
    }));
    if (editorExpandedSeasonIdx === sIdx) {
      setEditorExpandedSeasonIdx(null);
    } else if (editorExpandedSeasonIdx !== null && editorExpandedSeasonIdx > sIdx) {
      setEditorExpandedSeasonIdx(editorExpandedSeasonIdx - 1);
    }
  };

  const handleAddEpisodeToSeasonInForm = (sIdx: number) => {
    if (!seriesForm.seasons) return;
    const season = seriesForm.seasons[sIdx];
    const currentEpisodes = season.episodes ? [...season.episodes] : [];
    const nextNum = currentEpisodes.length + 1;
    const newEpisode: Episode = {
      episodeNumber: nextNum,
      name: `Episode ${nextNum}`,
      runtime: 45,
      overview: ''
    };
    
    handleUpdateSeasonInForm(sIdx, {
      episodes: [...currentEpisodes, newEpisode]
    });
  };

  const handleUpdateEpisodeInForm = (sIdx: number, epIdx: number, updatedEp: Partial<Episode>) => {
    if (!seriesForm.seasons) return;
    const season = seriesForm.seasons[sIdx];
    if (!season.episodes) return;
    const updatedEpisodes = season.episodes.map((ep, idx) => {
      if (idx === epIdx) {
        return { ...ep, ...updatedEp } as Episode;
      }
      return ep;
    });
    handleUpdateSeasonInForm(sIdx, {
      episodes: updatedEpisodes
    });
  };

  const handleDeleteEpisodeFromForm = (sIdx: number, epIdx: number) => {
    if (!seriesForm.seasons) return;
    const season = seriesForm.seasons[sIdx];
    if (!season.episodes) return;
    const updatedEpisodes = season.episodes.filter((_, idx) => idx !== epIdx);
    handleUpdateSeasonInForm(sIdx, {
      episodes: updatedEpisodes
    });
  };

  // --- STATE FOR HOMEPAGE MANAGEMENT ---
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionType, setNewSectionType] = useState<'movies' | 'series'>('movies');
  const [newSectionListType, setNewSectionListType] = useState<HomeSection['listType']>('trending');
  const [newSectionVal, setNewSectionVal] = useState('');

  // --- STATE FOR TMDB AUTOCOMPLETE SEARCH ---
  const [movieSearchQuery, setMovieSearchQuery] = useState('');
  const [movieSearchResults, setMovieSearchResults] = useState<any[]>([]);
  const [showMovieDropdown, setShowMovieDropdown] = useState(false);
  const [isSearchingMovies, setIsSearchingMovies] = useState(false);

  const [seriesSearchQuery, setSeriesSearchQuery] = useState('');
  const [seriesSearchResults, setSeriesSearchResults] = useState<any[]>([]);
  const [showSeriesDropdown, setShowSeriesDropdown] = useState(false);
  const [isSearchingSeries, setIsSearchingSeries] = useState(false);

  // --- GENERAL ---
  const [successBanner, setSuccessBanner] = useState('');

  // TMDB Movie Autocomplete Search Effect
  useEffect(() => {
    if (movieSearchQuery.trim().length < 2) {
      setMovieSearchResults([]);
      setIsSearchingMovies(false);
      return;
    }
    setIsSearchingMovies(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const results = await tmdbService.searchMovies(movieSearchQuery);
        setMovieSearchResults(results.slice(0, 6));
      } catch (err) {
        console.error('Error searching movies:', err);
      } finally {
        setIsSearchingMovies(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [movieSearchQuery]);

  // TMDB Series Autocomplete Search Effect
  useEffect(() => {
    if (seriesSearchQuery.trim().length < 2) {
      setSeriesSearchResults([]);
      setIsSearchingSeries(false);
      return;
    }
    setIsSearchingSeries(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const results = await tmdbService.searchTv(seriesSearchQuery);
        setSeriesSearchResults(results.slice(0, 6));
      } catch (err) {
        console.error('Error searching TV series:', err);
      } finally {
        setIsSearchingSeries(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [seriesSearchQuery]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const authed = dbService.isAdminLoggedIn();
    if (!authed) {
      navigate('/', { replace: true });
    } else {
      setIsLoggedIn(true);
      loadDbData();
    }
  }, [isLoggedIn, navigate]);

  const checkAuth = () => {
    setIsLoggedIn(dbService.isAdminLoggedIn());
  };

  const loadDbData = () => {
    setMovies(dbService.getMovies());
    setSeries(dbService.getSeries());
    setSections(dbService.getHomeSections());
  };

  const handleLogout = () => {
    dbService.logoutAdmin();
    setIsLoggedIn(false);
    window.dispatchEvent(new Event('admin_auth_changed'));
  };

  const triggerSuccessBanner = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(''), 3500);
  };

  // ==========================================
  // --- TMDB MOVIE AUTOSYNC ENGINE ---
  // ==========================================
  const handleMovieTmdbSync = async () => {
    if (!movieForm.tmdbId) {
      setMovieStatusMsg('Please enter a TMDB ID first (e.g. 693134)');
      return;
    }
    setMovieSyncing(true);
    setMovieStatusMsg('Querying TMDB endpoints...');
    try {
      const data = await tmdbService.fetchMovieMetadata(movieForm.tmdbId);
      setMovieForm(prev => ({
        ...prev,
        title: data.title || prev.title,
        originalTitle: data.originalTitle || prev.originalTitle,
        releaseDate: data.releaseDate || prev.releaseDate,
        releaseYear: data.releaseYear || prev.releaseYear,
        genres: data.genres || prev.genres,
        runtime: data.runtime || prev.runtime,
        posterPath: data.posterPath || prev.posterPath,
        backdropPath: data.backdropPath || prev.backdropPath,
        rating: Number(data.rating.toFixed(1)) || prev.rating,
        director: data.director || prev.director,
        writer: data.writer || prev.writer,
        producer: data.producer || prev.producer,
        studio: data.studio || prev.studio,
        language: data.language || prev.language,
        country: data.country || prev.country,
        cast: data.cast || prev.cast,
      }));
      setMovieStatusMsg('TMDB Sync Completed successfully!');
    } catch (err: any) {
      console.error(err);
      setMovieStatusMsg(`TMDB Error: ${err.message || 'ID not found'}`);
    } finally {
      setMovieSyncing(false);
    }
  };

  const handleSelectMovieResult = async (item: any) => {
    setShowMovieDropdown(false);
    setMovieSearchQuery('');
    setMovieSyncing(true);
    setMovieStatusMsg(`Fetching metadata for "${item.title}"...`);
    try {
      const data = await tmdbService.fetchMovieMetadata(String(item.id));
      setMovieForm(prev => ({
        ...prev,
        title: data.title || '',
        originalTitle: data.originalTitle || '',
        tmdbId: String(item.id),
        customStory: prev.customStory || '',
        subtitleType: prev.subtitleType || 'Both',
        releaseDate: data.releaseDate || '',
        releaseYear: data.releaseYear || '',
        genres: data.genres || [],
        runtime: data.runtime || 120,
        posterPath: data.posterPath || '',
        backdropPath: data.backdropPath || '',
        rating: Number(data.rating.toFixed(1)) || 7.0,
        director: data.director || 'Unknown',
        writer: data.writer || 'Unknown',
        producer: data.producer || 'Unknown',
        studio: data.studio || 'Unknown',
        language: data.language || 'English',
        country: data.country || 'United States',
        cast: data.cast || [],
      }));
      setMovieStatusMsg(`Prefilled details for "${data.title}" successfully!`);
    } catch (err: any) {
      console.error(err);
      setMovieStatusMsg(`Prefill Error: ${err.message || 'Details not found'}`);
    } finally {
      setMovieSyncing(false);
    }
  };

  // --- MOVIE SAVE & FORM ACTIONS ---
  const handleMovieSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieForm.title || !movieForm.posterPath || !movieForm.backdropPath) {
      alert('Title, Poster Path, and Backdrop Path are mandatory!');
      return;
    }

    const payload = {
      title: movieForm.title!,
      originalTitle: movieForm.originalTitle || movieForm.title,
      tmdbId: movieForm.tmdbId || String(Date.now()),
      customStory: movieForm.customStory || '',
      subtitleType: movieForm.subtitleType || 'Both',
      releaseDate: movieForm.releaseDate || '',
      releaseYear: movieForm.releaseYear || '',
      genres: movieForm.genres || [],
      runtime: Number(movieForm.runtime) || 120,
      featured: !!movieForm.featured,
      heroBanner: !!movieForm.heroBanner,
      posterPath: movieForm.posterPath!,
      backdropPath: movieForm.backdropPath!,
      rating: Number(movieForm.rating) || 7.0,
      director: movieForm.director || 'Unknown',
      writer: movieForm.writer || 'Unknown',
      producer: movieForm.producer || 'Unknown',
      studio: movieForm.studio || 'Unknown',
      language: movieForm.language || 'English',
      country: movieForm.country || 'United States',
      cast: movieForm.cast || [],
    };

    if (editingMovie) {
      dbService.updateMovie(editingMovie.id!, payload);
      triggerSuccessBanner(`Successfully updated movie: ${payload.title}`);
    } else {
      dbService.addMovie(payload);
      triggerSuccessBanner(`Successfully created new movie: ${payload.title}`);
    }

    // Reset Form
    setEditingMovie(null);
    setMovieForm({
      title: '', originalTitle: '', tmdbId: '', customStory: '', subtitleType: 'Both',
      releaseDate: '', releaseYear: '', genres: [], runtime: 120, featured: false,
      heroBanner: false, posterPath: '', backdropPath: '', rating: 7.0, director: '',
      writer: '', producer: '', studio: '', language: 'English', country: 'United States', cast: []
    });
    setMovieStatusMsg('');
    loadDbData();
  };

  const handleEditMovieClick = (movie: Movie) => {
    setEditingMovie(movie);
    setMovieForm(movie);
  };

  const handleDeleteMovieClick = (id: string, name: string) => {
    if (confirm(`Are you absolutely sure you want to delete "${name}"? This action cannot be undone.`)) {
      dbService.deleteMovie(id);
      triggerSuccessBanner(`Deleted Movie: ${name}`);
      loadDbData();
    }
  };

  // ==========================================
  // --- TMDB TV SERIES AUTOSYNC ENGINE ---
  // ==========================================
  const handleSeriesTmdbSync = async () => {
    if (!seriesForm.tmdbId) {
      setSeriesStatusMsg('Please enter a TMDB ID first (e.g. 95396)');
      return;
    }
    setSeriesSyncing(true);
    setSeriesStatusMsg('Querying TMDB endpoints...');
    try {
      const data = await tmdbService.fetchSeriesMetadata(seriesForm.tmdbId);
      setSeriesForm(prev => ({
        ...prev,
        title: data.title || prev.title,
        originalTitle: data.originalTitle || prev.originalTitle,
        releaseYear: data.releaseYear || prev.releaseYear,
        genres: data.genres || prev.genres,
        posterPath: data.posterPath || prev.posterPath,
        backdropPath: data.backdropPath || prev.backdropPath,
        status: data.status || prev.status,
        network: data.network || prev.network,
        language: data.language || prev.language,
        rating: Number(data.rating.toFixed(1)) || prev.rating,
        seasons: data.seasons || prev.seasons,
      }));
      setSeriesStatusMsg('TMDB Sync Completed successfully!');
    } catch (err: any) {
      console.error(err);
      setSeriesStatusMsg(`TMDB Error: ${err.message || 'ID not found'}`);
    } finally {
      setSeriesSyncing(false);
    }
  };

  const handleSelectSeriesResult = async (item: any) => {
    setShowSeriesDropdown(false);
    setSeriesSearchQuery('');
    setSeriesSyncing(true);
    setSeriesStatusMsg(`Fetching metadata for "${item.name}"...`);
    try {
      const data = await tmdbService.fetchSeriesMetadata(String(item.id));
      setSeriesForm(prev => ({
        ...prev,
        title: data.title || '',
        originalTitle: data.originalTitle || '',
        tmdbId: String(item.id),
        customStory: prev.customStory || '',
        subtitleType: prev.subtitleType || 'Both',
        releaseYear: data.releaseYear || '',
        genres: data.genres || [],
        posterPath: data.posterPath || '',
        backdropPath: data.backdropPath || '',
        status: data.status || 'Returning Series',
        network: data.network || 'Apple TV+',
        language: data.language || 'English',
        rating: Number(data.rating.toFixed(1)) || 7.5,
        seasons: data.seasons || [],
      }));
      setSeriesStatusMsg(`Prefilled details for "${data.title}" successfully!`);
    } catch (err: any) {
      console.error(err);
      setSeriesStatusMsg(`Prefill Error: ${err.message || 'Details not found'}`);
    } finally {
      setSeriesSyncing(false);
    }
  };

  // --- SERIES SAVE & FORM ACTIONS ---
  const handleSeriesSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seriesForm.title || !seriesForm.posterPath || !seriesForm.backdropPath) {
      alert('Title, Poster, and Backdrop Paths are required!');
      return;
    }

    const payload = {
      title: seriesForm.title!,
      originalTitle: seriesForm.originalTitle || seriesForm.title,
      tmdbId: seriesForm.tmdbId || String(Date.now()),
      customStory: seriesForm.customStory || '',
      subtitleType: seriesForm.subtitleType || 'Both',
      releaseYear: seriesForm.releaseYear || '',
      genres: seriesForm.genres || [],
      posterPath: seriesForm.posterPath!,
      backdropPath: seriesForm.backdropPath!,
      status: seriesForm.status || 'Returning Series',
      network: seriesForm.network || 'Apple TV+',
      language: seriesForm.language || 'English',
      rating: Number(seriesForm.rating) || 7.5,
      seasons: seriesForm.seasons || [],
    };

    if (editingSeries) {
      dbService.updateSeries(editingSeries.id!, payload);
      triggerSuccessBanner(`Successfully updated series: ${payload.title}`);
    } else {
      dbService.addSeries(payload);
      triggerSuccessBanner(`Successfully created new TV Series: ${payload.title}`);
    }

    setEditingSeries(null);
    setSeriesForm({
      title: '', originalTitle: '', tmdbId: '', customStory: '', subtitleType: 'Both',
      releaseYear: '', genres: [], posterPath: '', backdropPath: '', status: 'Returning Series',
      network: 'Apple TV+', language: 'English', rating: 7.5, seasons: []
    });
    setSeriesStatusMsg('');
    setEditorExpandedSeasonIdx(null);
    loadDbData();
  };

  const handleEditSeriesClick = (series: Series) => {
    setEditingSeries(series);
    setSeriesForm(series);
  };

  const handleDeleteSeriesClick = (id: string, name: string) => {
    if (confirm(`Are you absolutely sure you want to delete TV Series "${name}"?`)) {
      dbService.deleteSeries(id);
      triggerSuccessBanner(`Deleted Series: ${name}`);
      loadDbData();
    }
  };

  // ==========================================
  // --- SECTIONS & HOMEPAGE row MANAGEMENT ---
  // ==========================================
  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle) return;

    dbService.addHomeSection({
      title: newSectionTitle,
      type: newSectionType,
      listType: newSectionListType,
      value: newSectionVal,
      order: sections.length,
      isVisible: true,
    });

    setNewSectionTitle('');
    setNewSectionVal('');
    triggerSuccessBanner('Created new row list section!');
    loadDbData();
  };

  const handleToggleSectionVisible = (id: string, current: boolean) => {
    dbService.updateHomeSection(id, { isVisible: !current });
    loadDbData();
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const nextIdx = direction === 'up' ? index - 1 : index + 1;
    if (nextIdx < 0 || nextIdx >= sections.length) return;

    const items = [...sections];
    const temp = items[index];
    items[index] = items[nextIdx];
    items[nextIdx] = temp;

    // Re-index orders
    items.forEach((item, idx) => {
      item.order = idx;
    });

    dbService.saveHomeSections(items);
    setSections(items);
  };

  const handleDeleteSection = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete row section "${name}"?`)) {
      dbService.deleteHomeSection(id);
      loadDbData();
    }
  };

  // --- SYSTEM RESET ---
  const handleResetAppDb = () => {
    if (confirm('WARNING: This will reset the database back to standard, pre-seeded values, removing any custom entries you have made. Proceed?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // --- AUTH LOCKED GATE CHECK ---
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="w-full bg-apple-gray-900 min-h-screen pt-28 pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col gap-8 text-left">
        
        {/* Admin Success Banner Toast */}
        {successBanner && (
          <div className="fixed top-24 right-6 md:right-12 z-50 p-4 rounded-xl bg-emerald-500 text-black font-bold text-sm shadow-2xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-5 h-5" />
            <span>{successBanner}</span>
          </div>
        )}

        {/* Dashboard Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-600/10 text-red-500 rounded-2xl border border-red-500/10">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
                Ocean TV Control Panel
              </h1>
              <p className="text-xs sm:text-sm text-apple-gray-300 font-medium">
                Sync TMDB metadata, manage seasons, edit row orders, and curate story summaries.
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white hover:text-black border border-white/5 text-white/80 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-center"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex gap-2 border-b border-white/5 pb-3 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab('movies')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'movies' ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Film className="w-4.5 h-4.5" />
            Manage Movies ({movies.length})
          </button>
          <button
            onClick={() => setActiveTab('series')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'series' ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Tv className="w-4.5 h-4.5" />
            Manage TV Series ({series.length})
          </button>
          <button
            onClick={() => setActiveTab('homepage')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'homepage' ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Layout className="w-4.5 h-4.5" />
            Home Layout Rows
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'settings' ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sliders className="w-4.5 h-4.5" />
            Settings & Reset
          </button>
        </div>

        {/* ========================================== */}
        {/* --- MOVIES MANAGEMENT TABS PANEL --- */}
        {/* ========================================== */}
        {activeTab === 'movies' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT 2/3: Form Creation */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/8 flex flex-col gap-5 shadow-lg">
                <h2 className="font-display font-bold text-lg sm:text-xl text-white flex items-center gap-2">
                  <Film className="w-5 h-5 text-red-500" />
                  {editingMovie ? 'Modify Movie Record' : 'Record New Movie Entry'}
                </h2>

                <form onSubmit={handleMovieSave} className="flex flex-col gap-5 text-left">
                  {/* TMDB Auto-Sync row */}
                  <div className="bg-white/3 p-5 rounded-2xl border border-white/5 flex flex-col gap-4 relative">
                    <div className="flex flex-col md:flex-row gap-4 items-stretch">
                      
                      {/* TMDB Search by Name */}
                      <div className="flex-1 flex flex-col gap-1.5 relative">
                        <label className="text-[10px] font-black text-cyan-400 tracking-wider uppercase flex items-center gap-1">
                          <Search className="w-3 h-3 text-cyan-400" />
                          Search TMDB to Auto-Prefill Movie
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={movieSearchQuery}
                            onChange={(e) => {
                              setMovieSearchQuery(e.target.value);
                              setShowMovieDropdown(true);
                            }}
                            onFocus={() => setShowMovieDropdown(true)}
                            placeholder="Type movie name (e.g. Interstellar)..."
                            className="w-full bg-apple-gray-800 text-white border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold focus:border-cyan-500/50 outline-none"
                          />
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          {isSearchingMovies && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 animate-spin" />
                          )}
                        </div>

                        {/* Dropdown results overlay */}
                        {showMovieDropdown && movieSearchQuery.trim().length >= 2 && (
                          <div className="absolute top-[100%] left-0 right-0 mt-2 bg-[#161617] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-[280px] overflow-y-auto custom-scrollbar">
                            <div className="p-2 border-b border-white/5 flex justify-between items-center bg-white/2">
                              <span className="text-[9px] font-black uppercase text-white/30 tracking-wider">TMDB Movie Results</span>
                              <button
                                type="button"
                                onClick={() => setShowMovieDropdown(false)}
                                className="text-[10px] text-white/40 hover:text-white font-bold cursor-pointer"
                              >
                                Close
                              </button>
                            </div>
                            {movieSearchResults.length === 0 && !isSearchingMovies ? (
                              <div className="p-4 text-xs text-white/40 text-center">No titles found. Try another query.</div>
                            ) : (
                              movieSearchResults.map((item) => {
                                const year = item.release_date ? item.release_date.substring(0, 4) : 'N/A';
                                const thumb = item.poster_path 
                                  ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                                  : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=92';
                                return (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onMouseDown={() => handleSelectMovieResult(item)}
                                    className="w-full text-left p-2.5 hover:bg-white/5 flex items-center gap-3 transition-colors border-b border-white/3 last:border-b-0 cursor-pointer"
                                  >
                                    <img
                                      src={thumb}
                                      alt=""
                                      className="w-8 h-11 rounded object-cover bg-white/5 flex-shrink-0"
                                    />
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-white truncate">{item.title}</p>
                                      <p className="text-[10px] text-white/45 font-mono mt-0.5">{year} • Rating: {item.vote_average ? item.vote_average.toFixed(1) : '0'}</p>
                                    </div>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>

                      {/* Manual TMDB ID Input (So they can still prefill or enter manually) */}
                      <div className="w-full md:w-[200px] flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-white/40 tracking-wider uppercase">TMDB ID (Optional)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={movieForm.tmdbId || ''}
                            onChange={(e) => setMovieForm(prev => ({ ...prev, tmdbId: e.target.value }))}
                            placeholder="e.g. 693134"
                            className="flex-1 bg-apple-gray-800 text-white border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleMovieTmdbSync}
                            disabled={movieSyncing || !movieForm.tmdbId}
                            className="px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs rounded-xl flex items-center justify-center transition-all cursor-pointer disabled:opacity-40"
                            title="Force Sync TMDB ID"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${movieSyncing ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                      </div>

                    </div>
                    <p className="text-[10px] text-white/30 font-medium">
                      💡 <span className="text-white/50">Tip:</span> Search by movie name and choose from the list to populate metadata instantly, or fill in fields below manually.
                    </p>
                  </div>

                  {movieStatusMsg && (
                    <p className="text-xs font-semibold text-yellow-400 font-mono mt-1 px-1">
                      Status: {movieStatusMsg}
                    </p>
                  )}

                  {/* Core forms */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-white/40 tracking-wider uppercase">Movie Title</label>
                      <input
                        type="text"
                        value={movieForm.title || ''}
                        onChange={(e) => setMovieForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Interstellar"
                        className="bg-apple-gray-800/60 text-white border border-white/5 rounded-lg px-3 py-2.5 text-xs font-medium focus:border-white/20 outline-none"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-white/40 tracking-wider uppercase">Original Title</label>
                      <input
                        type="text"
                        value={movieForm.originalTitle || ''}
                        onChange={(e) => setMovieForm(prev => ({ ...prev, originalTitle: e.target.value }))}
                        className="bg-apple-gray-800/60 text-white border border-white/5 rounded-lg px-3 py-2.5 text-xs font-medium focus:border-white/20 outline-none"
                      />
                    </div>
                  </div>

                  {/* Paths */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-white/40 tracking-wider uppercase">Poster URL path</label>
                      <input
                        type="text"
                        value={movieForm.posterPath || ''}
                        onChange={(e) => setMovieForm(prev => ({ ...prev, posterPath: e.target.value }))}
                        placeholder="https://image.tmdb.org/t/p/w500/..."
                        className="bg-apple-gray-800/60 text-white border border-white/5 rounded-lg px-3 py-2.5 text-xs font-medium focus:border-white/20 outline-none"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-white/40 tracking-wider uppercase">Backdrop URL path</label>
                      <input
                        type="text"
                        value={movieForm.backdropPath || ''}
                        onChange={(e) => setMovieForm(prev => ({ ...prev, backdropPath: e.target.value }))}
                        placeholder="https://image.tmdb.org/t/p/original/..."
                        className="bg-apple-gray-800/60 text-white border border-white/5 rounded-lg px-3 py-2.5 text-xs font-medium focus:border-white/20 outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Story summary (typed manually as requested) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-white/40 tracking-wider uppercase">Custom Story Summary (Write Manually)</label>
                    <textarea
                      value={movieForm.customStory || ''}
                      onChange={(e) => setMovieForm(prev => ({ ...prev, customStory: e.target.value }))}
                      placeholder="Write an engaging localized synopsis for this film manually. Do NOT paste generic database descriptions."
                      className="bg-apple-gray-800/60 text-white border border-white/5 rounded-lg p-3 text-xs font-medium focus:border-white/20 outline-none h-24"
                    />
                  </div>

                  {/* Subtitle selections, release date, runtime, rating */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-white/40 tracking-wider uppercase">Subtitles</label>
                      <select
                        value={movieForm.subtitleType || 'Both'}
                        onChange={(e: any) => setMovieForm(prev => ({ ...prev, subtitleType: e.target.value }))}
                        className="bg-apple-gray-800 text-white border border-white/10 rounded-lg p-2 text-xs font-bold"
                      >
                        <option value="Myanmar">Myanmar</option>
                        <option value="English">English</option>
                        <option value="Both">Both (MM + EN)</option>
                        <option value="None">None</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-white/40 tracking-wider uppercase">Release Date</label>
                      <input
                        type="date"
                        value={movieForm.releaseDate || ''}
                        onChange={(e) => setMovieForm(prev => ({ ...prev, releaseDate: e.target.value, releaseYear: e.target.value.substring(0,4) }))}
                        className="bg-apple-gray-800 text-white border border-white/10 rounded-lg p-2 text-xs font-bold"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-white/40 tracking-wider uppercase">Runtime (Min)</label>
                      <input
                        type="number"
                        value={movieForm.runtime || 120}
                        onChange={(e) => setMovieForm(prev => ({ ...prev, runtime: Number(e.target.value) }))}
                        className="bg-apple-gray-800 text-white border border-white/10 rounded-lg p-2 text-xs font-bold"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-white/40 tracking-wider uppercase">TMDB Rating</label>
                      <input
                        type="number"
                        step="0.1"
                        value={movieForm.rating || 7.0}
                        onChange={(e) => setMovieForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
                        className="bg-apple-gray-800 text-white border border-white/10 rounded-lg p-2 text-xs font-bold"
                      />
                    </div>
                  </div>

                  {/* Genres checkbox selector or text input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-white/40 tracking-wider uppercase">Genres (comma separated)</label>
                    <input
                      type="text"
                      value={movieForm.genres?.join(', ') || ''}
                      onChange={(e) => setMovieForm(prev => ({ ...prev, genres: e.target.value.split(',').map(g => g.trim()) }))}
                      placeholder="e.g. Sci-Fi, Drama, Adventure"
                      className="bg-apple-gray-800/60 text-white border border-white/5 rounded-lg px-3 py-2.5 text-xs font-semibold outline-none"
                    />
                  </div>

                  {/* Team specs */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-white/40 tracking-wider uppercase">Director</label>
                      <input
                        type="text"
                        value={movieForm.director || ''}
                        onChange={(e) => setMovieForm(prev => ({ ...prev, director: e.target.value }))}
                        className="bg-apple-gray-800 text-white border border-white/10 rounded-lg p-2 text-xs font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-white/40 tracking-wider uppercase">Writer</label>
                      <input
                        type="text"
                        value={movieForm.writer || ''}
                        onChange={(e) => setMovieForm(prev => ({ ...prev, writer: e.target.value }))}
                        className="bg-apple-gray-800 text-white border border-white/10 rounded-lg p-2 text-xs font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-white/40 tracking-wider uppercase">Studio</label>
                      <input
                        type="text"
                        value={movieForm.studio || ''}
                        onChange={(e) => setMovieForm(prev => ({ ...prev, studio: e.target.value }))}
                        className="bg-apple-gray-800 text-white border border-white/10 rounded-lg p-2 text-xs font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-white/40 tracking-wider uppercase">Country</label>
                      <input
                        type="text"
                        value={movieForm.country || ''}
                        onChange={(e) => setMovieForm(prev => ({ ...prev, country: e.target.value }))}
                        className="bg-apple-gray-800 text-white border border-white/10 rounded-lg p-2 text-xs font-bold"
                      />
                    </div>
                  </div>

                  {/* Banner/Featured checkboxes */}
                  <div className="flex flex-wrap gap-6 py-2">
                    <label className="flex items-center gap-2.5 text-xs font-bold text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!movieForm.heroBanner}
                        onChange={(e) => setMovieForm(prev => ({ ...prev, heroBanner: e.target.checked }))}
                        className="w-4 h-4 rounded border-white/10 bg-apple-gray-800 accent-white"
                      />
                      Add to Cinematic Hero Banner Carousel
                    </label>

                    <label className="flex items-center gap-2.5 text-xs font-bold text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!movieForm.featured}
                        onChange={(e) => setMovieForm(prev => ({ ...prev, featured: e.target.checked }))}
                        className="w-4 h-4 rounded border-white/10 bg-apple-gray-800 accent-white"
                      />
                      Add to Editor's Picks / Featured rows
                    </label>
                  </div>

                  {/* Save action */}
                  <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                    {editingMovie && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMovie(null);
                          setMovieForm({
                            title: '', originalTitle: '', tmdbId: '', customStory: '', subtitleType: 'Both',
                            releaseDate: '', releaseYear: '', genres: [], runtime: 120, featured: false,
                            heroBanner: false, posterPath: '', backdropPath: '', rating: 7.0, director: '',
                            writer: '', producer: '', studio: '', language: 'English', country: 'United States', cast: []
                          });
                          setMovieStatusMsg('');
                        }}
                        className="px-5 py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold cursor-pointer"
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-7 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                    >
                      <Save className="w-4 h-4" />
                      {editingMovie ? 'Save Movie Changes' : 'Create Movie Record'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* RIGHT 1/3: Movies Record Index List */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-black text-white/35 tracking-wider uppercase">Active Movie Catalogue</h3>
              <div className="flex flex-col gap-3 max-h-[750px] overflow-y-auto custom-scrollbar pr-2">
                {movies.map((m) => (
                  <div
                    key={m.id}
                    className="glass-panel p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={m.posterPath}
                        alt=""
                        className="w-10 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 text-left">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[130px]">{m.title}</h4>
                        <p className="text-[10px] text-apple-gray-300 font-mono mt-0.5">{m.releaseYear} • {m.runtime}m</p>
                        {m.heroBanner && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 mt-1 uppercase">
                            Hero Slide
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleEditMovieClick(m)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 transition-colors cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMovieClick(m.id, m.title)}
                        className="p-2 rounded-lg bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white transition-colors cursor-pointer animate-pulse"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================== */}
        {/* --- TV SERIES MANAGEMENT PANEL --- */}
        {/* ========================================== */}
        {activeTab === 'series' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT 2/3: Series Entry Form */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/8 flex flex-col gap-5 shadow-lg">
                <h2 className="font-display font-bold text-lg sm:text-xl text-white flex items-center gap-2">
                  <Tv className="w-5 h-5 text-red-500" />
                  {editingSeries ? 'Modify TV Series' : 'Record New TV Series'}
                </h2>

                <form onSubmit={handleSeriesSave} className="flex flex-col gap-5 text-left">
                  {/* TMDB Sync */}
                  <div className="bg-white/3 p-5 rounded-2xl border border-white/5 flex flex-col gap-4 relative">
                    <div className="flex flex-col md:flex-row gap-4 items-stretch">
                      
                      {/* TMDB Search by Name */}
                      <div className="flex-1 flex flex-col gap-1.5 relative">
                        <label className="text-[10px] font-black text-cyan-400 tracking-wider uppercase flex items-center gap-1">
                          <Search className="w-3 h-3 text-cyan-400" />
                          Search TMDB to Auto-Prefill TV Series
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={seriesSearchQuery}
                            onChange={(e) => {
                              setSeriesSearchQuery(e.target.value);
                              setShowSeriesDropdown(true);
                            }}
                            onFocus={() => setShowSeriesDropdown(true)}
                            placeholder="Type TV show name (e.g. Ted Lasso)..."
                            className="w-full bg-apple-gray-800 text-white border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold focus:border-cyan-500/50 outline-none"
                          />
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          {isSearchingSeries && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 animate-spin" />
                          )}
                        </div>

                        {/* Dropdown results overlay */}
                        {showSeriesDropdown && seriesSearchQuery.trim().length >= 2 && (
                          <div className="absolute top-[100%] left-0 right-0 mt-2 bg-[#161617] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-[280px] overflow-y-auto custom-scrollbar">
                            <div className="p-2 border-b border-white/5 flex justify-between items-center bg-white/2">
                              <span className="text-[9px] font-black uppercase text-white/30 tracking-wider">TMDB TV Results</span>
                              <button
                                type="button"
                                onClick={() => setShowSeriesDropdown(false)}
                                className="text-[10px] text-white/40 hover:text-white font-bold cursor-pointer"
                              >
                                Close
                              </button>
                            </div>
                            {seriesSearchResults.length === 0 && !isSearchingSeries ? (
                              <div className="p-4 text-xs text-white/40 text-center">No shows found. Try another query.</div>
                            ) : (
                              seriesSearchResults.map((item) => {
                                const year = item.first_air_date ? item.first_air_date.substring(0, 4) : 'N/A';
                                const thumb = item.poster_path 
                                  ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                                  : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=92';
                                return (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onMouseDown={() => handleSelectSeriesResult(item)}
                                    className="w-full text-left p-2.5 hover:bg-white/5 flex items-center gap-3 transition-colors border-b border-white/3 last:border-b-0 cursor-pointer"
                                  >
                                    <img
                                      src={thumb}
                                      alt=""
                                      className="w-8 h-11 rounded object-cover bg-white/5 flex-shrink-0"
                                    />
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-white truncate">{item.name}</p>
                                      <p className="text-[10px] text-white/45 font-mono mt-0.5">{year} • Rating: {item.vote_average ? item.vote_average.toFixed(1) : '0'}</p>
                                    </div>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>

                      {/* Manual TMDB ID Input */}
                      <div className="w-full md:w-[200px] flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-white/40 tracking-wider uppercase">TMDB ID (Optional)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={seriesForm.tmdbId || ''}
                            onChange={(e) => setSeriesForm(prev => ({ ...prev, tmdbId: e.target.value }))}
                            placeholder="e.g. 95396"
                            className="flex-1 bg-apple-gray-800 text-white border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleSeriesTmdbSync}
                            disabled={seriesSyncing || !seriesForm.tmdbId}
                            className="px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs rounded-xl flex items-center justify-center transition-all cursor-pointer disabled:opacity-40"
                            title="Force Sync TMDB ID"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${seriesSyncing ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                      </div>

                    </div>
                    <p className="text-[10px] text-white/30 font-medium">
                      💡 <span className="text-white/50">Tip:</span> Search by show name and choose from the list to populate series metadata instantly, or fill in fields below manually.
                    </p>
                  </div>

                  {seriesStatusMsg && (
                    <p className="text-xs font-semibold text-yellow-400 font-mono mt-1 px-1">
                      Status: {seriesStatusMsg}
                    </p>
                  )}

                  {/* Core names */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-white/40 tracking-wider uppercase">Series Title</label>
                      <input
                        type="text"
                        value={seriesForm.title || ''}
                        onChange={(e) => setSeriesForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Severance"
                        className="bg-apple-gray-800/60 text-white border border-white/5 rounded-lg px-3 py-2.5 text-xs font-medium outline-none"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-white/40 tracking-wider uppercase">Original Title</label>
                      <input
                        type="text"
                        value={seriesForm.originalTitle || ''}
                        onChange={(e) => setSeriesForm(prev => ({ ...prev, originalTitle: e.target.value }))}
                        className="bg-apple-gray-800/60 text-white border border-white/5 rounded-lg px-3 py-2.5 text-xs font-medium outline-none"
                      />
                    </div>
                  </div>

                  {/* Images */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-white/40 tracking-wider uppercase">Poster Path</label>
                      <input
                        type="text"
                        value={seriesForm.posterPath || ''}
                        onChange={(e) => setSeriesForm(prev => ({ ...prev, posterPath: e.target.value }))}
                        className="bg-apple-gray-800/60 text-white border border-white/5 rounded-lg px-3 py-2.5 text-xs font-medium outline-none"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-white/40 tracking-wider uppercase">Backdrop Path</label>
                      <input
                        type="text"
                        value={seriesForm.backdropPath || ''}
                        onChange={(e) => setSeriesForm(prev => ({ ...prev, backdropPath: e.target.value }))}
                        className="bg-apple-gray-800/60 text-white border border-white/5 rounded-lg px-3 py-2.5 text-xs font-medium outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Story Summary written manually as requested */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-white/40 tracking-wider uppercase">Custom Story Summary (Write Manually)</label>
                    <textarea
                      value={seriesForm.customStory || ''}
                      onChange={(e) => setSeriesForm(prev => ({ ...prev, customStory: e.target.value }))}
                      placeholder="Enter a compelling custom narrative or commentary about this TV series manually."
                      className="bg-apple-gray-800/60 text-white border border-white/5 rounded-lg p-3 text-xs font-medium outline-none h-24"
                    />
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-white/40 tracking-wider uppercase">Subtitles</label>
                      <select
                        value={seriesForm.subtitleType || 'Both'}
                        onChange={(e: any) => setSeriesForm(prev => ({ ...prev, subtitleType: e.target.value }))}
                        className="bg-apple-gray-800 text-white border border-white/10 rounded-lg p-2 text-xs font-bold"
                      >
                        <option value="Myanmar">Myanmar</option>
                        <option value="English">English</option>
                        <option value="Both">Both (MM + EN)</option>
                        <option value="None">None</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-white/40 tracking-wider uppercase">Air Date Year</label>
                      <input
                        type="text"
                        value={seriesForm.releaseYear || ''}
                        onChange={(e) => setSeriesForm(prev => ({ ...prev, releaseYear: e.target.value }))}
                        placeholder="e.g. 2022"
                        className="bg-apple-gray-800 text-white border border-white/10 rounded-lg p-2 text-xs font-bold"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-white/40 tracking-wider uppercase">Network</label>
                      <input
                        type="text"
                        value={seriesForm.network || 'Apple TV+'}
                        onChange={(e) => setSeriesForm(prev => ({ ...prev, network: e.target.value }))}
                        className="bg-apple-gray-800 text-white border border-white/10 rounded-lg p-2 text-xs font-bold"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-white/40 tracking-wider uppercase">TMDB Rating</label>
                      <input
                        type="number"
                        step="0.1"
                        value={seriesForm.rating || 7.5}
                        onChange={(e) => setSeriesForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
                        className="bg-apple-gray-800 text-white border border-white/10 rounded-lg p-2 text-xs font-bold"
                      />
                    </div>
                  </div>

                  {/* Genres comma list */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-white/40 tracking-wider uppercase">Genres (comma separated)</label>
                    <input
                      type="text"
                      value={seriesForm.genres?.join(', ') || ''}
                      onChange={(e) => setSeriesForm(prev => ({ ...prev, genres: e.target.value.split(',').map(g => g.trim()) }))}
                      className="bg-apple-gray-800/60 text-white border border-white/5 rounded-lg px-3 py-2.5 text-xs font-semibold outline-none"
                    />
                  </div>

                  {/* SEASONS & EPISODES NESTED EDITOR */}
                  <div className="flex flex-col gap-4 bg-black/30 p-5 rounded-2xl border border-white/5 mt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] font-black text-cyan-400 tracking-wider uppercase">Seasons & Episodes Guide Editor</span>
                        <span className="text-[11px] text-white/50 font-medium">Add seasons, update titles, or write episode synopses manually.</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddSeasonToForm}
                        className="px-3 py-1.5 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/20 text-cyan-400 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-center"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Season
                      </button>
                    </div>

                    {!seriesForm.seasons || seriesForm.seasons.length === 0 ? (
                      <div className="text-center py-8 text-white/20 text-xs border border-dashed border-white/5 rounded-xl">
                        No seasons recorded for this TV series yet. Click "Add Season" to begin.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {seriesForm.seasons.map((season, sIdx) => {
                          const isExpanded = editorExpandedSeasonIdx === sIdx;
                          return (
                            <div key={sIdx} className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden transition-all duration-300">
                              {/* Season Header Row */}
                              <div className="flex items-center justify-between p-3 bg-white/[0.01] hover:bg-white/[0.03] transition-colors gap-3 flex-wrap sm:flex-nowrap">
                                <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap sm:flex-nowrap">
                                  {/* Toggle Expand */}
                                  <button
                                    type="button"
                                    onClick={() => setEditorExpandedSeasonIdx(isExpanded ? null : sIdx)}
                                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/80 cursor-pointer flex-shrink-0"
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="w-4 h-4" />
                                    ) : (
                                      <ChevronUp className="w-4 h-4" />
                                    )}
                                  </button>
                                  
                                  {/* Season Name Input */}
                                  <input
                                    type="text"
                                    value={season.name}
                                    onChange={(e) => handleUpdateSeasonInForm(sIdx, { name: e.target.value })}
                                    placeholder="Season Name"
                                    className="bg-apple-gray-800 text-white border border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold w-full sm:w-44 focus:border-cyan-500/50 outline-none"
                                  />

                                  {/* Season Number Input */}
                                  <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold flex-shrink-0">
                                    <span>No.</span>
                                    <input
                                      type="number"
                                      value={season.seasonNumber}
                                      onChange={(e) => handleUpdateSeasonInForm(sIdx, { seasonNumber: Number(e.target.value) })}
                                      className="bg-apple-gray-800 text-white border border-white/10 rounded-lg px-2 py-1 text-xs font-bold w-12 text-center focus:border-cyan-500/50 outline-none"
                                    />
                                  </div>

                                  <span className="text-[10px] font-black bg-cyan-950/40 text-cyan-400 px-2.5 py-0.5 rounded border border-cyan-500/10 flex-shrink-0">
                                    {season.episodes?.length || 0} EPS
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleAddEpisodeToSeasonInForm(sIdx)}
                                    className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                    Add EP
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSeasonFromForm(sIdx)}
                                    className="p-1.5 rounded bg-red-600/10 hover:bg-red-600 border border-red-500/10 text-red-400 hover:text-white transition-colors cursor-pointer"
                                    title="Delete Season"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Collapsible Episode list */}
                              {isExpanded && (
                                <div className="p-4 bg-black/40 border-t border-white/5 flex flex-col gap-3.5">
                                  {!season.episodes || season.episodes.length === 0 ? (
                                    <div className="text-center py-6 text-white/20 text-xs italic">
                                      No episodes created in this season yet. Click "Add EP" above.
                                    </div>
                                  ) : (
                                    <div className="flex flex-col gap-3">
                                      {season.episodes.map((episode, epIdx) => (
                                        <div key={epIdx} className="p-4 rounded-xl bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all flex flex-col gap-3">
                                          {/* Episode Title & Metadata line */}
                                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                            <div className="flex flex-wrap items-center gap-3">
                                              {/* Ep Number */}
                                              <div className="flex items-center gap-1 flex-shrink-0">
                                                <span className="text-[10px] font-black text-white/40 uppercase">EP</span>
                                                <input
                                                  type="number"
                                                  value={episode.episodeNumber}
                                                  onChange={(e) => handleUpdateEpisodeInForm(sIdx, epIdx, { episodeNumber: Number(e.target.value) })}
                                                  className="bg-apple-gray-800 text-white border border-white/10 rounded-lg px-2 py-0.5 text-xs font-bold w-12 text-center outline-none"
                                                />
                                              </div>

                                              {/* Ep Name */}
                                              <input
                                                type="text"
                                                value={episode.name}
                                                onChange={(e) => handleUpdateEpisodeInForm(sIdx, epIdx, { name: e.target.value })}
                                                placeholder="Episode Title"
                                                className="bg-apple-gray-800 text-white border border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold w-full sm:w-64 focus:border-cyan-500/50 outline-none"
                                              />

                                              {/* Ep Runtime */}
                                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <span className="text-[10px] font-black text-white/40 uppercase">Runtime</span>
                                                <input
                                                  type="number"
                                                  value={episode.runtime}
                                                  onChange={(e) => handleUpdateEpisodeInForm(sIdx, epIdx, { runtime: Number(e.target.value) })}
                                                  placeholder="45"
                                                  className="bg-apple-gray-800 text-white border border-white/10 rounded-lg px-2 py-0.5 text-xs font-bold w-14 text-center outline-none"
                                                />
                                                <span className="text-[10px] font-bold text-white/45">MIN</span>
                                              </div>
                                            </div>

                                            {/* Delete Episode */}
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteEpisodeFromForm(sIdx, epIdx)}
                                              className="p-1.5 rounded bg-red-600/10 hover:bg-red-600 border border-red-500/10 text-red-400 hover:text-white transition-colors cursor-pointer self-end lg:self-center"
                                              title="Delete Episode"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>

                                          {/* Ep Overview Synopsis */}
                                          <div className="flex flex-col gap-1.5 text-left">
                                            <label className="text-[9px] font-black text-white/30 uppercase tracking-wide">Episode Synopsis</label>
                                            <textarea
                                              value={episode.overview || ''}
                                              onChange={(e) => handleUpdateEpisodeInForm(sIdx, epIdx, { overview: e.target.value })}
                                              placeholder="Write an episode synopsis manually."
                                              className="bg-apple-gray-800/50 text-white border border-white/5 rounded-lg p-2.5 text-xs font-medium focus:border-cyan-500/30 outline-none h-16 resize-none"
                                            />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Save action bar */}
                  <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                    {editingSeries && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSeries(null);
                          setSeriesForm({
                            title: '', originalTitle: '', tmdbId: '', customStory: '', subtitleType: 'Both',
                            releaseYear: '', genres: [], posterPath: '', backdropPath: '', status: 'Returning Series',
                            network: 'Apple TV+', language: 'English', rating: 7.5, seasons: []
                          });
                          setSeriesStatusMsg('');
                        }}
                        className="px-5 py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold cursor-pointer"
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-7 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                    >
                      <Save className="w-4 h-4" />
                      {editingSeries ? 'Save Series Changes' : 'Create Series Record'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* RIGHT 1/3: TV Series list */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-black text-white/35 tracking-wider uppercase">Active TV Series Index</h3>
              <div className="flex flex-col gap-3 max-h-[750px] overflow-y-auto custom-scrollbar pr-2">
                {series.map((s) => (
                  <div
                    key={s.id}
                    className="glass-panel p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={s.posterPath}
                        alt=""
                        className="w-10 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 text-left">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[130px]">{s.title}</h4>
                        <p className="text-[10px] text-apple-gray-300 font-mono mt-0.5">{s.releaseYear} • {s.network}</p>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/10 mt-1 uppercase">
                          {s.seasons?.length || 0} Seasons
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleEditSeriesClick(s)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 transition-colors cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSeriesClick(s.id, s.title)}
                        className="p-2 rounded-lg bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white transition-colors cursor-pointer"
                        title="Delete TV Show"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================== */}
        {/* --- HOMEPAGE CATEGORY/SECTION ROW MANAGER --- */}
        {/* ========================================== */}
        {activeTab === 'homepage' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT 2/3: Layout order and visibility */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <h3 className="text-xs font-black text-white/35 tracking-wider uppercase">Active Row Layouts</h3>
              
              <div className="flex flex-col gap-3">
                {sections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-sans font-bold text-base text-white">{sec.title}</h4>
                        <span className="px-2 py-0.5 rounded text-[9px] font-black bg-white/10 text-white/80 uppercase">
                          {sec.type}
                        </span>
                      </div>
                      <p className="text-xs text-apple-gray-300 font-mono mt-1">
                        Row source: <span className="text-emerald-400">{sec.listType}</span> {sec.value ? `(${sec.value})` : ''}
                      </p>
                    </div>

                    {/* ordering, visibility togglers, and delete */}
                    <div className="flex items-center gap-2.5 self-start sm:self-center">
                      {/* position triggers */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveSection(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-white disabled:opacity-20 cursor-pointer"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveSection(idx, 'down')}
                          disabled={idx === sections.length - 1}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-white disabled:opacity-20 cursor-pointer"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* hide/show row triggers */}
                      <button
                        onClick={() => handleToggleSectionVisible(sec.id, sec.isVisible)}
                        className={`p-2.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                          sec.isVisible
                            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                        }`}
                        title={sec.isVisible ? 'Row is Visible on Home' : 'Row is Hidden from Home'}
                      >
                        {sec.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      {/* Delete row trigger */}
                      <button
                        onClick={() => handleDeleteSection(sec.id, sec.title)}
                        className="p-2.5 rounded-xl bg-red-600/10 hover:bg-red-600 border border-red-500/10 text-red-400 hover:text-white transition-all cursor-pointer"
                        title="Delete Layout Row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT 1/3: Add New Section Form */}
            <div className="flex flex-col gap-4">
              <div className="glass-panel p-6 rounded-2xl border border-white/5 text-left flex flex-col gap-4 shadow-lg">
                <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                  <Plus className="w-4.5 h-4.5 text-red-500" /> Add Custom Layout Row
                </h3>

                <form onSubmit={handleAddSection} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-white/40 uppercase">Row Section Title</label>
                    <input
                      type="text"
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      placeholder="e.g. Action packed"
                      className="bg-apple-gray-800 text-white border border-white/10 rounded-lg p-2.5 text-xs font-semibold outline-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-white/40 uppercase">Content Type</label>
                    <select
                      value={newSectionType}
                      onChange={(e: any) => setNewSectionType(e.target.value)}
                      className="bg-apple-gray-800 text-white border border-white/10 rounded-lg p-2 text-xs font-bold"
                    >
                      <option value="movies">Movies</option>
                      <option value="series">TV Shows</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black text-white/40 uppercase">Source Rule Category</label>
                    <select
                      value={newSectionListType}
                      onChange={(e: any) => setNewSectionListType(e.target.value)}
                      className="bg-apple-gray-800 text-white border border-white/10 rounded-lg p-2 text-xs font-bold"
                    >
                      <option value="trending">Trending (Highest Rated)</option>
                      <option value="popular">Popular (Rating &ge; 7.5)</option>
                      <option value="recently_added">Recently Added (by date)</option>
                      <option value="editors_picks">Editor's Picks</option>
                      <option value="genre">Specific Genre Filter</option>
                      <option value="custom">Custom ID List</option>
                    </select>
                  </div>

                  {/* specific filter rules helper */}
                  {(newSectionListType === 'genre' || newSectionListType === 'custom') && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black text-white/40 uppercase">
                        {newSectionListType === 'genre' ? 'Genre name' : 'Comma-separated IDs'}
                      </label>
                      <input
                        type="text"
                        value={newSectionVal}
                        onChange={(e) => setNewSectionVal(e.target.value)}
                        placeholder={newSectionListType === 'genre' ? 'e.g. Sci-Fi' : 'e.g. dune-2, inter-1'}
                        className="bg-apple-gray-800 text-white border border-white/10 rounded-lg p-2.5 text-xs font-semibold"
                        required
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="mt-2 w-full py-2.5 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-md"
                  >
                    Add Row to Layout
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}

        {/* ========================================== */}
        {/* --- SYSTEM SETTINGS TAB --- */}
        {/* ========================================== */}
        {activeTab === 'settings' && (
          <div className="max-w-xl mx-auto w-full">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/8 text-left flex flex-col gap-6 shadow-xl">
              <h2 className="font-display font-bold text-lg sm:text-xl text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-red-500" /> Systems Console
              </h2>

              <div className="flex flex-col gap-4">
                <div className="p-4 bg-white/3 rounded-xl border border-white/5 flex flex-col gap-2">
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5 text-red-400">
                    <AlertCircle className="w-4 h-4" /> Reset Application Database
                  </h3>
                  <p className="text-xs text-apple-gray-300 leading-relaxed mb-2">
                    Erase all current custom movies, series, custom categories, row edits, and favorited states. Restore the database back to clean curated seed values immediately.
                  </p>
                  <button
                    onClick={handleResetAppDb}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-all cursor-pointer self-start"
                  >
                    Reset System Database
                  </button>
                </div>

                <div className="p-4 bg-white/3 rounded-xl border border-white/5">
                  <h3 className="font-bold text-sm text-white mb-1.5">Netlify Optimization Specs</h3>
                  <p className="text-xs text-apple-gray-300 leading-relaxed">
                    This build runs on standard client-side state hooks synchronized with <span className="font-mono text-white">localStorage</span>. When deployed on Netlify, the application does not require backend servers, is ultra-secure, completely standalone, and runs for $0/mo cost.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
