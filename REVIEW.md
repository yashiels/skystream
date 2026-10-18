# REVIEW.md

## Context

SkyStream is a single Next.js 16 web app (App Router, Turbopack, React 19), JavaScript and JSX only, no TypeScript, pnpm. It browses movies and TV via the TMDB API (browser calls TMDB directly; `src/services/tmdbServer.js` fetches for `generateMetadata`) and plays content through a VidSrc iframe embed. It has no backend, no auth and no database. It ships as an installable PWA with a Serwist service worker (`src/sw/`, built by `scripts/build-sw.mjs` after `next build`). Production is a standalone Docker image built on the launchpad host by `.github/workflows/deploy-prod.yml` (tailnet join, SSH, `docker build`, `docker compose up` with `deploy/compose.yml`), served at `skystream.yashiel.dev` through a cloudflared sidecar. Every push to `main` that touches product files deploys.

## Always flag

- **VidSrc origin drift.** The player origin has one source: `PLAYER_DEFAULTS.vidsrcBaseUrl` in `src/shared/config/index.js`, overridable by `NEXT_PUBLIC_VIDSRC_BASE_URL`. `next.config.mjs` (CSP `frame-src`), `scripts/build-sw.mjs` (SW `__VIDSRC_ORIGIN__`), `src/api/streaming/StreamingServices.js`, `src/utils/config.js` and the postMessage check in `src/components/StreamingPlayerModal.jsx` all derive from it. Flag any hardcoded VidSrc hostname in source, and any domain change that does not update `.env.production`, `.env.example`, the `Dockerfile` `ARG NEXT_PUBLIC_VIDSRC_BASE_URL` default and `src/shared/config/index.js` together.
- **postMessage trust.** `handleMessage` in `StreamingPlayerModal.jsx` must keep the exact `event.origin !== vidsrcOrigin` check. Flag substring/`includes`/`startsWith` origin matching, removal of the `PLAYER_EVENT` type check, or new handlers that act on iframe messages without an exact origin check. Values written to localStorage from messages must stay type-checked numbers.
- **CSP regressions** in `next.config.mjs` `headers()`: widening `frame-src` beyond `'self'` plus the VidSrc origin, adding `'unsafe-eval'` outside the `isDev` branch, adding script origins other than `googletagmanager.com`, or dropping `worker-src 'self'` / `manifest-src 'self'`.
- **Service worker caching contract** (`src/sw/routing.js`, `src/sw/sw.js`). `ROUTE_ORDER` is first-match-wins and exclusions must stay first. Flag: any caching strategy on `next-flight`, `navigation`, `tmdb-api`, `excluded-origin` or `default`; adding a name to `CACHING_ROUTE_NAMES` without matching tests; a generic cross-origin image rule; removing `ExpirationPlugin` bounds on `tmdb-image`; `skipWaiting: true`; precaching any HTML other than `/offline` (`src/sw/precacheManifest.js`). Changes here must update `src/sw/__tests__/cacheSafety.test.js` and `routing.test.js`.
- **Update flow** (`src/utils/swUpdate.js`). The `controllerchange` reload listener must be registered only inside `acceptUpdate`, before posting `SKIP_WAITING`, with `{ once: true }`. Flag any unarmed `controllerchange` reload (it fires on first install because `clientsClaim: true`) and removal of `updateViaCache: 'none'` or the `/sw.js` `Cache-Control: no-cache` header.
- **Secrets in `NEXT_PUBLIC_*`.** All `NEXT_PUBLIC_*` values are inlined into the client bundle. Flag any genuinely secret value (tokens, private keys, admin keys) placed in a `NEXT_PUBLIC_*` var, `.env.production`, the `Dockerfile` or `deploy/compose.yml`.
- **Env access pattern.** Next only inlines `process.env.NEXT_PUBLIC_X` as a static property. Flag dynamic lookups like `process.env[key]` in client code, and new env vars missing from `.env.example`.
- **Deploy workflow safety** (`deploy-prod.yml`): secrets echoed to logs, `set -euo pipefail` removed from the remote script, `StrictHostKeyChecking=no`, SSH to hosts other than `vars.LAUNCHPAD_HOST`, unpinned third-party actions (the Tailscale action is pinned to a SHA), `cancel-in-progress: true` on the deploy concurrency group, or `pull_request` triggers that would run with deploy secrets.
- **Wrong image in prod.** `deploy/compose.yml` must run the on-box `skystream:local` build (`SKYSTREAM_IMAGE` from the host `.env`). Flag changes that let the stack silently fall back to a different image.
- **Dockerfile runtime stage**: must copy `.next/standalone`, `.next/static` and `public/` (which holds the generated `sw.js`), run as the non-root `nextjs` user, and keep `HOSTNAME=0.0.0.0`.
- **JSON-LD injection.** The `dangerouslySetInnerHTML` blocks in `src/app/layout.jsx` are static only. Flag any dynamic or TMDB-derived data interpolated into them; per-page structured data goes through `metadata.other` as in `src/app/movie/[slug]/page.jsx`.
- **Slug and ID parsing.** Route params (`parseMovieSlug` and the TV equivalent) must reduce to integer TMDB IDs before being placed in TMDB or VidSrc URLs. Flag raw slug/user strings in fetch URLs or iframe `src`.
- **Manifest identity.** `public/manifest.json` `id` must stay `"/"`; icons keep separate `purpose: "any"` and `"maskable"` entries.

## Severity guide

- **High**: player origin/CSP/postMessage weakening, a secret in a public var or committed file, a deploy change that leaks secrets or runs the wrong image, SW caching of HTML/RSC/TMDB API responses, a reload loop or stale-forever SW, a change that breaks `pnpm build` in the Dockerfile.
- **Medium**: origin drift across the config files, missing tests for SW routing or update-flow changes, unbounded caches, unchecked message payloads, server fetch errors that crash a page instead of returning `null`, new env vars without `.env.example` entries.
- **Low**: stale docs, minor a11y issues, unused code, weak test assertions.

## Do not flag

- `NEXT_PUBLIC_TMDB_API_KEY` being public, or `api_key=` in TMDB query strings (`src/services/tmdbServer.js`, `src/utils/config.js`). TMDB read keys are public by design here.
- The hardcoded GA measurement ID `G-CR3ZVV9BE1` in `layout.jsx`, `.env*` and the `Dockerfile`. It is a public tag ID.
- `'unsafe-inline'` in `script-src`/`style-src`; required by Next inline scripts and gtag.
- `public/sw.js`: generated by `scripts/build-sw.mjs` on every build and gitignored; review `src/sw/` instead. Flag only a PR that commits it again.
- `pnpm-lock.yaml`, `.next/`, `coverage/`, `__mocks__/`, `src/**/__mocks__/`, `docs/pwa-plan-oracle-*.txt` (review transcripts).
- Formatting and import order: enforced by Prettier (`pnpm format:check` in CI) and ESLint (`eslint.config.js`, max 10 warnings). React-hooks v7 rules are deliberately downgraded to warnings there.
- The existing `StrictHostKeyChecking=accept-new` against the tailnet-only launchpad host; flag only new weakening.
- `deploy-prod.yml` `paths-ignore` skipping `**.md` and `.github/**`; intentional.
- Missing server-side auth, rate limiting or database concerns; the app has none by design.
- Try/catch blocks that swallow localStorage errors in `StreamingPlayerModal.jsx`; non-fatal by design.

## Conventions

- Self-documenting code; no narration comments. A comment is allowed only for a non-obvious why. Flag added comments that restate what code does, and JSDoc narration on new code.
- JavaScript/JSX only. Flag added `.ts`/`.tsx` files or TypeScript-only syntax.
- Imports inside `src` use the `@/` alias; `next.config.mjs` and `scripts/` run in Node and must import `src/shared` by relative path.
- Config lives in `src/shared/config` and `src/utils/config.js`; flag duplicated defaults elsewhere.
- Tests are Jest + React Testing Library in `__tests__/` beside the code. Behavior changes to `src/api`, `src/services`, `src/shared`, `src/sw` or `src/utils/swUpdate.js` need matching test updates.
- PRs must pass `pnpm lint`, `pnpm format:check`, `pnpm test` and `pnpm build` (the `ci-complete` gate in `.github/workflows/ci.yml`).
- Commit/PR titles: `type(scope): imperative summary #N` with an issue reference; PR body carries `Closes #N`. No AI attribution trailers or footers.
- Deploy docs: flag PRs that change `.github/workflows/deploy-prod.yml`, `deploy/compose.yml` or deploy secrets without updating `deploy/README.md` and the `AGENTS.md` deploy section.
