import { TMDBApi } from '@/api';
import { API_CONFIG, utils } from '../utils/config';

const tmdbApi = new TMDBApi({
  apiKey: API_CONFIG.tmdb.apiKey,
  baseUrl: API_CONFIG.tmdb.baseUrl,
  imageBaseUrl: API_CONFIG.tmdb.imageBaseUrl,
  logger: utils,
});

export default tmdbApi;
