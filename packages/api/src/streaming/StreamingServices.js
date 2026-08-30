/**
 * Streaming Services API
 * Handles embed URL generation for the VidSrc player
 * Docs: https://vidsrcme.ru/vidsrc/docs/
 */

import { PLAYER_DEFAULTS } from '@skystream/shared';

class StreamingServices {
  constructor() {
    this.vidsrcDomain = PLAYER_DEFAULTS.vidsrcBaseUrl;
  }

  /**
   * Generate a VidSrc embed URL for movies
   */
  getMovieUrl(tmdbId, options = {}) {
    const { autoplay = 1, startAt } = options;

    let url = `${this.vidsrcDomain}/embed/movie/${tmdbId}`;

    const params = new URLSearchParams();
    if (autoplay !== undefined) params.append('autoplay', autoplay);
    if (startAt) params.append('startAt', startAt);

    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;

    return url;
  }

  /**
   * Generate a VidSrc embed URL for TV shows
   */
  getTVUrl(tmdbId, season = 1, episode = 1, options = {}) {
    const { autoplay = 1, autonext = true, startAt } = options;

    let url = `${this.vidsrcDomain}/embed/tv/${tmdbId}/${season}/${episode}`;

    const params = new URLSearchParams();
    if (autoplay !== undefined) params.append('autoplay', autoplay);
    if (autonext) params.append('autonext', '1');
    if (startAt) params.append('startAt', startAt);

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

  /**
   * Get all available streaming URLs for a content item
   */
  getAllStreamingUrls(content, options = {}) {
    const url = this.getStreamingUrl(content, options);

    return {
      server1: url,
      vidsrc: url,
    };
  }
}

// Export singleton instance
const streamingServices = new StreamingServices();
export default streamingServices;
