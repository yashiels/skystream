export const ANALYTICS_ORIGINS = [
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
];

export const FLIGHT_HEADER_NAMES = [
  'RSC',
  'Next-Router-State-Tree',
  'Next-Router-Prefetch',
  'Next-Router-Segment-Prefetch',
];

export const TMDB_API_HOSTNAME = 'api.themoviedb.org';
export const TMDB_IMAGE_HOSTNAME = 'image.tmdb.org';
export const TMDB_IMAGE_PATHNAME_PATTERN = /^\/t\/p\/[^/]+\/[^/]+$/;

export const STATIC_ASSET_CACHE_NAME = 'next-static-assets';
export const TMDB_IMAGE_CACHE_NAME = 'tmdb-images';

export const TMDB_IMAGE_CACHE_CONFIG = {
  maxEntries: 300,
  maxAgeSeconds: 14 * 24 * 60 * 60,
};

export const CACHEABLE_STATUSES = [0, 200];

export const OBSOLETE_CACHE_NAMES = ['skystream-v1'];

const toURL = url => (typeof url === 'string' ? new URL(url) : url);

export const getOrigin = url => toURL(url).origin;

export const isExcludedOrigin = (url, vidsrcOrigin) => {
  const origin = getOrigin(url);
  return ANALYTICS_ORIGINS.includes(origin) || origin === vidsrcOrigin;
};

export const isNextFlightRequest = ({ url, headers }) => {
  const href = typeof url === 'string' ? url : url.href;
  if (href.includes('_rsc=')) return true;

  const getHeader = name =>
    headers && typeof headers.get === 'function' ? headers.get(name) : undefined;

  if (FLIGHT_HEADER_NAMES.some(name => getHeader(name) != null)) return true;

  const accept = getHeader('Accept') ?? getHeader('accept');
  return typeof accept === 'string' && accept.includes('text/x-component');
};

export const isTmdbApiRequest = url => toURL(url).hostname === TMDB_API_HOSTNAME;

export const isTmdbImageRequest = url => {
  const parsed = toURL(url);
  return (
    parsed.hostname === TMDB_IMAGE_HOSTNAME && TMDB_IMAGE_PATHNAME_PATTERN.test(parsed.pathname)
  );
};

export const isNextStaticAsset = url => toURL(url).pathname.startsWith('/_next/static/');

// The ordered routing policy. Each entry's `match` receives `{ url, request,
// vidsrcOrigin }` and the FIRST matching entry wins — this array is the single
// source of truth for route order, consumed both by the service worker (to
// build its runtimeCaching config) and by tests (to prove the contract).
export const ROUTE_ORDER = [
  {
    name: 'excluded-origin',
    match: ({ url, vidsrcOrigin }) => isExcludedOrigin(url, vidsrcOrigin),
  },
  {
    name: 'next-flight',
    match: ({ url, request }) => isNextFlightRequest({ url, headers: request.headers }),
  },
  { name: 'tmdb-api', match: ({ url }) => isTmdbApiRequest(url) },
  { name: 'next-static', match: ({ url }) => isNextStaticAsset(url) },
  { name: 'tmdb-image', match: ({ url }) => isTmdbImageRequest(url) },
  { name: 'navigation', match: ({ request }) => request.mode === 'navigate' },
  { name: 'default', match: () => true },
];

// Route names whose strategy persists responses into Cache Storage. Every
// other route name is a NetworkOnly strategy that never writes to the cache.
export const CACHING_ROUTE_NAMES = ['next-static', 'tmdb-image'];

export const classifyRequest = params => {
  const route = ROUTE_ORDER.find(candidate => candidate.match(params));
  return route ? route.name : 'default';
};
