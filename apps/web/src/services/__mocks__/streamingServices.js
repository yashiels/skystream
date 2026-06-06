const streamingServices = {
  getStreamingUrl: jest.fn(
    (content, options = {}) =>
      `https://player.videasy.to/${content.type}/${content.id}${content.type === 'tv' ? `/${options.season || 1}/${options.episode || 1}` : ''}`
  ),
  getAllStreamingUrls: jest.fn(content => ({
    server1: `https://player.videasy.to/${content.type}/${content.id}`,
    videasy: `https://player.videasy.to/${content.type}/${content.id}`,
    vidsrc: `https://player.videasy.to/${content.type}/${content.id}`,
  })),
  getMovieUrl: jest.fn(id => `https://player.videasy.to/movie/${id}`),
  getVideasyMovieUrl: jest.fn(id => `https://player.videasy.to/movie/${id}`),
  getTVUrl: jest.fn(
    (id, season, episode) => `https://player.videasy.to/tv/${id}/${season}/${episode}`
  ),
  getVideasyTVUrl: jest.fn(
    (id, season, episode) => `https://player.videasy.to/tv/${id}/${season}/${episode}`
  ),
};

export default streamingServices;
