const tmdbApi = {
  search: jest.fn(),
  transformContent: jest.fn(),
  getTrending: jest.fn(),
  getPopularMovies: jest.fn(),
  getPopularTVShows: jest.fn(),
  getTopRated: jest.fn(),
};

export default tmdbApi;
