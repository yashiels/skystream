/**
 * Application Configuration
 * Centralizes all environment variables and provides defaults
 *
 * IMPORTANT: Next.js only inlines process.env.NEXT_PUBLIC_* when accessed
 * as a direct static property (NOT via dynamic key lookup like process.env[key]).
 * Every env var must be referenced as process.env.NEXT_PUBLIC_XXX directly.
 */

import { PLAYER_DEFAULTS } from '@skystream/shared';

// Application Configuration
export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'SkyStream',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '2.0.0',
  description:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
    'Your ultimate destination for streaming movies and TV shows',
  isDev: process.env.NODE_ENV === 'development',
  enableLogs:
    process.env.NEXT_PUBLIC_ENABLE_CONSOLE_LOGS === 'true' ||
    process.env.NEXT_PUBLIC_ENABLE_CONSOLE_LOGS === '1' ||
    process.env.NODE_ENV === 'development',
};

// API Configuration
export const API_CONFIG = {
  tmdb: {
    apiKey: process.env.NEXT_PUBLIC_TMDB_API_KEY || '',
    baseUrl: process.env.NEXT_PUBLIC_TMDB_BASE_URL || 'https://api.themoviedb.org/3',
    imageBaseUrl: process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p',
    defaultPosterSize: process.env.NEXT_PUBLIC_DEFAULT_POSTER_SIZE || 'w500',
    defaultBackdropSize: process.env.NEXT_PUBLIC_DEFAULT_BACKDROP_SIZE || 'w1280',
  },
};

if (typeof window === 'undefined' && !API_CONFIG.tmdb.apiKey) {
  // Server-side startup check — throws during `next build` or `next start` if key is absent
  console.error('[SkyStream] FATAL: NEXT_PUBLIC_TMDB_API_KEY is not set. All API calls will fail.');
}

// Video Player Configuration
export const PLAYER_CONFIG = {
  vidsrc: {
    baseUrl: process.env.NEXT_PUBLIC_VIDSRC_BASE_URL || PLAYER_DEFAULTS.vidsrcBaseUrl,
  },
  defaults: {
    player: process.env.NEXT_PUBLIC_DEFAULT_PLAYER || 'vidsrc',
    autoPlay:
      process.env.NEXT_PUBLIC_AUTO_PLAY === undefined
        ? true
        : process.env.NEXT_PUBLIC_AUTO_PLAY === 'true' || process.env.NEXT_PUBLIC_AUTO_PLAY === '1',
    language: 'en',
  },
};

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  enabled:
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === undefined
      ? true
      : process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true' ||
        process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === '1',
  trackingId: process.env.NEXT_PUBLIC_GA_TRACKING_ID || 'G-CR3ZVV9BE1',
};

// Utility Functions
export const utils = {
  // Generate TMDB image URL
  getTMDBImageUrl: (path, size = API_CONFIG.tmdb.defaultPosterSize) => {
    if (!path) return null;
    return `${API_CONFIG.tmdb.imageBaseUrl}/${size}${path}`;
  },

  // Generate poster URL
  getPosterUrl: path => {
    return utils.getTMDBImageUrl(path, API_CONFIG.tmdb.defaultPosterSize);
  },

  // Generate backdrop URL
  getBackdropUrl: path => {
    return utils.getTMDBImageUrl(path, API_CONFIG.tmdb.defaultBackdropSize);
  },

  // Generate video player URL (synchronous version)
  generatePlayerUrl: (
    player,
    contentId,
    contentType,
    season = null,
    episode = null,
    options = {}
  ) => {
    if (player !== 'vidsrc') return '';

    const playerOptions = {
      autoplay: PLAYER_CONFIG.defaults.autoPlay ? '1' : '0',
      ...options,
    };

    let url;

    if (contentType === 'movie') {
      url = `${PLAYER_CONFIG.vidsrc.baseUrl}/embed/movie/${contentId}`;
    } else if (contentType === 'tv') {
      url = `${PLAYER_CONFIG.vidsrc.baseUrl}/embed/tv/${contentId}/${season}/${episode}`;
      playerOptions.autonext = '1';
    } else {
      // No VidSrc anime endpoint — anime content is served through the TMDB
      // TV entry (see StreamingServices.getStreamingUrl), never reaches here.
      return '';
    }

    // Clean up playerOptions - remove undefined/null values
    const cleanOptions = {};
    Object.keys(playerOptions).forEach(key => {
      if (playerOptions[key] !== undefined && playerOptions[key] !== null) {
        cleanOptions[key] = playerOptions[key];
      }
    });

    const params = new URLSearchParams(cleanOptions);
    return `${url}?${params}`;
  },

  // Get IMDB ID from TMDB
  getIMDBId: async (tmdbId, type = 'movie') => {
    try {
      const apiKey = API_CONFIG.tmdb.apiKey;
      const baseUrl = API_CONFIG.tmdb.baseUrl;

      if (!apiKey) {
        throw new Error('TMDB API key not configured');
      }

      const url = `${baseUrl}/${type}/${tmdbId}/external_ids?api_key=${apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch external IDs: ${response.status}`);
      }

      const data = await response.json();
      return data.imdb_id;
    } catch (error) {
      console.error('Failed to get IMDB ID:', error);
      return null;
    }
  },

  // Download URL — VidSrc does not provide download links
  getDownloadUrl: () => null,

  // Log function that respects environment settings
  log: (...args) => {
    if (APP_CONFIG.enableLogs) {
      console.log('[SkyStream]', ...args);
    }
  },

  // Error log function
  error: (...args) => {
    if (APP_CONFIG.enableLogs) {
      console.error('[SkyStream Error]', ...args);
    }
  },

  // Warn log function
  warn: (...args) => {
    if (APP_CONFIG.enableLogs) {
      console.warn('[SkyStream Warning]', ...args);
    }
  },
};

// Export all configurations as default
export default {
  APP_CONFIG,
  API_CONFIG,
  PLAYER_CONFIG,
  ANALYTICS_CONFIG,
  utils,
};
