import streamingServices from '../streamingServices';
import { PLAYER_DEFAULTS } from '@skystream/shared';

const BASE = PLAYER_DEFAULTS.playerBaseUrl;

describe('StreamingServices (VidLink)', () => {
  describe('getMovieUrl', () => {
    it('generates basic movie URL', () => {
      const url = streamingServices.getMovieUrl(299534);
      expect(url).toContain(`${BASE}/movie/299534`);
    });

    it('includes default primaryColor, poster, and title', () => {
      const url = streamingServices.getMovieUrl(299534);
      expect(url).toContain('primaryColor=e50914');
      expect(url).toContain('poster=true');
      expect(url).toContain('title=true');
      // Videasy overlay param must not bleed through
      expect(url).not.toContain('overlay=');
    });

    it('accepts custom color (legacy param) and progress', () => {
      const url = streamingServices.getMovieUrl(299534, {
        color: '3B82F6',
        progress: 60,
      });
      expect(url).toContain('primaryColor=3B82F6');
      expect(url).toContain('progress=60');
    });
  });

  describe('getTVUrl', () => {
    it('generates TV URL with season and episode', () => {
      const url = streamingServices.getTVUrl(1399, 2, 5);
      expect(url).toContain(`${BASE}/tv/1399/2/5`);
    });

    it('uses nextbutton (not nextEpisode) and omits removed Videasy params', () => {
      const url = streamingServices.getTVUrl(1399, 1, 1);
      expect(url).toContain('nextbutton=true');
      expect(url).toContain('poster=true');
      expect(url).toContain('title=true');
      expect(url).not.toContain('episodeSelector=');
      expect(url).not.toContain('autoplayNextEpisode=');
      expect(url).not.toContain('overlay=');
    });

    it('defaults to season 1 episode 1', () => {
      const url = streamingServices.getTVUrl(1399);
      expect(url).toContain('/tv/1399/1/1');
    });
  });

  describe('getAnimeUrl', () => {
    it('generates anime URL with episode (defaults to sub)', () => {
      const url = streamingServices.getAnimeUrl(21, 5);
      expect(url).toContain(`${BASE}/anime/21/5/sub`);
    });

    it('supports dub option (backward-compat boolean → path segment)', () => {
      const url = streamingServices.getAnimeUrl(21, 1, { dub: true });
      expect(url).toContain('/dub');
      expect(url).not.toContain('/sub');
    });
  });

  describe('getStreamingUrl', () => {
    it('returns movie URL for movie type', () => {
      const url = streamingServices.getStreamingUrl({ id: 299534, type: 'movie' });
      expect(url).toContain('/movie/299534');
    });

    it('returns TV URL for tv type', () => {
      const url = streamingServices.getStreamingUrl(
        { id: 1399, type: 'tv' },
        { season: 1, episode: 1 }
      );
      expect(url).toContain('/tv/1399/1/1');
    });
  });

  describe('getAllStreamingUrls', () => {
    it('returns VidLink URL with legacy aliases for movies', () => {
      const urls = streamingServices.getAllStreamingUrls({ id: 299534, type: 'movie' });
      expect(urls.server1).toContain(`${BASE}/movie/299534`);
      expect(urls.vidlink).toBe(urls.server1);
      // Legacy aliases still present for backward compat
      expect(urls.videasy).toBe(urls.server1);
      expect(urls.vidsrc).toBe(urls.server1);
    });

    it('returns VidLink URL with legacy aliases for TV', () => {
      const urls = streamingServices.getAllStreamingUrls(
        { id: 1399, type: 'tv' },
        { season: 1, episode: 1 }
      );
      expect(urls.server1).toContain(`${BASE}/tv/1399/1/1`);
      expect(urls.vidlink).toBe(urls.server1);
    });
  });

  describe('legacy method aliases', () => {
    it('getVideasyMovieUrl works', () => {
      const url = streamingServices.getVideasyMovieUrl(299534);
      expect(url).toContain('/movie/299534');
    });

    it('getVideasyTVUrl works', () => {
      const url = streamingServices.getVideasyTVUrl(1399, 1, 1);
      expect(url).toContain('/tv/1399/1/1');
    });
  });
});

describe('TMDBApi', () => {
  // Re-export the TMDB tests that were in this file
  const tmdbApi = require('../tmdbApi').default;

  describe('makeRequest', () => {
    beforeEach(() => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ results: [] }),
        })
      );
    });

    it('makes successful API request', async () => {
      const result = await tmdbApi.makeRequest('/test');
      expect(result).toEqual({ results: [] });
    });

    it('includes API key in request', async () => {
      await tmdbApi.makeRequest('/test');
      const callUrl = global.fetch.mock.calls[0][0];
      expect(callUrl).toContain('api_key=');
    });

    it('includes additional parameters', async () => {
      await tmdbApi.makeRequest('/test', { page: 2 });
      const callUrl = global.fetch.mock.calls[0][0];
      expect(callUrl).toContain('page=2');
    });

    it('handles non-ok response', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        })
      );
      await expect(tmdbApi.makeRequest('/test')).rejects.toThrow('TMDB API Error: 404 Not Found');
    });
  });
});
