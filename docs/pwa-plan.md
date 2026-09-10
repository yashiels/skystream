# SkyStream PWA Plan — web-first installable app for Android + iOS

Status: **FINAL — Oracle-approved.** Review history: round 1 APPROVE WITH
CHANGES (13 findings, all incorporated); round 2 APPROVE WITH CHANGES with 9
required changes (all incorporated); rounds 3-6 corrections (cache assertion,
reload-guard arming, deterministic playback matrix, consent-mode mechanics,
Wake Lock acquisition-failure case) all incorporated. Signed off as
implementation-ready; the plan below is built as written.

Context: Next.js 16 App Router, React 19, pnpm, 310-test Jest suite, Docker
build → docker compose on launchpad (100.122.178.53), served via Cloudflare
tunnel at https://skystream.yashiel.dev. Web-only forever; no native wrapper.
Playback = VidSrc iframe in `StreamingPlayerModal.jsx` (allow list currently
`encrypted-media; autoplay; fullscreen`); first-party trailers = video.js/hls.js.
Analytics: gtag in `src/app/layout.jsx` with analytics storage defaulting to
DENIED. Current SW: hand-rolled `public/sw.js` (static CACHE_NAME
`skystream-v1`, cache-first static, network-first navigations + 503 text
fallback, cross-origin skipped, skipWaiting+clientsClaim on top-level).
Main requires code-owner approval; deploys run on push to main.

## PR stack (4 PRs, each independently deployable, merged bottom-up)

### PR1 — PWA foundation (all icon work + all asset validation lives here)
- Generate from LOGO.png: 192x192, 512x512, maskable variants with REAL
  safe-zone padding, true 180x180 apple-touch-icon. Nothing icon-related in
  later PRs.
- **Validation happens in THIS PR, not deferred:** maskable safe-zone check
  (all four icon variants render correctly under circle/squircle masks) and
  screenshot `sizes`/`type`/`form_factor` validation. PR4 may re-run these as
  part of final verification, but PR1 does not ship unvalidated assets.
- manifest.json essentials stated explicitly: `id: '/'` (never change
  post-install), `start_url: '/'`, `scope: '/'`, `name` + `short_name`,
  `display: 'standalone'`, `display_override: ['standalone']`,
  `background_color` + `theme_color`, `lang: 'en'`, `dir: 'ltr'`, categories,
  `launch_handler`, screenshots (each with `sizes`+`type`+`form_factor`),
  shortcuts → Search `/` and Discover `/home` (URLs verified to resolve).
  Icon entries declare explicit `purpose: 'any'` and `'maskable'` (separate
  entries, never `purpose: 'any maskable'` on one file). Chromium-only fields
  accepted as progressive enhancement; Safari ignores them.
- `export const viewport` (themeColor, `viewportFit: 'cover'`); `metadata.icons`
  → real files. Apple icon fixed here.
- Safe-area `env()` at layout boundaries only: `Layout.css` header/footer,
  `StreamingPlayerModal.css`, body overscroll, `BackToTop` fixed control.
  NOT a 53-file sweep.

### PR2 — Service worker rebuild (Serwist 10, configurator mode) + offline page
- Serwist via post-`next build` configurator flow with InjectManifest-style
  `self.__SW_MANIFEST`. Options pinned explicitly:
  `skipWaiting: false`, `clientsClaim: true`, **`precachePrerendered: false`**
  (configurator mode otherwise precaches prerendered route HTML by default,
  which contradicts "arbitrary HTML not retained"). Explicit precache list:
  `/offline` plus every required first-party chunk, CSS, and font. Serwist
  owns precache revisions + cleanup; NO build-hash CACHE_NAME for precache.
  Runtime caches get explicit names/versions.
- **Docker output exactness:** Next standalone output does NOT automatically
  contain everything. Build sequence: `next build` → `serwist build` → the
  runtime image gets the complete post-Serwist `public/` directory AND
  `.next/static/` AND the standalone server output. No "ambiguous Next
  output" wording.
- Routing policy, ordered, exclusions first:
  1. gtag/analytics + VidSrc origins: NetworkOnly (before all broad routes)
  2. Next RSC/Flight — exact predicate, any of: `RSC` header present, URL
     contains `_rsc=`, `Next-Router-State-Tree` header,
     `Next-Router-Prefetch` header, `Next-Router-Segment-Prefetch` header,
     `Accept: text/x-component`. NetworkOnly — build-specific payloads must
     never be served stale.
  3. TMDB API: NetworkOnly
  4. `/_next/static/`: revisioned precache / cache-first (immutable)
  5. TMDB images (image.tmdb.org host + expected pathname pattern only):
     cache-first bounded by BOTH maxEntries AND maxAgeSeconds, cacheable
     statuses `[0, 200]` (opaque accepted explicitly). No generic
     cross-origin image rule.
  6. Navigations: network with static `/offline` fallback; arbitrary HTML not
     retained.
  7. Everything else: NetworkOnly unless deliberately classified.
- **Test placement:** RSC/Flight exclusion unit + integration tests live in
  PR2 (not PR4) because PR2 is independently deployable. Includes a test
  proving that no HTML enters Cache Storage except the explicitly precached
  `/offline` response, and that no RSC/Flight responses are ever cached.
- `/offline` page statically renderable; explicitly precached with its
  chunks/css/fonts so it works cold. Retry button. No cached-catalog browsing.
- Update contract (complete): Serwist configured `skipWaiting: false`,
  `clientsClaim: true`. New worker installs → waits. Client detects
  `registration.waiting` (including an ALREADY-WAITING worker on page load —
  toast shows immediately in that case) → toast "New version available —
  Reload" → button posts SKIP_WAITING → reload listener installed BEFORE
  posting, armed ONLY by the user accepting the update, then listens for
  `controllerchange` with a ONE-SHOT guard so reload happens exactly once.
  Because `clientsClaim: true` fires `controllerchange` on first
  installation, an unarmed listener must never reload: initial-install and
  unrelated `controllerchange` events are ignored. Never reload immediately
  after posting. If playback is open when the user accepts the update: that
  is an explicit user-approved interruption — the toast copy says playback
  will stop; the player modal closes on reload. Toast ships in THIS PR.
  Activation deletes only obsolete SkyStream-named caches; legacy
  `skystream-v1` removed here.
- `/sw.js` served `Cache-Control: no-cache`; registration uses
  `updateViaCache: 'none'`. Cloudflare cache rule updated so sw.js is never
  edge-cached.
- **CSP outcome, not "reviewed":** headers tested with directives
  `worker-src 'self'`, `frame-src` = exact VidSrc origin allowlist,
  `connect-src` = self + TMDB API + analytics origins, media directives
  covering first-party HLS sources. Exact origins enumerated in the PR;
  Playwright test asserts the served CSP on document responses.

### PR3 — iOS reality pass (testing-driven, no icon work)
- Target: iOS/iPadOS 26 Safari + Home Screen web apps.
- Installed standalone apps are EXEMPT from WebKit 7-day script-storage
  eviction (ordinary Safari tabs are not). Still treat storage as
  non-durable: test cold launch after restart + storage pressure; optionally
  `navigator.storage.persist()`.
- Playback is an iframe on VidSrc's origin: SkyStream cannot set Media Session
  metadata, control play/pause/PiP, or guarantee inline playback. Add
  `picture-in-picture` (and `mediasession` if provider supports) to the iframe
  allow list — permission only, not capability. Tighten the existing
  origin-checked postMessage handler — exact contract: sender must be
  `event.source === iframe.contentWindow`, origin must match the exact
  VidSrc allowlist (not a substring match), payload must have a known event
  discriminant (whitelist of event names), all numeric fields finite and
  range-bounded, unexpected fields rejected. Never trust every PLAYER_EVENT.
- iOS Home Screen PiP is known-broken even when `pictureInPictureEnabled` is
  true: never promise PiP in installed mode; "Open in Safari" fallback.
- **Playback matrix — four environments, every operation a deterministic
  pass/fail criterion (a PASS states the observable that must occur; any
  operation that can degrade must have its documented fallback and the
  criterion covers fallback-appears):**
  - **iOS Safari tab:** PASS if VidSrc playback starts within 10s of a user
    gesture; PASS if fullscreen enters AND exits without losing playback
    position; PASS if rotation preserves position within 2s; PASS if audio
    resumes after backgrounding + foreground within one tap, no restart;
    lock-screen controls: PASS if controls appear and play/pause responds;
    if the provider exposes no Media Session API, the recorded result is
    "controls not provided by provider" AND THAT COUNTS AS PASS for the
    matrix (the plan explicitly does not require provider behavior we
    cannot ship) — a FAIL is controls appearing but not responding, or a
    previously-working control regressing; PASS if trailer plays via native
    HLS with hls.js fallback only on native failure; PiP: PASS if PiP
    starts OR the documented fallback appears, FAIL if neither.
  - **iOS standalone (installed):** PASS if VidSrc playback starts within
    10s of a user gesture; PASS if fullscreen enters AND exits without
    losing position; PASS if rotation preserves position within 2s; PASS if
    audio resumes after backgrounding + foreground within one tap, no
    restart; PiP: PASS if "Open in Safari" fallback appears when PiP is
    attempted, FAIL if the app appears to enter PiP then blacks out or
    wedges; lock-screen controls: same PASS/FAIL rule as Safari tab; PASS
    if storage (settings, watch progress) survives cold launch after device
    restart.
  - **Android Chrome tab:** PASS if VidSrc playback starts within 10s of a
    user gesture; PASS if fullscreen enters AND exits without losing
    position; PASS if rotation preserves position within 2s; PASS if audio
    resumes after backgrounding + foreground within one tap, no restart;
    PASS if trailer uses native HLS with hls.js fallback only on native
    failure; PiP: PASS if PiP starts OR documented fallback appears, FAIL
    if neither.
  - **Android installed:** PASS on every Android Chrome tab criterion,
    plus PASS if launching from the home-screen shortcut lands on the
    correct start route (the route the shortcut was created from), and
    PASS if offline reload shows the `/offline` page (not a browser
    error).
  - **Cross-cutting operations (all four environments):** Wake Lock: PASS
    if the screen stays on during at least 3 minutes of trailer playback
    with the Wake Lock API active; if the API is absent, the result is
    recorded as "not supported, no user-visible defect" (PASS); FAIL if
    supported but the lock cannot be acquired during eligible trailer
    playback, or screen sleeps with the API reported active; Dynamic
    Island/home-indicator overlap: PASS if no interactive control sits
    under the notch/home indicator in any orientation; keyboard-open
    (search inputs): PASS if no fixed control is obscured while the
    keyboard is open.
  Every criterion is checked by a human on real hardware with the expected
  observable named BEFORE the test runs. A FAIL means either a code fix in
  this PR or a filed follow-up issue with a failing cell as evidence;
  silently downgrading an expectation is prohibited.
- **Provider-failure detection is best-effort, honestly framed:** a parent
  page cannot reliably detect cross-origin iframe failures caused by CSP or
  X-Frame-Options. Signals used: provider handshake timeout,
  `navigator.onLine`, manual retry, "Open in browser" escape hatch. No
  promise of exact failure detection; UX copy stays honest ("having
  trouble?" not "provider is down").
- Test matrix also covers: playsInline trailers, user-gesture playback,
  Wake Lock, Dynamic Island/home-indicator overlap, keyboard-open. Do not
  rely on manifest `orientation`.

### PR4 — Install UX + verification
- `beforeinstallprompt` capture + custom install button (Android); iOS gets
  the custom A2HS instructions sheet (no BIP there).
- **Consent behavior — basic consent mode, implemented correctly:** gtag in
  `src/app/layout.jsx` is BLOCKED from loading or executing until consent
  (`analytics_storage: denied` alone does NOT stop cookieless pings once
  gtag is loaded — that is advanced-mode behavior, which this project
  rejects). Mechanism: conditionally inject the gtag script only after
  consent. Network-level test (Playwright request interception) proves NO
  Google script fetch, consent ping, or analytics request occurs
  pre-consent (ref: Google consent-mode basic vs advanced). Install events
  recorded post-consent only: `prompt shown` (BIP captured), `user
  accepted`, `user dismissed`, `app installed` (`appinstalled`), plus iOS
  A2HS sheet views. Single source of truth in the install module prevents
  double-counting.
- Verification (Lighthouse PWA category is gone upstream): DevTools
  manifest/installability validation, real HTTPS install test, BIP after
  engagement, offline reload test, two-consecutive-deploy worker upgrade test
  INCLUDING with an open playback modal, Lighthouse perf/a11y/best-practices.
- Re-run of PR1's maskable/screenshot validation as final check; Playwright
  mobile smoke; docs/AGENTS.md update.

## Round-2 checklist (Oracle's 9 required changes)
1. Serwist precaching: `precachePrerendered: false` + explicit precache list +
   test that no HTML except precached `/offline` and no RSC/Flight ever
   enters Cache Storage — PR2 ✓
2. Flight predicate exact (RSC, _rsc, Next-Router-State-Tree,
   Next-Router-Prefetch, Next-Router-Segment-Prefetch, Accept:
   text/x-component) + tests moved to PR2 — ✓
3. Update contract complete: skipWaiting/clientsClaim pinned,
   already-waiting-worker handling, reload listener armed pre-post +
   one-shot guard vs clientsClaim first-install controllerchange,
   open-playback behavior defined — ✓
4. Docker output wording corrected (complete post-Serwist public/ +
   .next/static/ + standalone output) — ✓
5. CSP outcome specified + tested (worker-src, frame-src, connect-src,
   media; exact origins; Playwright assert) — ✓
6. Maskable + screenshot validation moved into PR1 (PR4 re-runs) — ✓
7. Playback matrix: four environments, concrete pass/fail expectations
   per operation, gap handling defined — ✓
8. Provider-failure reframed as best-effort signals, honest copy — ✓
9. Consent: basic mode implemented as gtag blocked from loading until
   consent, network-level no-ping test, event list, double-count guard — ✓

## Deliberately out of scope
- Cached-catalog offline browsing
- Desktop window-controls-overlay
- Any native wrapper
- Promising PiP/Media Session on iOS installed mode
- Cookieless GA pings before consent (advanced consent mode)
