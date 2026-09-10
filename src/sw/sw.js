import { CacheableResponsePlugin, CacheFirst, ExpirationPlugin, NetworkOnly, Serwist } from 'serwist';
import {
  CACHEABLE_STATUSES,
  OBSOLETE_CACHE_NAMES,
  ROUTE_ORDER,
  STATIC_ASSET_CACHE_NAME,
  TMDB_IMAGE_CACHE_CONFIG,
  TMDB_IMAGE_CACHE_NAME,
} from './routing.js';

const VIDSRC_ORIGIN = __VIDSRC_ORIGIN__;

const STRATEGY_BY_ROUTE_NAME = {
  'excluded-origin': () => new NetworkOnly(),
  'next-flight': () => new NetworkOnly(),
  'tmdb-api': () => new NetworkOnly(),
  'next-static': () => new CacheFirst({ cacheName: STATIC_ASSET_CACHE_NAME }),
  'tmdb-image': () =>
    new CacheFirst({
      cacheName: TMDB_IMAGE_CACHE_NAME,
      plugins: [
        new ExpirationPlugin(TMDB_IMAGE_CACHE_CONFIG),
        new CacheableResponsePlugin({ statuses: CACHEABLE_STATUSES }),
      ],
    }),
  navigation: () => new NetworkOnly(),
  default: () => new NetworkOnly(),
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: ROUTE_ORDER.map(route => ({
    matcher: params => route.match({ ...params, vidsrcOrigin: VIDSRC_ORIGIN }),
    handler: STRATEGY_BY_ROUTE_NAME[route.name](),
  })),
  fallbacks: {
    entries: [{ url: '/offline', matcher: ({ request }) => request.destination === 'document' }],
  },
});

serwist.addEventListeners();

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(key => OBSOLETE_CACHE_NAMES.includes(key)).map(key => caches.delete(key))))
  );
});
