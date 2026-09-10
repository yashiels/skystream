import { CACHING_ROUTE_NAMES, classifyRequest } from '../routing';
import { buildOfflinePrecacheEntries } from '../precacheManifest';

const VIDSRC_ORIGIN = 'https://vidsrcme.ru';

const headers = entries => ({
  get: name => {
    const match = entries.find(([key]) => key.toLowerCase() === name.toLowerCase());
    return match ? match[1] : null;
  },
});

const requestScenarios = [
  {
    description: 'a document navigation to the home route',
    url: 'https://skystream.yashiel.dev/home',
    request: {
      mode: 'navigate',
      destination: 'document',
      headers: headers([['Accept', 'text/html']]),
    },
    expectedRoute: 'navigation',
  },
  {
    description: 'an RSC flight request carrying the RSC header',
    url: 'https://skystream.yashiel.dev/home',
    request: { mode: 'cors', destination: '', headers: headers([['RSC', '1']]) },
    expectedRoute: 'next-flight',
  },
  {
    description: 'a flight request identified only by the _rsc query param',
    url: 'https://skystream.yashiel.dev/home?_rsc=abc123',
    request: { mode: 'cors', destination: '', headers: headers([]) },
    expectedRoute: 'next-flight',
  },
  {
    description: 'a flight request identified only by Accept: text/x-component',
    url: 'https://skystream.yashiel.dev/movie/1',
    request: { mode: 'cors', destination: '', headers: headers([['Accept', 'text/x-component']]) },
    expectedRoute: 'next-flight',
  },
  {
    description: 'a TMDB API call',
    url: 'https://api.themoviedb.org/3/movie/1',
    request: { mode: 'cors', destination: '', headers: headers([]) },
    expectedRoute: 'tmdb-api',
  },
  {
    description: 'a gtag script fetch',
    url: 'https://www.googletagmanager.com/gtag/js?id=G-CR3ZVV9BE1',
    request: { mode: 'no-cors', destination: 'script', headers: headers([]) },
    expectedRoute: 'excluded-origin',
  },
  {
    description: 'a VidSrc iframe document',
    url: `${VIDSRC_ORIGIN}/embed/movie/1`,
    request: {
      mode: 'navigate',
      destination: 'iframe',
      headers: headers([['Accept', 'text/html']]),
    },
    expectedRoute: 'excluded-origin',
  },
  {
    description: 'a Next.js static asset',
    url: 'https://skystream.yashiel.dev/_next/static/chunks/main.js',
    request: { mode: 'cors', destination: 'script', headers: headers([]) },
    expectedRoute: 'next-static',
  },
  {
    description: 'a TMDB poster image',
    url: 'https://image.tmdb.org/t/p/w500/poster.jpg',
    request: { mode: 'no-cors', destination: 'image', headers: headers([]) },
    expectedRoute: 'tmdb-image',
  },
  {
    description: 'an unclassified cross-origin request',
    url: 'https://example.com/whatever',
    request: { mode: 'cors', destination: '', headers: headers([]) },
    expectedRoute: 'default',
  },
];

describe('routing policy end-to-end classification', () => {
  it.each(requestScenarios)(
    'classifies $description as $expectedRoute',
    ({ url, request, expectedRoute }) => {
      const routeName = classifyRequest({
        url: new URL(url),
        request,
        vidsrcOrigin: VIDSRC_ORIGIN,
      });
      expect(routeName).toBe(expectedRoute);
    }
  );

  it('never assigns a caching strategy to a flight/RSC request', () => {
    const flightScenarios = requestScenarios.filter(
      scenario => scenario.expectedRoute === 'next-flight'
    );
    expect(flightScenarios.length).toBeGreaterThan(0);

    for (const scenario of flightScenarios) {
      const routeName = classifyRequest({
        url: new URL(scenario.url),
        request: scenario.request,
        vidsrcOrigin: VIDSRC_ORIGIN,
      });
      expect(CACHING_ROUTE_NAMES).not.toContain(routeName);
    }
  });

  it('never assigns a caching strategy to a navigation (document) request', () => {
    const navigationScenarios = requestScenarios.filter(
      scenario => scenario.expectedRoute === 'navigation'
    );
    expect(navigationScenarios.length).toBeGreaterThan(0);

    for (const scenario of navigationScenarios) {
      const routeName = classifyRequest({
        url: new URL(scenario.url),
        request: scenario.request,
        vidsrcOrigin: VIDSRC_ORIGIN,
      });
      expect(CACHING_ROUTE_NAMES).not.toContain(routeName);
    }
  });

  it('only assigns caching strategies to non-HTML static and image routes', () => {
    for (const scenario of requestScenarios) {
      const routeName = classifyRequest({
        url: new URL(scenario.url),
        request: scenario.request,
        vidsrcOrigin: VIDSRC_ORIGIN,
      });
      if (CACHING_ROUTE_NAMES.includes(routeName)) {
        expect(['next-static', 'tmdb-image']).toContain(routeName);
      }
    }
  });
});

describe('precache manifest contains no HTML except /offline', () => {
  const offlineHtml = `<!doctype html><html><head>
    <link rel="stylesheet" href="/_next/static/chunks/offline.css">
    <script src="/_next/static/chunks/offline.js"></script>
    <link rel="preload" as="font" href="/_next/static/media/inter.woff2">
  </head><body>Offline</body></html>`;

  it('precaches the offline document plus only its non-HTML dependencies', () => {
    const entries = buildOfflinePrecacheEntries({
      offlineUrl: '/offline',
      offlineHtml,
      offlineRevision: 'test-revision',
      hashAsset: url => `hash-${url}`,
    });

    const htmlEntries = entries.filter(entry => entry.url === '/offline');
    expect(htmlEntries).toHaveLength(1);

    const nonOfflineEntries = entries.filter(entry => entry.url !== '/offline');
    expect(nonOfflineEntries.length).toBeGreaterThan(0);
    for (const entry of nonOfflineEntries) {
      expect(entry.url).toMatch(/^\/_next\/static\//);
    }
  });
});
