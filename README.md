# SkyStream

A streaming web app for browsing and watching movies, TV shows, and anime,
built with Next.js 16 and React 19. Content metadata comes from the TMDB API;
playback is handled by the VidSrc player.

**Live:** [skystream.yashiel.dev](https://skystream.yashiel.dev)

> SkyStream does not host, store, or distribute any media. All content is served
> by third-party providers; SkyStream is only an interface for browsing it.

## Features

- **Discover** (`/home`) — hero carousel, trending / popular / top-rated movies,
  TV shows, and anime
- **Search** (`/`) — real-time search across movies, TV shows, and anime
- **Streaming** — VidSrc player with season/episode selection for TV
- **Trailer previews** straight from content cards
- **Dark / light theme** with a persisted preference
- **Installable PWA**, responsive across desktop, tablet, and phone
- **SEO** — JSON-LD structured data, dynamic meta tags, sitemap

## Tech Stack

| Category  | Technology                                            |
| --------- | ----------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack)                    |
| UI        | React 19, CSS with CSS Variables, Lucide React icons  |
| Video     | video.js, hls.js, VidSrc embed                         |
| API       | TMDB (content metadata, search, images)               |
| Testing   | Jest 30, React Testing Library                        |
| Tooling   | ESLint, Prettier                                      |
| Hosting   | Docker container on Coolify                            |

## Project Structure

```
skystream/
├── src/
│   ├── app/          # Next.js App Router pages (/, /home, /movie, /tv)
│   ├── components/   # UI components
│   ├── services/     # TMDB client + streaming provider glue
│   ├── utils/        # Config, hooks, analytics
│   ├── api/          # TMDB + streaming URL logic
│   ├── shared/       # Config, routing, and static data (categories, countries)
│   ├── data/         # App-level static data
│   └── styles/       # Global CSS
├── public/           # Static assets (favicon, manifest, sw.js)
├── Dockerfile        # Multi-stage container build
└── next.config.mjs
```

## Routes

| Route                           | Description                                    |
| ------------------------------- | ---------------------------------------------- |
| `/`                             | Search movies, TV shows, and anime             |
| `/home`                         | Featured, trending, popular, top-rated         |
| `/movie/[slug]`                 | Movie details and player                       |
| `/tv/[slug]/[season]/[episode]` | TV show with season/episode selection          |

## Getting Started

Requires Node.js 22+ (see `.nvmrc`) and a
[TMDB API key](https://www.themoviedb.org/settings/api).

```bash
git clone https://github.com/yashiels/skystream.git
cd skystream
pnpm install
```

Create a `.env.local`:

```env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX    # optional
```

Start the dev server:

```bash
pnpm dev
```

### Scripts

| Command              | Description               |
| -------------------- | ------------------------- |
| `pnpm dev`           | Start development server  |
| `pnpm build`         | Production build          |
| `pnpm start`         | Start production server   |
| `pnpm lint`          | Run ESLint                |
| `pnpm format`        | Format with Prettier      |
| `pnpm test`          | Run tests                 |
| `pnpm test:coverage` | Run tests with coverage   |

### Environment Variables

Every value is `NEXT_PUBLIC_*`, so Next.js inlines it at **build time** — setting
one on a running container has no effect; change it and rebuild. Full contract
with defaults: [`.env.example`](.env.example).

| Variable                      | Description                                    | Required |
| ----------------------------- | ---------------------------------------------- | -------- |
| `NEXT_PUBLIC_TMDB_API_KEY`    | TMDB API key                                   | Yes      |
| `NEXT_PUBLIC_TMDB_BASE_URL`   | TMDB API base URL                              | No       |
| `NEXT_PUBLIC_VIDSRC_BASE_URL` | VidSrc player origin (also sets CSP frame-src) | No       |
| `NEXT_PUBLIC_GA_TRACKING_ID`  | Google Analytics tracking ID                   | No       |

## Deployment

The app ships as a container. The `Dockerfile` is a multi-stage build that
installs dependencies, produces Next.js standalone output, and runs it as a
non-root user.

```bash
docker build --build-arg NEXT_PUBLIC_TMDB_API_KEY=<key> -t skystream .
docker run --rm -p 3000:3000 skystream
```

The server listens on `PORT` (default `3000`) and binds `HOSTNAME` (default
`0.0.0.0`) — the only true runtime variables. Everything else is a build
argument; on Coolify set the TMDB key as a **build-time** variable.

## License

MIT — see [LICENSE](LICENSE).

Powered by [TMDB](https://www.themoviedb.org/) and
[VidSrc](https://vidsrcme.ru/).
