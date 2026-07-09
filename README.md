# CineApple - Apple TV Inspired Movie & Series Library

CineApple is a premium production-ready Movie Library web application styled in the signature cinematic look of Apple TV. Crafted with high-contrast displays, frosted glass (glassmorphic) panel layouts, elegant margins, and responsive carousels, this web app delivers an elite browsing experience for film enthusiasts.

This application is dedicated entirely to cataloging, browsing, and curating movie titles, television series, categories, and actor profiles with English and Myanmar subtitles. It does **not** host movie streaming services.

---

##  Core Features & UI Highlights

- **Apple TV Visual Style:** Designed with Inter and Space Grotesk typography, cinematic dark canvases, soft shadows, custom horizontal snap scrollings, and gorgeous glassmorphic overlays.
- **Cinematic Hero Carousels:** Supports fully animated high-contrast banner transitions, showcasing movie backdrops, metadata tags (ratings, runtimes, genres), play-style previews, and instant watchlist additions.
- **Advanced Metadata Filter Index:** Full-scale Movies and TV Series grid boards equipped with multi-select dropdown filters (Genre, Year, Rating, Language, Network) and comprehensive sorting (newest, highest-rated, alphabetical).
- **Interactive Seasons & Episode guide:** TV Series details are configured with interactive season tab selectors, revealing beautiful detailed cards listing episode numbers, names, runtimes, and individual episode overviews.
- **Full TMDB API Integration:** Synchronizes movie and show records with TMDB directories using real-time API queries. The Admin can enter any TMDB ID to instantly autofill and cache poster images, backdrop banners, release details, casting credits, and actor profiles.
- **Private Curated Admin Dashboard:** An authorized gate panel protected by a secure master PIN, letting catalog managers create, edit, or delete movies/TV shows, rearrange homepage layout row structures, select Hero banners, and adjust row order and visibility.
- **Personalized watchlist & Tracking:** No login required for standard users! Standard viewers can toggle movie favorites and track their recently viewed catalog history ("Continue Browsing") stored cleanly in standard local clients.
- **Netlify Single Page Application Optimizations:** Configured with zero-cost static routers and standard redirect rules, ensuring 100% deep-link routing compatibility out of the box on Netlify.

---

## 🛠️ Technology Stack

- **React 19** & **TypeScript**
- **Vite** (Next-generation client bundler)
- **Tailwind CSS v4** (Modern utility styling engine)
- **React Router Dom** (Lightweight client router)
- **Lucide React** (Unified elegant vector icon library)
- **HTML5 LocalStorage API** (Flawless client-side database persistence)

---

## 📂 Key Architecture Directories

```text
src/
├── components/          # Reusable visual widgets (Cards, Carousels, Footers)
│   ├── Footer.tsx
│   ├── HeroCarousel.tsx
│   ├── MovieCard.tsx
│   ├── MovieCarousel.tsx
│   └── Navigation.tsx
├── pages/               # Route-level page screens (Home, Detail boards, Admin)
│   ├── Actor.tsx
│   ├── Admin.tsx
│   ├── Favorites.tsx
│   ├── Home.tsx
│   ├── MovieDetail.tsx
│   ├── Movies.tsx
│   ├── Search.tsx
│   ├── Series.tsx
│   └── SeriesDetail.tsx
├── services/            # API integration and persistence managers
│   ├── db.ts            # Client database & seed initialization
│   └── tmdb.ts          # TMDB API metadata sync engine
├── types.ts             # Global TypeScript type definitions
├── index.css            # Custom glassmorphic styles and custom scrollbars
└── main.tsx             # React entry mount
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure you have Node.js (version 18 or later) installed.

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Local Development Server
Launch the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Compilation
Produce an optimized production bundle inside `dist/`:
```bash
npm run build
```

---

## ☁️ Deployment Instructions

### Deploy to Netlify (Static Hosting)

1. **Upload your code** to GitHub, GitLab, or Bitbucket.
2. **Link repository** in your Netlify dashboard.
3. Configure these exact build settings:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
4. Deploy! The `/public/_redirects` file is pre-configured so that URL refreshes on deep routes function flawlessly on Netlify CDN nodes.

### Admin Passcodes
To access the private Admin Control Panel, navigate to `/admin` and use these pre-authenticated sandbox PIN codes:
- `admin123`
- `apple2026`
