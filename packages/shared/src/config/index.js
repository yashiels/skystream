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
  playerBaseUrl: 'https://vidlink.pro',
  // Backward-compat alias — consumers that still reference videasyBaseUrl keep working
  videasyBaseUrl: 'https://vidlink.pro',
  defaultPlayer: 'vidlink',
  defaultColor: 'e50914',
  autoPlay: true,
  language: 'en',
};

export const getTMDBImageUrl = (path, size = TMDB_DEFAULTS.defaultPosterSize) => {
  if (!path) return null;
  return `${TMDB_DEFAULTS.imageBaseUrl}/${size}${path}`;
};

export const getPosterUrl = path => getTMDBImageUrl(path, TMDB_DEFAULTS.defaultPosterSize);

export const getBackdropUrl = path => getTMDBImageUrl(path, TMDB_DEFAULTS.defaultBackdropSize);
