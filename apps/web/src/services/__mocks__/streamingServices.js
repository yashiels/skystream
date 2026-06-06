import { PLAYER_DEFAULTS } from '@skystream/shared';

const BASE = PLAYER_DEFAULTS.videasyBaseUrl;

const streamingServices = {
  getStreamingUrl: jest.fn(
    (content, options = {}) =>
      `${BASE}/${content.type}/${content.id}${content.type === 'tv' ? `/${options.season || 1}/${options.episode || 1}` : ''}`
  ),
  getAllStreamingUrls: jest.fn(content => ({
    server1: `${BASE}/${content.type}/${content.id}`,
    videasy: `${BASE}/${content.type}/${content.id}`,
    vidsrc: `${BASE}/${content.type}/${content.id}`,
  })),
  getMovieUrl: jest.fn(id => `${BASE}/movie/${id}`),
  getVideasyMovieUrl: jest.fn(id => `${BASE}/movie/${id}`),
  getTVUrl: jest.fn((id, season, episode) => `${BASE}/tv/${id}/${season}/${episode}`),
  getVideasyTVUrl: jest.fn((id, season, episode) => `${BASE}/tv/${id}/${season}/${episode}`),
};

export default streamingServices;
