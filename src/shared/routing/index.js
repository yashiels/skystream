export const sanitizeForUrl = str => {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateMovieUrl = content => {
  if (!content || !content.id) return null;
  const slug = sanitizeForUrl(content.title);
  return `/movie/${slug}-${content.id}`;
};

export const generateTVUrl = (content, season = 1, episode = 1) => {
  if (!content || !content.id) return null;
  const slug = sanitizeForUrl(content.title);
  return `/tv/${slug}-${content.id}/s${season}/e${episode}`;
};

export const parseMovieUrl = pathname => {
  const match = pathname.match(/^\/movie\/(.+)-(\d+)$/);
  if (!match) return null;

  return {
    type: 'movie',
    slug: match[1],
    id: parseInt(match[2], 10),
  };
};

export const parseTVUrl = pathname => {
  const match = pathname.match(/^\/tv\/(.+)-(\d+)\/s(\d+)\/e(\d+)$/);
  if (!match) return null;

  return {
    type: 'tv',
    slug: match[1],
    id: parseInt(match[2], 10),
    season: parseInt(match[3], 10),
    episode: parseInt(match[4], 10),
  };
};

export const parseStreamingUrl = pathname => {
  return parseMovieUrl(pathname) || parseTVUrl(pathname);
};

export const isStreamingUrl = pathname => {
  return /^\/movie\/|^\/tv\//.test(pathname);
};
