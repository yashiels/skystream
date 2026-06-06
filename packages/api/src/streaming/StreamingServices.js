/**
 * Streaming Services API
 * Handles embed URL generation for Videasy player
 * Docs: https://www.videasy.to/docs
 */

import { PLAYER_DEFAULTS } from '@skystream/shared';

class StreamingServices {
  constructor() {
    this.videasyDomain = PLAYER_DEFAULTS.videasyBaseUrl;
  }

  /**
   * Generate Videasy embed URL for movies
   */
  getMovieUrl(tmdbId, options = {}) {
    const { color = 'e50914', progress, overlay = true, autoplay = 1 } = options;

    let url = `${this.videasyDomain}/movie/${tmdbId}`;

    const params = new URLSearchParams();
    if (color) params.append('color', color);
    if (progress) params.append('progress', progress);
    if (overlay) params.append('overlay', 'true');
    if (autoplay !== undefined) params.append('autoplay', autoplay);

    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;

    return url;
  }

  /**
   * Generate Videasy embed URL for TV shows
   */
  getTVUrl(tmdbId, season = 1, episode = 1, options = {}) {
    const {
      color = 'e50914',
      progress,
      nextEpisode = true,
      episodeSelector = true,
      autoplayNextEpisode = true,
      overlay = true,
    } = options;

    let url = `${this.videasyDomain}/tv/${tmdbId}/${season}/${episode}`;

    const params = new URLSearchParams();
    if (color) params.append('color', color);
    if (progress) params.append('progress', progress);
    if (nextEpisode) params.append('nextEpisode', 'true');
    if (episodeSelector) params.append('episodeSelector', 'true');
    if (autoplayNextEpisode) params.append('autoplayNextEpisode', 'true');
    if (overlay) params.append('overlay', 'true');

    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;

    return url;
  }

  /**
   * Generate Videasy embed URL for anime
   */
  getAnimeUrl(anilistId, episode = 1, options = {}) {
    const {
      dub = false,
      color = 'e50914',
      progress,
      nextEpisode = true,
      episodeSelector = true,
      autoplayNextEpisode = true,
      overlay = true,
    } = options;

    let url = `${this.videasyDomain}/anime/${anilistId}`;
    if (episode > 0) url += `/${episode}`;

    const params = new URLSearchParams();
    if (dub) params.append('dub', 'true');
    if (color) params.append('color', color);
    if (progress) params.append('progress', progress);
    if (nextEpisode) params.append('nextEpisode', 'true');
    if (episodeSelector) params.append('episodeSelector', 'true');
    if (autoplayNextEpisode) params.append('autoplayNextEpisode', 'true');
    if (overlay) params.append('overlay', 'true');

    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;

    return url;
  }

  /**
   * Get the streaming URL for a content item
   */
  getStreamingUrl(content, options = {}) {
    const { season, episode } = options;

    if (content.type === 'movie') {
      return this.getMovieUrl(content.id, options);
    } else if (content.type === 'tv') {
      return this.getTVUrl(content.id, season, episode, options);
    }

    return null;
  }

  // ---- Legacy compatibility aliases ----
  // These map old method names to the Videasy equivalents so existing
  // callers (web components, mobile screens) keep working without changes.

  getVideasyMovieUrl(tmdbId, options = {}) {
    return this.getMovieUrl(tmdbId, options);
  }

  getVideasyTVUrl(tmdbId, season = 1, episode = 1, options = {}) {
    return this.getTVUrl(tmdbId, season, episode, options);
  }

  getVideasyAnimeUrl(anilistId, episode = 1, options = {}) {
    return this.getAnimeUrl(anilistId, episode, options);
  }

  /**
   * Get all available streaming URLs for a content item
   * Returns a single Videasy URL with legacy key aliases for backward compat
   */
  getAllStreamingUrls(content, options = {}) {
    const url = this.getStreamingUrl(content, options);

    return {
      server1: url,
      videasy: url,
      // Legacy aliases
      vidsrc: url,
    };
  }
}

// Export singleton instance
const streamingServices = new StreamingServices();
export default streamingServices;
