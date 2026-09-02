import { PLAYER_DEFAULTS } from '@/shared';

const BASE = PLAYER_DEFAULTS.vidsrcBaseUrl;

const streamingServices = {
  getStreamingUrl: jest.fn(
    (content, options = {}) =>
      `${BASE}/embed/${content.type}/${content.id}${content.type === 'tv' ? `/${options.season || 1}/${options.episode || 1}` : ''}`
  ),
  getAllStreamingUrls: jest.fn(content => ({
    server1: `${BASE}/embed/${content.type}/${content.id}`,
    vidsrc: `${BASE}/embed/${content.type}/${content.id}`,
  })),
  getMovieUrl: jest.fn(id => `${BASE}/embed/movie/${id}`),
  getTVUrl: jest.fn((id, season, episode) => `${BASE}/embed/tv/${id}/${season}/${episode}`),
};

export default streamingServices;
