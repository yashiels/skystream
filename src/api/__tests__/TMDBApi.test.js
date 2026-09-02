import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { TMDBApi } from '../tmdb/TMDBApi.js';

describe('TMDBApi', () => {
  let api;
  let fetchMock;

  const mockResponse = (data, { ok = true, status = 200, statusText = 'OK' } = {}) => {
    fetchMock.mockResolvedValue({
      ok,
      status,
      statusText,
      json: async () => data,
    });
  };

  // pathname of the URL passed to the most recent fetch call
  const lastPath = () => new URL(fetchMock.mock.calls.at(-1)[0]).pathname;
  const lastUrl = () => fetchMock.mock.calls.at(-1)[0];

  beforeEach(() => {
    fetchMock = jest.fn();
    globalThis.fetch = fetchMock;
    api = new TMDBApi({
      apiKey: 'test-key',
      baseUrl: 'https://api.test/3',
      imageBaseUrl: 'https://img.test',
    });
  });

  afterEach(() => {
    delete globalThis.fetch;
    jest.restoreAllMocks();
  });

  describe('makeRequest', () => {
    it('builds the URL from baseUrl, endpoint, api_key, and merged params', async () => {
      mockResponse({ results: [] });

      await api.makeRequest('/movie/popular', { page: 2 });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const url = lastUrl();
      expect(url.startsWith('https://api.test/3/movie/popular?')).toBe(true);
      expect(url).toContain('api_key=test-key');
      expect(url).toContain('page=2');
    });

    it('URL-encodes query parameter keys and values', async () => {
      mockResponse({ results: [] });

      await api.makeRequest('/search/multi', { query: 'star wars & co' });

      expect(lastUrl()).toContain('query=star%20wars%20%26%20co');
    });

    it('omits params that are null or undefined', async () => {
      mockResponse({ results: [] });

      await api.makeRequest('/discover/movie', { page: 1, genre: null, year: undefined });

      const url = lastUrl();
      expect(url).toContain('page=1');
      expect(url).not.toContain('genre');
      expect(url).not.toContain('year');
    });

    it('returns the parsed JSON body on a successful response', async () => {
      mockResponse({ results: [{ id: 1 }], total_pages: 1 });

      const data = await api.makeRequest('/movie/popular');

      expect(data).toEqual({ results: [{ id: 1 }], total_pages: 1 });
    });

    it('throws a descriptive error when the response is not ok', async () => {
      mockResponse(null, { ok: false, status: 404, statusText: 'Not Found' });

      await expect(api.makeRequest('/movie/0')).rejects.toThrow('TMDB API Error: 404 Not Found');
    });

    it('propagates network/fetch rejections', async () => {
      fetchMock.mockRejectedValue(new Error('network down'));

      await expect(api.makeRequest('/movie/popular')).rejects.toThrow('network down');
    });
  });

  describe('endpoint methods', () => {
    beforeEach(() => mockResponse({ results: [] }));

    it('getTrending defaults to /trending/all/week', async () => {
      await api.getTrending();
      expect(lastPath()).toBe('/3/trending/all/week');
    });

    it('getTrending honours mediaType and timeWindow', async () => {
      await api.getTrending('movie', 'day');
      expect(lastPath()).toBe('/3/trending/movie/day');
    });

    it('getPopularMovies uses /movie/popular with a page', async () => {
      await api.getPopularMovies(3);
      expect(lastPath()).toBe('/3/movie/popular');
      expect(lastUrl()).toContain('page=3');
    });

    it('getPopularTVShows uses /tv/popular', async () => {
      await api.getPopularTVShows();
      expect(lastPath()).toBe('/3/tv/popular');
    });

    it('getTopRatedMovies uses /movie/top_rated', async () => {
      await api.getTopRatedMovies();
      expect(lastPath()).toBe('/3/movie/top_rated');
    });

    it('search uses /search/multi with the query', async () => {
      await api.search('matrix', 2);
      expect(lastPath()).toBe('/3/search/multi');
      expect(lastUrl()).toContain('query=matrix');
      expect(lastUrl()).toContain('page=2');
    });

    it('searchMovies and searchTVShows use the typed search endpoints', async () => {
      await api.searchMovies('dune');
      expect(lastPath()).toBe('/3/search/movie');

      await api.searchTVShows('loki');
      expect(lastPath()).toBe('/3/search/tv');
    });

    it('getMovieDetails appends videos/credits/similar/recommendations', async () => {
      await api.getMovieDetails(42);
      expect(lastPath()).toBe('/3/movie/42');
      expect(lastUrl()).toContain(
        'append_to_response=videos%2Ccredits%2Csimilar%2Crecommendations'
      );
    });

    it('getTVShowDetails uses /tv/:id', async () => {
      await api.getTVShowDetails(7);
      expect(lastPath()).toBe('/3/tv/7');
    });

    it('getTVSeasonDetails uses /tv/:id/season/:n', async () => {
      await api.getTVSeasonDetails(7, 2);
      expect(lastPath()).toBe('/3/tv/7/season/2');
    });

    it('getMovieGenres and getTVGenres use the genre list endpoints', async () => {
      await api.getMovieGenres();
      expect(lastPath()).toBe('/3/genre/movie/list');

      await api.getTVGenres();
      expect(lastPath()).toBe('/3/genre/tv/list');
    });
  });

  describe('transformContent', () => {
    it('normalises a movie item and resolves a movie type', () => {
      const result = api.transformContent({
        id: 1,
        title: 'Fight Club',
        media_type: 'movie',
        release_date: '1999-10-15',
      });

      expect(result).toMatchObject({
        id: 1,
        title: 'Fight Club',
        name: 'Fight Club',
        type: 'movie',
        media_type: 'movie',
      });
      expect(result.videos).toEqual([]);
    });

    it('normalises a TV item and resolves a tv type', () => {
      const result = api.transformContent({ id: 2, name: 'Loki', media_type: 'tv' });
      expect(result.type).toBe('tv');
      expect(result.title).toBe('Loki');
    });
  });
});
