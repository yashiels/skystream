import tmdbApi from '../tmdbApi';

// Mock fetch
global.fetch = jest.fn();

// Mock config
jest.mock('../../utils/config', () => ({
  API_CONFIG: {
    tmdb: {
      baseUrl: 'https://api.themoviedb.org/3',
      apiKey: 'test-api-key',
      imageBaseUrl: 'https://image.tmdb.org/t/p',
    },
  },
  utils: {
    log: jest.fn(),
    error: jest.fn(),
  },
}));

describe('TMDBApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
  });

  describe('makeRequest', () => {
    test('makes successful API request', async () => {
      const mockData = { results: [] };
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await tmdbApi.makeRequest('/test');

      expect(fetch).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    test('includes API key in request', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await tmdbApi.makeRequest('/test');

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('api_key=test-api-key');
    });

    test('includes additional parameters', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await tmdbApi.makeRequest('/test', { page: 2, language: 'en' });

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('page=2');
      expect(callUrl.toString()).toContain('language=en');
    });

    test('skips undefined and null parameters', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await tmdbApi.makeRequest('/test', { page: 1, undefined: undefined, null: null });

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).not.toContain('undefined');
      expect(callUrl.toString()).not.toContain('null');
    });

    test('throws error on failed request', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(tmdbApi.makeRequest('/test')).rejects.toThrow('TMDB API Error: 404 Not Found');
    });

    test('throws error on network failure', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      await expect(tmdbApi.makeRequest('/test')).rejects.toThrow('Network error');
    });
  });

  describe('getTrending', () => {
    test('gets trending content with default parameters', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await tmdbApi.getTrending();

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/trending/all/week');
    });

    test('gets trending movies for day', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await tmdbApi.getTrending('movie', 'day');

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/trending/movie/day');
    });
  });

  describe('getPopularMovies', () => {
    test('gets popular movies', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await tmdbApi.getPopularMovies();

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/movie/popular');
    });

    test('includes page parameter', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await tmdbApi.getPopularMovies(2);

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('page=2');
    });
  });

  describe('getPopularTVShows', () => {
    test('gets popular TV shows', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await tmdbApi.getPopularTVShows();

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/tv/popular');
    });
  });

  describe('getTopRatedMovies', () => {
    test('gets top rated movies', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await tmdbApi.getTopRatedMovies();

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/movie/top_rated');
    });
  });

  describe('getTopRatedTVShows', () => {
    test('gets top rated TV shows', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await tmdbApi.getTopRatedTVShows();

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/tv/top_rated');
    });
  });

  describe('getNowPlayingMovies', () => {
    test('gets now playing movies', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await tmdbApi.getNowPlayingMovies();

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/movie/now_playing');
    });
  });

  describe('getUpcomingMovies', () => {
    test('gets upcoming movies', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await tmdbApi.getUpcomingMovies();

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/movie/upcoming');
    });
  });

  describe('getAiringTodayTVShows', () => {
    test('gets airing today TV shows', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await tmdbApi.getAiringTodayTVShows();

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/tv/airing_today');
    });
  });

  describe('search', () => {
    test('searches for content', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await tmdbApi.search('avengers');

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/search/multi');
      expect(callUrl.toString()).toContain('query=avengers');
    });
  });

  describe('transformContent', () => {
    test('transforms movie content', () => {
      const movie = {
        id: 1,
        title: 'Test Movie',
        media_type: 'movie',
        release_date: '2024-01-01',
        poster_path: '/poster.jpg',
        backdrop_path: '/backdrop.jpg',
        vote_average: 8.5,
        overview: 'Test overview',
      };

      const result = tmdbApi.transformContent(movie);

      expect(result.id).toBe(1);
      expect(result.title).toBe('Test Movie');
      expect(result.type).toBe('movie');
      expect(result.release_date).toBe('2024-01-01');
      expect(result.poster_path).toBe('/poster.jpg');
      expect(result.backdrop_path).toBe('/backdrop.jpg');
      expect(result.vote_average).toBe(8.5);
      expect(result.overview).toBe('Test overview');
    });

    test('transforms TV show content', () => {
      const tvShow = {
        id: 2,
        name: 'Test TV Show',
        media_type: 'tv',
        first_air_date: '2024-01-01',
        poster_path: '/poster.jpg',
        backdrop_path: '/backdrop.jpg',
        vote_average: 7.5,
        overview: 'Test overview',
      };

      const result = tmdbApi.transformContent(tvShow);

      expect(result.id).toBe(2);
      expect(result.title).toBe('Test TV Show');
      expect(result.type).toBe('tv');
      expect(result.release_date).toBe('2024-01-01');
      expect(result.poster_path).toBe('/poster.jpg');
      expect(result.backdrop_path).toBe('/backdrop.jpg');
      expect(result.vote_average).toBe(7.5);
      expect(result.overview).toBe('Test overview');
    });
  });

  describe('getPopularAnime', () => {
    test('gets popular anime', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await tmdbApi.getPopularAnime();

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/discover/tv');
      expect(callUrl.toString()).toContain('with_origin_country=JP');
      expect(callUrl.toString()).toContain('with_genres=16');
    });
  });

  describe('getHomePageContent', () => {
    test('fetches all homepage content', async () => {
      const mockResults = { results: [{ id: 1, title: 'Test', media_type: 'movie' }] };
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResults,
      });

      const result = await tmdbApi.getHomePageContent();

      expect(result).toHaveProperty('featured');
      expect(result).toHaveProperty('trending');
      expect(result).toHaveProperty('popularMovies');
      expect(result).toHaveProperty('popularTV');
      expect(result).toHaveProperty('topRated');
      expect(result).toHaveProperty('popularAnime');
    });
  });

  describe('searchMovies', () => {
    test('searches for movies', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await tmdbApi.searchMovies('avengers');

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/search/movie');
      expect(callUrl.toString()).toContain('query=avengers');
    });
  });

  describe('searchTVShows', () => {
    test('searches for TV shows', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await tmdbApi.searchTVShows('breaking bad');

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/search/tv');
      expect(callUrl.toString()).toContain('query=breaking%20bad');
    });
  });

  describe('getMovieDetails', () => {
    test('gets movie details with additional data', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 1 }),
      });

      await tmdbApi.getMovieDetails(1);

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/movie/1');
      expect(callUrl.toString()).toContain(
        'append_to_response=videos%2Ccredits%2Csimilar%2Crecommendations'
      );
    });
  });

  describe('getTVShowDetails', () => {
    test('gets TV show details with additional data', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 1 }),
      });

      await tmdbApi.getTVShowDetails(1);

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/tv/1');
      expect(callUrl.toString()).toContain(
        'append_to_response=videos%2Ccredits%2Csimilar%2Crecommendations'
      );
    });
  });

  describe('getTVDetails', () => {
    test('is an alias for getTVShowDetails', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 1 }),
      });

      await tmdbApi.getTVDetails(1);

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/tv/1');
    });
  });

  describe('getMovieGenres', () => {
    test('gets movie genres', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ genres: [] }),
      });

      await tmdbApi.getMovieGenres();

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/genre/movie/list');
    });
  });

  describe('getTVGenres', () => {
    test('gets TV genres', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ genres: [] }),
      });

      await tmdbApi.getTVGenres();

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/genre/tv/list');
    });
  });

  describe('discoverMovies', () => {
    test('discovers movies with filters', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await tmdbApi.discoverMovies({ year: 2024 });

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/discover/movie');
      expect(callUrl.toString()).toContain('year=2024');
    });
  });

  describe('discoverTVShows', () => {
    test('discovers TV shows with filters', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await tmdbApi.discoverTVShows({ year: 2024 });

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/discover/tv');
      expect(callUrl.toString()).toContain('year=2024');
    });
  });

  describe('getCredits', () => {
    test('gets movie credits', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ cast: [], crew: [] }),
      });

      await tmdbApi.getCredits(1, 'movie');

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/movie/1/credits');
    });

    test('gets TV credits', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ cast: [], crew: [] }),
      });

      await tmdbApi.getCredits(1, 'tv');

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/tv/1/credits');
    });
  });

  describe('getTVSeasonDetails', () => {
    test('gets TV season details', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ episodes: [] }),
      });

      await tmdbApi.getTVSeasonDetails(1, 2);

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/tv/1/season/2');
    });

    test('handles error when fetching season details', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(tmdbApi.getTVSeasonDetails(1, 2)).rejects.toThrow();
    });
  });

  describe('getTVSeasonsData', () => {
    test('gets all seasons data for a TV show', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          number_of_seasons: 2,
          number_of_episodes: 20,
          seasons: [
            { season_number: 1, episode_count: 10, name: 'Season 1', air_date: '2020-01-01' },
            { season_number: 2, episode_count: 10, name: 'Season 2', air_date: '2021-01-01' },
          ],
        }),
      });

      const result = await tmdbApi.getTVSeasonsData(1);

      expect(result).toHaveProperty('total_seasons');
      expect(result).toHaveProperty('total_episodes');
      expect(result).toHaveProperty('seasons');
    });

    test('handles error when fetching seasons data', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(tmdbApi.getTVSeasonsData(1)).rejects.toThrow();
    });
  });

  describe('advancedSearch', () => {
    test('searches with query and movie type', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await tmdbApi.advancedSearch('avengers', { type: 'movie' });

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/search/movie');
      expect(callUrl.toString()).toContain('query=avengers');
    });

    test('searches with query and TV type', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await tmdbApi.advancedSearch('breaking bad', { type: 'tv' });

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/search/tv');
    });

    test('discovers movies without query', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await tmdbApi.advancedSearch('', { type: 'movie', year: 2024 });

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/discover/movie');
      expect(callUrl.toString()).toContain('year=2024');
    });

    test('discovers TV shows without query', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await tmdbApi.advancedSearch('', { type: 'tv', year: 2024 });

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/discover/tv');
    });

    test('returns empty results when no query or filters', async () => {
      const result = await tmdbApi.advancedSearch('', {});

      expect(result).toEqual({ results: [], total_pages: 0, total_results: 0 });
    });

    test('handles error in advanced search', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(tmdbApi.advancedSearch('test', { type: 'movie' })).rejects.toThrow();
    });

    test('discovers all content without query', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await tmdbApi.advancedSearch('', { type: 'all', year: 2024 });

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/discover/movie');
    });

    test('searches with multi type (no type specified)', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await tmdbApi.advancedSearch('test');

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/search/multi');
    });

    test('adds genre filter to discover endpoint', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await tmdbApi.advancedSearch('', { type: 'movie', genre: 28 });

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('/discover/movie');
      expect(callUrl.toString()).toContain('with_genres=28');
    });

    test('adds year filter to discover endpoint', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await tmdbApi.advancedSearch('', { type: 'movie', year: 2024 });

      const callUrl = fetch.mock.calls[0][0];
      expect(callUrl.toString()).toContain('year=2024');
    });
  });
});
