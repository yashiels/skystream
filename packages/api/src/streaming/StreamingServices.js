/**
 * Streaming Services API
 * Handles embed URL generation for VidLink.pro player
 * Docs: https://vidlink.pro
 */

import { PLAYER_DEFAULTS } from '@skystream/shared';

class StreamingServices {
  constructor() {
    this.playerDomain = PLAYER_DEFAULTS.playerBaseUrl;
    // Backward-compat alias
    this.videasyDomain = this.playerDomain;
  }

  /**
   * Generate VidLink embed URL for movies
   * https://vidlink.pro/movie/{tmdbId}?primaryColor=e50914&autoplay=true&poster=true&title=true
   */
  getMovieUrl(tmdbId, options = {}) {
    const { primaryColor, color = 'e50914', progress, autoplay = true } = options;
    // Support legacy 'color' param — primaryColor takes precedence
    const resolvedColor = primaryColor || color;

    let url = `${this.playerDomain}/movie/${tmdbId}`;

    const params = new URLSearchParams();
    if (resolvedColor) params.append('primaryColor', resolvedColor);
    if (progress) params.append('progress', progress);
    params.append('autoplay', autoplay ? 'true' : String(autoplay));
    params.append('poster', 'true');
    params.append('title', 'true');

    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;

    return url;
  }

  /**
   * Generate VidLink embed URL for TV shows
   * https://vidlink.pro/tv/{tmdbId}/{season}/{episode}?primaryColor=e50914&nextbutton=true&autoplay=true&poster=true&title=true
   */
  getTVUrl(tmdbId, season = 1, episode = 1, options = {}) {
    const {
      primaryColor,
      color = 'e50914',
      progress,
      // 'nextEpisode' is the legacy Videasy param; 'nextbutton' is the VidLink param.
      // nextbutton takes precedence; nextEpisode falls back for callers that haven't migrated yet.
      nextEpisode = true,
      nextbutton,
      autoplay = true,
    } = options;
    const resolvedColor = primaryColor || color;
    const resolvedNextbutton = nextbutton !== undefined ? nextbutton : nextEpisode;

    let url = `${this.playerDomain}/tv/${tmdbId}/${season}/${episode}`;

    const params = new URLSearchParams();
    if (resolvedColor) params.append('primaryColor', resolvedColor);
    if (progress) params.append('progress', progress);
    if (resolvedNextbutton) params.append('nextbutton', 'true');
    params.append('autoplay', autoplay ? 'true' : String(autoplay));
    params.append('poster', 'true');
    params.append('title', 'true');

    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;

    return url;
  }

  /**
   * Generate VidLink embed URL for anime
   * https://vidlink.pro/anime/{MALid}/{number}/{subOrDub}
   *
   * @param {number} malId  - MyAnimeList ID
   * @param {number} episode - Episode number (0 = anime movie, omits episode segment)
   * @param {object} options
   * @param {boolean} [options.dub=false]   - Backward-compat: true maps to 'dub', false to 'sub'
   * @param {string}  [options.subOrDub]    - Explicit 'sub' | 'dub' override (takes precedence)
   */
  getAnimeUrl(malId, episode = 1, options = {}) {
    const { dub = false, subOrDub } = options;
    const audioTrack = subOrDub || (dub ? 'dub' : 'sub');

    let url = `${this.playerDomain}/anime/${malId}`;
    if (episode > 0) url += `/${episode}`;
    url += `/${audioTrack}`;

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
  // These map old Videasy method names to VidLink equivalents so existing
  // callers (web components, mobile screens) keep working without changes.

  getVideasyMovieUrl(tmdbId, options = {}) {
    return this.getMovieUrl(tmdbId, options);
  }

  getVideasyTVUrl(tmdbId, season = 1, episode = 1, options = {}) {
    return this.getTVUrl(tmdbId, season, episode, options);
  }

  getVideasyAnimeUrl(malId, episode = 1, options = {}) {
    return this.getAnimeUrl(malId, episode, options);
  }

  /**
   * Get all available streaming URLs for a content item.
   * Returns a single VidLink URL with legacy key aliases for backward compat.
   */
  getAllStreamingUrls(content, options = {}) {
    const url = this.getStreamingUrl(content, options);

    return {
      server1: url,
      vidlink: url,
      // Legacy aliases
      videasy: url,
      vidsrc: url,
    };
  }
}

// Export singleton instance
const streamingServices = new StreamingServices();
export default streamingServices;
