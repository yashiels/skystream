import streamingServices from '../streamingServices';

describe('StreamingServices (Videasy)', () => {
  describe('getMovieUrl', () => {
    it('generates basic movie URL', () => {
      const url = streamingServices.getMovieUrl(299534);
      expect(url).toContain('player.videasy.to/movie/299534');
    });

    it('includes default color and overlay', () => {
      const url = streamingServices.getMovieUrl(299534);
      expect(url).toContain('color=e50914');
      expect(url).toContain('overlay=true');
    });

    it('accepts custom options', () => {
      const url = streamingServices.getMovieUrl(299534, {
        color: '3B82F6',
        progress: 60,
      });
      expect(url).toContain('color=3B82F6');
      expect(url).toContain('progress=60');
    });
  });

  describe('getTVUrl', () => {
    it('generates TV URL with season and episode', () => {
      const url = streamingServices.getTVUrl(1399, 2, 5);
      expect(url).toContain('player.videasy.to/tv/1399/2/5');
    });

    it('includes episode navigation features by default', () => {
      const url = streamingServices.getTVUrl(1399, 1, 1);
      expect(url).toContain('nextEpisode=true');
      expect(url).toContain('episodeSelector=true');
      expect(url).toContain('autoplayNextEpisode=true');
    });

    it('defaults to season 1 episode 1', () => {
      const url = streamingServices.getTVUrl(1399);
      expect(url).toContain('/tv/1399/1/1');
    });
  });

  describe('getAnimeUrl', () => {
    it('generates anime URL with episode', () => {
      const url = streamingServices.getAnimeUrl(21, 5);
      expect(url).toContain('player.videasy.to/anime/21/5');
    });

    it('supports dub option', () => {
      const url = streamingServices.getAnimeUrl(21, 1, { dub: true });
      expect(url).toContain('dub=true');
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
    it('returns Videasy URL with legacy aliases for movies', () => {
      const urls = streamingServices.getAllStreamingUrls({ id: 299534, type: 'movie' });
      expect(urls.videasy).toContain('player.videasy.to/movie/299534');
      expect(urls.server1).toBe(urls.videasy);
      expect(urls.vidsrc).toBe(urls.videasy);
    });

    it('returns Videasy URL with legacy aliases for TV', () => {
      const urls = streamingServices.getAllStreamingUrls(
        { id: 1399, type: 'tv' },
        { season: 1, episode: 1 }
      );
      expect(urls.videasy).toContain('player.videasy.to/tv/1399/1/1');
      expect(urls.server1).toBe(urls.videasy);
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
