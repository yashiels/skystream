import {
  CACHEABLE_STATUSES,
  OBSOLETE_CACHE_NAMES,
  TMDB_IMAGE_CACHE_CONFIG,
  isExcludedOrigin,
  isNextFlightRequest,
  isNextStaticAsset,
  isTmdbApiRequest,
  isTmdbImageRequest,
} from '../routing';

const VIDSRC_ORIGIN = 'https://vidsrcme.ru';

const headers = entries => ({
  get: name => {
    const match = entries.find(([key]) => key.toLowerCase() === name.toLowerCase());
    return match ? match[1] : null;
  },
});

describe('isNextFlightRequest', () => {
  it('matches when the RSC header is present', () => {
    expect(
      isNextFlightRequest({
        url: 'https://skystream.yashiel.dev/home',
        headers: headers([['RSC', '1']]),
      })
    ).toBe(true);
  });

  it('matches when the URL contains _rsc=', () => {
    expect(
      isNextFlightRequest({
        url: 'https://skystream.yashiel.dev/home?_rsc=abc123',
        headers: headers([]),
      })
    ).toBe(true);
  });

  it('matches when the Next-Router-State-Tree header is present', () => {
    expect(
      isNextFlightRequest({
        url: 'https://skystream.yashiel.dev/home',
        headers: headers([['Next-Router-State-Tree', '%5B%5D']]),
      })
    ).toBe(true);
  });

  it('matches when the Next-Router-Prefetch header is present', () => {
    expect(
      isNextFlightRequest({
        url: 'https://skystream.yashiel.dev/home',
        headers: headers([['Next-Router-Prefetch', '1']]),
      })
    ).toBe(true);
  });

  it('matches when the Next-Router-Segment-Prefetch header is present', () => {
    expect(
      isNextFlightRequest({
        url: 'https://skystream.yashiel.dev/home',
        headers: headers([['Next-Router-Segment-Prefetch', '/home']]),
      })
    ).toBe(true);
  });

  it('matches when the Accept header contains text/x-component', () => {
    expect(
      isNextFlightRequest({
        url: 'https://skystream.yashiel.dev/home',
        headers: headers([['Accept', 'text/x-component']]),
      })
    ).toBe(true);
  });

  it('matches when multiple signals are present at once', () => {
    expect(
      isNextFlightRequest({
        url: 'https://skystream.yashiel.dev/home?_rsc=abc123',
        headers: headers([
          ['RSC', '1'],
          ['Next-Router-Prefetch', '1'],
        ]),
      })
    ).toBe(true);
  });

  it('does not match a plain navigation request', () => {
    expect(
      isNextFlightRequest({
        url: 'https://skystream.yashiel.dev/home',
        headers: headers([['Accept', 'text/html']]),
      })
    ).toBe(false);
  });
});

describe('isExcludedOrigin', () => {
  it('excludes googletagmanager', () => {
    expect(isExcludedOrigin('https://www.googletagmanager.com/gtag/js', VIDSRC_ORIGIN)).toBe(true);
  });

  it('excludes google-analytics', () => {
    expect(isExcludedOrigin('https://www.google-analytics.com/collect', VIDSRC_ORIGIN)).toBe(true);
  });

  it('excludes the configured VidSrc origin', () => {
    expect(isExcludedOrigin('https://vidsrcme.ru/embed/movie/1', VIDSRC_ORIGIN)).toBe(true);
  });

  it('does not exclude an unrelated origin', () => {
    expect(isExcludedOrigin('https://skystream.yashiel.dev/', VIDSRC_ORIGIN)).toBe(false);
  });
});

describe('isTmdbApiRequest', () => {
  it('matches the TMDB API host', () => {
    expect(isTmdbApiRequest('https://api.themoviedb.org/3/movie/1')).toBe(true);
  });

  it('does not match other hosts', () => {
    expect(isTmdbApiRequest('https://image.tmdb.org/t/p/w500/x.jpg')).toBe(false);
  });
});

describe('isTmdbImageRequest', () => {
  it('matches a valid TMDB image path', () => {
    expect(isTmdbImageRequest('https://image.tmdb.org/t/p/w500/poster.jpg')).toBe(true);
  });

  it('does not match the TMDB image host with an unexpected pathname', () => {
    expect(isTmdbImageRequest('https://image.tmdb.org/other/path')).toBe(false);
  });

  it('does not match a different cross-origin host serving images', () => {
    expect(isTmdbImageRequest('https://evil.example.com/t/p/w500/poster.jpg')).toBe(false);
  });
});

describe('isNextStaticAsset', () => {
  it('matches files under /_next/static/', () => {
    expect(isNextStaticAsset('https://skystream.yashiel.dev/_next/static/chunks/main.js')).toBe(
      true
    );
  });

  it('does not match other /_next/ paths', () => {
    expect(isNextStaticAsset('https://skystream.yashiel.dev/_next/image?url=/x.jpg')).toBe(false);
  });
});

describe('cache policy constants', () => {
  it('bounds the TMDB image cache by both maxEntries and maxAgeSeconds', () => {
    expect(TMDB_IMAGE_CACHE_CONFIG.maxEntries).toBe(300);
    expect(TMDB_IMAGE_CACHE_CONFIG.maxAgeSeconds).toBe(14 * 24 * 60 * 60);
  });

  it('accepts opaque and ok responses only', () => {
    expect(CACHEABLE_STATUSES).toEqual([0, 200]);
  });

  it('lists the legacy cache for removal', () => {
    expect(OBSOLETE_CACHE_NAMES).toContain('skystream-v1');
  });
});
