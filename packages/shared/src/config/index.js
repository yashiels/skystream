export const APP_CONFIG = {
  name: 'SkyStream',
  version: '2.0.0',
  description: 'Your ultimate destination for streaming movies and TV shows',
};

export const TMDB_DEFAULTS = {
  baseUrl: 'https://api.themoviedb.org/3',
  imageBaseUrl: 'https://image.tmdb.org/t/p',
  defaultPosterSize: 'w500',
  defaultBackdropSize: 'w1280',
};

export const PLAYER_DEFAULTS = {
  // NEXT_PUBLIC_ so Next.js inlines it into the client bundle too — VidSrc
  // supports CNAME'ing a custom domain (fewer ads, no-click autoplay), and
  // swapping to it must be an env change here, not a code change.
  vidsrcBaseUrl:
    (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_VIDSRC_BASE_URL) ||
    'https://vidsrcme.ru',
  defaultPlayer: 'vidsrc',
  autoPlay: true,
  language: 'en',
};

export const getTMDBImageUrl = (path, size = TMDB_DEFAULTS.defaultPosterSize) => {
  if (!path) return null;
  return `${TMDB_DEFAULTS.imageBaseUrl}/${size}${path}`;
};

export const getPosterUrl = path => getTMDBImageUrl(path, TMDB_DEFAULTS.defaultPosterSize);

export const getBackdropUrl = path => getTMDBImageUrl(path, TMDB_DEFAULTS.defaultBackdropSize);
