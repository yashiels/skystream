# SkyStream

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TMDB API](https://img.shields.io/badge/TMDB_API-01B4E4?style=for-the-badge&logo=themoviedatabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

A streaming platform interface built with Next.js 16 and React 19 for browsing
and streaming movies, TV shows, and anime. Powered by the TMDB API for content
metadata and integrated with multiple third-party streaming providers.

**Live:** [https://www.sky-stream.online/](https://www.sky-stream.online/)

### Disclaimer

SkyStream does not host, store, or distribute any media content. All content is
sourced from third-party streaming services. SkyStream acts solely as an
interface to browse and access content.

## Features

- **Discover** (`/home`) — Featured hero carousel, trending/popular/top-rated
  movies, TV shows, and anime
- **Search** (`/`) — Real-time search across movies, TV shows, and anime with
  instant results
- **Streaming** — Multi-server player (Videasy, Vidsrc) with season/episode
  selection for TV content
- **Trailer Previews** — Watch trailers directly from content cards
- **Dark/Light Theme** — Toggle between themes with persistent preference
- **PWA** — Installable as a Progressive Web App
- **SEO** — Structured data (JSON-LD), dynamic meta tags, sitemap
- **Analytics** — Google Analytics + Vercel Analytics for usage tracking
- **Responsive** — Optimized for desktop, tablet, and mobile

## Tech Stack

| Category  | Technology                                                |
| --------- | --------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack)                        |
| UI        | React 19, CSS3 with CSS Variables, Lucide React icons     |
| Video     | video.js, hls.js                                          |
| API       | TMDB API (content metadata, search, images)               |
| Streaming | Videasy, Vidsrc (multi-server)                            |
| Analytics | Google Analytics, Vercel Analytics, Vercel Speed Insights |
| Testing   | Jest 30, React Testing Library                            |
| Linting   | ESLint, Prettier                                          |
| Hosting   | Vercel                                                    |

## Project Structure

```
skystream/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.jsx          # Root layout (SEO, analytics, fonts)
│   │   ├── page.jsx            # Search page (/)
│   │   ├── not-found.jsx       # 404 page
│   │   ├── home/page.jsx       # Discover page (/home)
│   │   ├── movie/[slug]/       # Dynamic movie pages
│   │   └── tv/[...slug]/       # Dynamic TV show pages
│   ├── components/             # UI components
│   │   ├── Layout.jsx          # Shared header/footer wrapper
│   │   ├── FeaturedHero.jsx    # Hero banner with carousel
│   │   ├── ContentRow.jsx      # Horizontal scrolling content row
│   │   ├── StreamingPlayerModal.jsx  # Video player modal
│   │   ├── StreamingSearchBar.jsx    # Search input
│   │   ├── StreamingResultCard.jsx   # Content result card
│   │   ├── ThemeToggle.jsx     # Dark/light mode toggle
│   │   └── ...                 # Other components
│   ├── services/               # API service layers
│   │   ├── tmdbApi.js          # TMDB API client
│   │   ├── tmdbServer.js       # Server-side TMDB fetching
│   │   └── streamingServices.js # Streaming provider integration
│   └── utils/                  # Utilities and configuration
│       ├── config.js           # Centralized app config
│       ├── analytics.js        # Google Analytics wrapper
│       ├── useTheme.js         # Theme hook
│       ├── useSeoMeta.js       # SEO meta tag hook
│       └── useStreamingUrl.js  # Player URL generation hook
├── public/                     # Static assets (favicon, manifest, sw.js)
├── .github/
│   ├── CODEOWNERS              # @yashiels @MphoCodes
│   └── workflows/build.yml    # CI: lint, format, build
└── package.json
```

## Routes

| Route                           | Page     | Description                                    |
| ------------------------------- | -------- | ---------------------------------------------- |
| `/`                             | Search   | Search for movies, TV shows, and anime         |
| `/home`                         | Discover | Featured content, trending, popular, top-rated |
| `/movie/[slug]`                 | Movie    | Movie details and streaming player             |
| `/tv/[slug]/[season]/[episode]` | TV Show  | TV show with season/episode selection          |

## Getting Started

### Prerequisites

- Node.js 22+ (see `.nvmrc`)
- TMDB API key ([themoviedb.org](https://www.themoviedb.org/settings/api))

### Setup

```bash
git clone https://github.com/skynergroup/skystream.git
cd skystream
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX    # optional
```

Start the dev server:

```bash
npm run dev
```

### Scripts

| Command                 | Description               |
| ----------------------- | ------------------------- |
| `npm run dev`           | Start development server  |
| `npm run build`         | Production build          |
| `npm start`             | Start production server   |
| `npm run lint`          | Run ESLint                |
| `npm run lint:fix`      | Auto-fix lint errors      |
| `npm run format`        | Format code with Prettier |
| `npm run format:check`  | Check formatting          |
| `npm test`              | Run tests                 |
| `npm run test:coverage` | Run tests with coverage   |

### Environment Variables

| Variable                          | Description                                  | Required |
| --------------------------------- | -------------------------------------------- | -------- |
| `NEXT_PUBLIC_TMDB_API_KEY`        | TMDB API key                                 | Yes      |
| `NEXT_PUBLIC_TMDB_BASE_URL`       | TMDB API base URL                            | No       |
| `NEXT_PUBLIC_TMDB_IMAGE_BASE_URL` | TMDB image CDN URL                           | No       |
| `NEXT_PUBLIC_GA_TRACKING_ID`      | Google Analytics tracking ID                 | No       |
| `NEXT_PUBLIC_ENABLE_ANALYTICS`    | Enable/disable analytics                     | No       |
| `NEXT_PUBLIC_DEFAULT_PLAYER`      | Default video player (`videasy` or `vidsrc`) | No       |

## Deployment

Deployed on [Vercel](https://vercel.com). Set environment variables in the
Vercel dashboard. Pushes to `production` branch trigger automatic deploys.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Commit using [conventional commits](https://www.conventionalcommits.org/)
   (`feat:`, `fix:`, `chore:`, etc.)
4. Push and open a Pull Request — code owners (`@yashiels`, `@MphoCodes`) will
   be auto-assigned for review
5. All PRs require passing CI (lint, format, build) and squash merge

## License

MIT License. See [LICENSE](LICENSE) for details.

## Credits

Built by [Skyner Group](https://github.com/skynergroup) —
[Yashiel Sookdeo](https://github.com/yashiels) and
[Mpho Ndlela](https://github.com/MphoCodes).

Powered by [TMDB](https://www.themoviedb.org/),
[Videasy](https://player.videasy.to/), [Vidsrc](https://vidsrc.xyz/), and
[Vercel](https://vercel.com/).
