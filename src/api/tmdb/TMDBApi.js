class TMDBApi {
  constructor({
    apiKey = '',
    baseUrl = 'https://api.themoviedb.org/3',
    imageBaseUrl = 'https://image.tmdb.org/t/p',
    logger = null,
  } = {}) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.imageBaseUrl = imageBaseUrl;
    this._genreCache = {};
    this._genreCacheTime = {};
    this._logger = logger || {
      log: () => {},
      error: () => {},
      warn: () => {},
    };
  }

  async makeRequest(endpoint, params = {}) {
    try {
      const allParams = { api_key: this.apiKey, ...params };
      const query = Object.entries(allParams)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      const url = `${this.baseUrl}${endpoint}?${query}`;

      this._logger.log('TMDB API Request:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      this._logger.error('TMDB API Request failed:', error);
      throw error;
    }
  }

  async getTrending(mediaType = 'all', timeWindow = 'week') {
    return this.makeRequest(`/trending/${mediaType}/${timeWindow}`);
  }

  async getPopularMovies(page = 1) {
    return this.makeRequest('/movie/popular', { page });
  }

  async getPopularTVShows(page = 1) {
    return this.makeRequest('/tv/popular', { page });
  }

  async getTopRatedMovies(page = 1) {
    return this.makeRequest('/movie/top_rated', { page });
  }

  async getTopRatedTVShows(page = 1) {
    return this.makeRequest('/tv/top_rated', { page });
  }

  async getNowPlayingMovies(page = 1) {
    return this.makeRequest('/movie/now_playing', { page });
  }

  async getUpcomingMovies(page = 1) {
    return this.makeRequest('/movie/upcoming', { page });
  }

  async getAiringTodayTVShows(page = 1) {
    return this.makeRequest('/tv/airing_today', { page });
  }

  async getOnTheAirTVShows(page = 1) {
    return this.makeRequest('/tv/on_the_air', { page });
  }

  async search(query, page = 1) {
    return this.makeRequest('/search/multi', { query, page });
  }

  async advancedSearch(query, filters = {}, page = 1) {
    const { type, genre, year, rating, sortBy } = filters;

    if (!query && !genre && !year && !rating) {
      return { results: [], total_pages: 0, total_results: 0 };
    }

    let endpoint;
    let params = { page };

    if (query) {
      if (type === 'movie') {
        endpoint = '/search/movie';
      } else if (type === 'tv') {
        endpoint = '/search/tv';
      } else {
        endpoint = '/search/multi';
      }
      params.query = query;
    } else {
      if (type === 'movie' || type === 'all') {
        endpoint = '/discover/movie';
      } else if (type === 'tv') {
        endpoint = '/discover/tv';
      } else if (type === 'anime') {
        endpoint = '/discover/tv';
        const genres = await this._getGenresCached('tv');
        const animationGenre = genres.genres.find(g => g.name === 'Animation');
        if (animationGenre) {
          params.with_genres = animationGenre.id;
          params.with_origin_country = 'JP';
        }
      } else {
        endpoint = '/discover/movie';
      }
    }

    if (genre) {
      if (!endpoint.includes('/search/')) {
        params.with_genres = genre;
      }
    }

    if (year) {
      if (endpoint.includes('movie')) {
        params.year = year;
      } else if (endpoint.includes('tv')) {
        params.first_air_date_year = year;
      }
    }

    if (rating) {
      const [minRating, maxRating] = rating.split('-').map(Number);
      if (!Number.isNaN(minRating)) {
        params['vote_average.gte'] = minRating;
      }
      if (!Number.isNaN(maxRating)) {
        params['vote_average.lte'] = maxRating;
      }
    }

    if (sortBy && endpoint.includes('/discover/')) {
      params.sort_by = sortBy;
    }

    try {
      const results = await this.makeRequest(endpoint, params);

      if (endpoint.includes('/search/') && genre) {
        results.results = results.results.filter(item => {
          return item.genre_ids && item.genre_ids.includes(Number.parseInt(genre, 10));
        });
      }

      if (endpoint === '/search/multi') {
        results.results = results.results.filter(item => item.media_type !== 'person');
      }

      if (endpoint === '/search/multi' && type !== 'all') {
        results.results = results.results.filter(item => {
          if (type === 'anime') {
            return (
              item.media_type === 'tv' &&
              item.genre_ids &&
              item.genre_ids.includes(16) &&
              item.origin_country &&
              item.origin_country.includes('JP')
            );
          }
          return item.media_type === type;
        });
      }

      return results;
    } catch (error) {
      this._logger.error('Advanced search failed:', error);
      throw error;
    }
  }

  async searchMovies(query, page = 1) {
    return this.makeRequest('/search/movie', { query, page });
  }

  async searchTVShows(query, page = 1) {
    return this.makeRequest('/search/tv', { query, page });
  }

  async getMovieDetails(movieId) {
    return this.makeRequest(`/movie/${movieId}`, {
      append_to_response: 'videos,credits,similar,recommendations',
    });
  }

  async getTVShowDetails(tvId) {
    return this.makeRequest(`/tv/${tvId}`, {
      append_to_response: 'videos,credits,similar,recommendations',
    });
  }

  async getTVDetails(tvId) {
    return this.getTVShowDetails(tvId);
  }

  async getTVSeasonDetails(tvId, seasonNumber) {
    try {
      return await this.makeRequest(`/tv/${tvId}/season/${seasonNumber}`);
    } catch (error) {
      this._logger.error(`Failed to get season ${seasonNumber} details for TV ID ${tvId}:`, error);
      throw error;
    }
  }

  async getTVSeasonsData(tvId) {
    try {
      const tvDetails = await this.getTVDetails(tvId);
      const seasonsData = [];

      if (tvDetails.seasons) {
        for (const season of tvDetails.seasons) {
          if (season.season_number === 0 && season.episode_count === 0) {
            continue;
          }

          seasonsData.push({
            season_number: season.season_number,
            episode_count: season.episode_count,
            name: season.name,
            air_date: season.air_date,
          });
        }
      }

      return {
        total_seasons: tvDetails.number_of_seasons,
        total_episodes: tvDetails.number_of_episodes,
        seasons: seasonsData,
      };
    } catch (error) {
      this._logger.error(`Failed to get seasons data for TV ID ${tvId}:`, error);
      throw error;
    }
  }

  async getCredits(contentId, contentType) {
    const endpoint =
      contentType === 'movie' ? `/movie/${contentId}/credits` : `/tv/${contentId}/credits`;
    return this.makeRequest(endpoint);
  }

  async _getGenresCached(type) {
    const now = Date.now();
    if (this._genreCache[type] && now - this._genreCacheTime[type] < 3_600_000) {
      return this._genreCache[type];
    }
    const result = type === 'tv' ? await this.getTVGenres() : await this.getMovieGenres();
    this._genreCache[type] = result;
    this._genreCacheTime[type] = now;
    return result;
  }

  async getMovieGenres() {
    return this.makeRequest('/genre/movie/list');
  }

  async getTVGenres() {
    return this.makeRequest('/genre/tv/list');
  }

  async discoverMovies(params = {}) {
    return this.makeRequest('/discover/movie', params);
  }

  async discoverTVShows(params = {}) {
    return this.makeRequest('/discover/tv', params);
  }

  async getAnimeContent(page = 1) {
    const genres = await this._getGenresCached('tv');
    const animationGenre = genres.genres.find(g => g.name === 'Animation');

    if (!animationGenre) {
      return { results: [], total_pages: 0, total_results: 0 };
    }

    return this.makeRequest('/discover/tv', {
      with_genres: animationGenre.id,
      with_origin_country: 'JP',
      sort_by: 'popularity.desc',
      page,
    });
  }

  transformContent(item) {
    const isMovie = item.media_type === 'movie' || item.title;
    const isTVShow = item.media_type === 'tv' || item.name;

    return {
      id: item.id,
      title: item.title || item.name,
      name: item.name || item.title,
      overview: item.overview,
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      release_date: item.release_date || item.first_air_date,
      first_air_date: item.first_air_date || item.release_date,
      vote_average: item.vote_average,
      vote_count: item.vote_count,
      popularity: item.popularity,
      genre_ids: item.genre_ids,
      adult: item.adult,
      original_language: item.original_language,
      original_title: item.original_title || item.original_name,
      original_name: item.original_name || item.original_title,
      videos: item.videos?.results || [],
      type: isMovie ? 'movie' : isTVShow ? 'tv' : 'unknown',
      media_type: item.media_type || (isMovie ? 'movie' : 'tv'),
    };
  }

  async getPopularAnime() {
    try {
      const response = await this.makeRequest('/discover/tv', {
        with_origin_country: 'JP',
        with_genres: '16',
        sort_by: 'popularity.desc',
        page: 1,
      });
      return response;
    } catch (error) {
      this._logger.error('Failed to fetch popular anime:', error);
      throw error;
    }
  }

  async getHomePageContent() {
    const [trending, popularMovies, popularTV, topRatedMovies, popularAnime] =
      await Promise.allSettled([
        this.getTrending('all', 'week'),
        this.getPopularMovies(),
        this.getPopularTVShows(),
        this.getTopRatedMovies(),
        this.getPopularAnime(),
      ]);

    const pick = result => (result.status === 'fulfilled' ? (result.value.results ?? []) : []);

    const trendingResults = pick(trending);

    return {
      featured: trendingResults.slice(0, 5).map(item => this.transformContent(item)),
      trending: trendingResults.slice(0, 20).map(item => this.transformContent(item)),
      popularMovies: pick(popularMovies)
        .slice(0, 20)
        .map(item => this.transformContent(item)),
      popularTV: pick(popularTV)
        .slice(0, 20)
        .map(item => this.transformContent(item)),
      topRated: pick(topRatedMovies)
        .slice(0, 20)
        .map(item => this.transformContent(item)),
      popularAnime: pick(popularAnime)
        .slice(0, 20)
        .map(item => this.transformContent(item)),
    };
  }
}

export { TMDBApi };
export default TMDBApi;
