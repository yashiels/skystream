import streamingServices from '../streamingServices';
import { PLAYER_DEFAULTS } from '@skystream/shared';

const BASE = PLAYER_DEFAULTS.vidsrcBaseUrl;

describe('StreamingServices (VidSrc)', () => {
  describe('getMovieUrl', () => {
    it('generates basic movie URL', () => {
      const url = streamingServices.getMovieUrl(299534);
      expect(url).toContain(`${BASE}/embed/movie/299534`);
    });

    it('includes autoplay by default', () => {
      const url = streamingServices.getMovieUrl(299534);
      expect(url).toContain('autoplay=1');
    });

    it('maps progress to startAt and drops color/overlay', () => {
      const url = streamingServices.getMovieUrl(299534, {
        startAt: 60,
      });
      expect(url).toContain('startAt=60');
      expect(url).not.toContain('color');
      expect(url).not.toContain('overlay');
    });
  });

  describe('getTVUrl', () => {
    it('generates TV URL with season and episode', () => {
      const url = streamingServices.getTVUrl(1399, 2, 5);
      expect(url).toContain(`${BASE}/embed/tv/1399/2/5`);
    });

    it('includes autonext by default, not the dropped Videasy params', () => {
      const url = streamingServices.getTVUrl(1399, 1, 1);
      expect(url).toContain('autonext=1');
      expect(url).not.toContain('nextEpisode');
      expect(url).not.toContain('episodeSelector');
      expect(url).not.toContain('autoplayNextEpisode');
    });

    it('defaults to season 1 episode 1', () => {
      const url = streamingServices.getTVUrl(1399);
      expect(url).toContain('/embed/tv/1399/1/1');
    });
  });

  describe('getStreamingUrl', () => {
    it('returns movie URL for movie type', () => {
      const url = streamingServices.getStreamingUrl({ id: 299534, type: 'movie' });
      expect(url).toContain('/embed/movie/299534');
    });

    it('returns TV URL for tv type', () => {
      const url = streamingServices.getStreamingUrl(
        { id: 1399, type: 'tv' },
        { season: 1, episode: 1 }
      );
      expect(url).toContain('/embed/tv/1399/1/1');
    });

    it('returns null for anime — no VidSrc anime endpoint', () => {
      const url = streamingServices.getStreamingUrl({ id: 21, type: 'anime' });
      expect(url).toBeNull();
    });
  });

  describe('getAllStreamingUrls', () => {
    it('returns the VidSrc URL with legacy aliases for movies', () => {
      const urls = streamingServices.getAllStreamingUrls({ id: 299534, type: 'movie' });
      expect(urls.vidsrc).toContain(`${BASE}/embed/movie/299534`);
      expect(urls.server1).toBe(urls.vidsrc);
    });

    it('returns the VidSrc URL with legacy aliases for TV', () => {
      const urls = streamingServices.getAllStreamingUrls(
        { id: 1399, type: 'tv' },
        { season: 1, episode: 1 }
      );
      expect(urls.vidsrc).toContain(`${BASE}/embed/tv/1399/1/1`);
      expect(urls.server1).toBe(urls.vidsrc);
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
