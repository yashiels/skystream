/**
 * URL Routing Utilities for Streaming Modal
 * Handles URL generation, parsing, and browser history management
 */

/**
 * Sanitize a string for use in URLs
 * Removes special characters, converts to lowercase, replaces spaces with hyphens
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeForUrl = str => {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Generate URL slug for a movie
 * Format: /movie/{movie-name}-{tmdb-id}
 * @param {object} content - Content object with title and id
 * @returns {string} URL slug
 */
export const generateMovieUrl = content => {
  if (!content || !content.id) return null;
  const slug = sanitizeForUrl(content.title);
  return `/movie/${slug}-${content.id}`;
};

/**
 * Generate URL slug for a TV show
 * Format: /tv/{show-name}-{tmdb-id}/s{season}/e{episode}
 * @param {object} content - Content object with title and id
 * @param {number} season - Season number
 * @param {number} episode - Episode number
 * @returns {string} URL slug
 */
export const generateTVUrl = (content, season = 1, episode = 1) => {
  if (!content || !content.id) return null;
  const slug = sanitizeForUrl(content.title);
  return `/tv/${slug}-${content.id}/s${season}/e${episode}`;
};

/**
 * Parse movie URL to extract content info
 * Format: /movie/{movie-name}-{tmdb-id}
 * @param {string} pathname - URL pathname
 * @returns {object|null} Parsed content info or null if invalid
 */
export const parseMovieUrl = pathname => {
  const match = pathname.match(/^\/movie\/(.+)-(\d+)$/);
  if (!match) return null;

  return {
    type: 'movie',
    slug: match[1],
    id: parseInt(match[2], 10),
  };
};

/**
 * Parse TV show URL to extract content info
 * Format: /tv/{show-name}-{tmdb-id}/s{season}/e{episode}
 * @param {string} pathname - URL pathname
 * @returns {object|null} Parsed content info or null if invalid
 */
export const parseTVUrl = pathname => {
  const match = pathname.match(/^\/tv\/(.+)-(\d+)\/s(\d+)\/e(\d+)$/);
  if (!match) return null;

  return {
    type: 'tv',
    slug: match[1],
    id: parseInt(match[2], 10),
    season: parseInt(match[3], 10),
    episode: parseInt(match[4], 10),
  };
};

/**
 * Parse any streaming URL (movie or TV)
 * @param {string} pathname - URL pathname
 * @returns {object|null} Parsed content info or null if invalid
 */
export const parseStreamingUrl = pathname => {
  return parseMovieUrl(pathname) || parseTVUrl(pathname);
};

/**
 * Update browser URL using History API
 * @param {string} url - URL to push to history
 * @param {string} title - Page title (optional)
 */
export const updateBrowserUrl = (url, title = '') => {
  if (typeof window !== 'undefined' && window.history) {
    window.history.pushState({ url, title }, title, url);
  }
};

/**
 * Replace browser URL using History API (doesn't create history entry)
 * @param {string} url - URL to replace
 * @param {string} title - Page title (optional)
 */
export const replaceBrowserUrl = (url, title = '') => {
  if (typeof window !== 'undefined' && window.history) {
    window.history.replaceState({ url, title }, title, url);
  }
};

/**
 * Go back to previous URL
 */
export const goBackUrl = () => {
  if (typeof window !== 'undefined' && window.history) {
    window.history.back();
  }
};

/**
 * Check if a URL is a streaming URL
 * @param {string} pathname - URL pathname
 * @returns {boolean} True if it's a streaming URL
 */
export const isStreamingUrl = pathname => {
  return /^\/movie\/|^\/tv\//.test(pathname);
};

export default {
  sanitizeForUrl,
  generateMovieUrl,
  generateTVUrl,
  parseMovieUrl,
  parseTVUrl,
  parseStreamingUrl,
  updateBrowserUrl,
  replaceBrowserUrl,
  goBackUrl,
  isStreamingUrl,
};
