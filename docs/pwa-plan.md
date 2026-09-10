# SkyStream PWA Plan — web-first installable app for Android + iOS

Status: **Oracle-reviewed (APPROVE WITH CHANGES) — this doc is the Oracle-corrected
version of the original 4-PR plan.** All PRs stack bottom-up, each independently
deployable. Web-only forever; no native apps.

## Why (current gaps)

- manifest icons: only a 28x28 favicon; apple-touch-icon claims 180x180 on a 28px png
- no manifest id/scope/orientation/screenshots/shortcuts
- hand-rolled `sw.js`: static `CACHE_NAME` (hashed chunks accumulate forever),
  network-first for a nonexistent `/api`, cross-origin (TMDB images, vidsrc) skipped,
  503-text offline "page", `skipWaiting`+`claim` hot-swap (stale-chunk risk), no update toast
- `viewport-fit=cover` + safe-area padding only in the player modal
- gtag must never be cached

## PR stack (reordered per Oracle: icon work lives entirely in PR1)

### PR1 — PWA foundation (icons, manifest, viewport)
- Generate real icon set from LOGO.png: 192x192, 512x512, maskable variants with
  actual safe-zone padding, and a true 180x180 apple-touch-icon. (All icon work in
  this PR; PR3 must not duplicate it.)
- Next 16: `export const viewport` (themeColor, `viewportFit: 'cover'`);
  `metadata.icons` pointing at the real files.
- manifest.json: stable `id: '/'` (never change after users install), scope,
  `display: 'standalone'` (drop `window-controls-overlay` — desktop-only,
  creates title-bar layout obligations we don't want), categories, screenshots
  (`sizes`+`type`+`form_factor`), shortcuts → Search `/` and Discover `/home`
  (validate those URLs resolve).
- Baseline safe-area `env()` handling at layout boundaries only (Layout.css header/
  footer, BackToTop, body overscroll) — NOT a 53-file CSS sweep.

### PR2 — Service worker rebuild (Serwist) + offline page
- **Serwist 10+ (configurator mode, InjectManifest-style)**, not next-pwa (dead) or
  hand-rolled. Docker build runs: `next build` → `serwist build` → copy outputs.
  Let Serwist own precache revisions/cleanup; do NOT also use a build-hash
  CACHE_NAME for precache (only runtime caches get explicit names/versions).
- Routing policy (order matters, network-only exclusions first):
  1. gtag/analytics + vidsrc origins: NetworkOnly
  2. Next.js RSC/Flight requests (RSC header, Next-Router-State-Tree,
     Accept: text/x-component): NetworkOnly — build-specific payloads must never
     be served stale
  3. TMDB API calls: NetworkOnly
  4. `/_next/static/`: precache/cache-first (immutable)
  5. TMDB images (image.tmdb.org path pattern only): cache-first bounded by BOTH
     `maxEntries` and `maxAgeSeconds`, cacheable statuses `[0, 200]` (opaque OK)
  6. Navigations: network with `/offline` fallback; do not retain arbitrary HTML
  7. Everything else: NetworkOnly unless deliberately classified
- Static `/offline` page (statically renderable, precached with its chunks/css);
  no cached-catalog browsing — scope creep (Oracle concurs).
- Update protocol (exact): new worker installs → waits → client detects
  `registration.waiting` → toast "New version available — Reload" → button posts
  SKIP_WAITING → client waits for `controllerchange` → reload exactly once.
  Never reload immediately after posting. Activation deletes only obsolete
  SkyStream-named caches.
- Serve `/sw.js` with `Cache-Control: no-cache` and register with
  `updateViaCache: 'none'` (matters behind Cloudflare).
- Migration: delete legacy `skystream-v1` cache on activate.

### PR3 — iOS reality pass (testing-driven, not icon work)
- Target: iOS/iPadOS 26 Safari + Home Screen web apps (not "iOS 19").
- Installed standalone apps are EXEMPT from WebKit 7-day script-storage eviction
  (ordinary Safari tabs are not). Still treat storage as non-durable; optionally
  `navigator.storage.persist()`; test cold launch + storage pressure.
- Playback is an iframe on VidSrc's origin: SkyStream cannot set Media Session
  metadata, control play/pause/PiP, or guarantee inline playback. Add
  `picture-in-picture` (and `mediasession` if provider supports) to the iframe
  allow list — permission only, not capability. Tighten the existing
  origin-checked postMessage handler: validate full message schema + numeric
  ranges, don't trust every PLAYER_EVENT.
- iOS Home Screen PiP is known-broken even when `pictureInPictureEnabled` is true:
  never promise PiP in installed mode; surface "Open in Safari" fallback.
- Test matrix: playsInline trailers, user-gesture playback, native HLS before
  hls.js fallback, Wake Lock, backgrounding/audio interruption, fullscreen exit,
  rotation, Dynamic Island/home-indicator overlap, lock-screen controls,
  standalone vs Safari. Targeted CSS fixes from results (safe areas at
  boundaries: player modal, Layout shell, trailer fullscreen, BackToTop).
- Do not rely on manifest `orientation` on iOS.

### PR4 — Install UX + verification
- `beforeinstallprompt` capture + custom install button (Android); iOS gets the
  custom A2HS instructions sheet (no BIP there).
- Analytics on install events — NOTE: default consent is denied, so events may
  legitimately not transmit; make the event consent-aware rather than fighting it.
- Verification (replaces "Lighthouse PWA pass" — category removed upstream):
  DevTools manifest/installability validation, real HTTPS install test,
  BIP after engagement, offline reload test, **two-consecutive-deploy worker
  upgrade test including with an open playback modal**, Lighthouse
  perf/a11y/best-practices.
- Playwright mobile-emulation smoke; docs/AGENTS.md update.

## Missing scope Oracle added (fold into the PRs above)
- Dockerfile/build-script changes + Cloudflare cache-rule/header changes for sw.js
- CSP implications of the worker + served headers
- RSC/Flight exclusion tests
- Two-version upgrade test with open playback modal
- VidSrc-in-installed-iOS behavior matrix (fullscreen, PiP fallback, backgrounding)
- Trailer native-HLS/hls.js test matrix
- Maskable safe-zone + screenshot validation
- Provider-failure UX when VidSrc is down/blocked (currently silent)

## Deliberately out of scope
- Cached-catalog offline browsing
- Desktop window-controls-overlay
- Any native wrapper (Capacitor/etc.)
- Promising PiP/Media Session on iOS installed mode

## Open questions (none blocking)
- Screenshots need device-frame captures; can generate from Playwright at build time later.
