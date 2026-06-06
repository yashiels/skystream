import streamingServices from '../streaming/StreamingServices.js';

describe('StreamingServices (Videasy)', () => {
  describe('getMovieUrl', () => {
    it('generates a movie URL with default options', () => {
      const url = streamingServices.getMovieUrl(550);
      expect(url).toContain('player.videasy.to/movie/550');
      expect(url).toContain('color=e50914');
      expect(url).toContain('overlay=true');
    });

    it('accepts custom color and progress', () => {
      const url = streamingServices.getMovieUrl(550, { color: '3B82F6', progress: 120 });
      expect(url).toContain('color=3B82F6');
      expect(url).toContain('progress=120');
    });
  });

  describe('getTVUrl', () => {
    it('generates a TV URL with season and episode', () => {
      const url = streamingServices.getTVUrl(1399, 2, 5);
      expect(url).toContain('player.videasy.to/tv/1399/2/5');
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
    it('generates an anime URL with episode', () => {
      const url = streamingServices.getAnimeUrl(21, 5);
      expect(url).toContain('player.videasy.to/anime/21/5');
    });

    it('supports dub option', () => {
      const url = streamingServices.getAnimeUrl(21, 1, { dub: true });
      expect(url).toContain('dub=true');
    });

    it('generates anime movie URL (no episode)', () => {
      const url = streamingServices.getAnimeUrl(145139, 0);
      expect(url).toContain('player.videasy.to/anime/145139');
      expect(url).not.toContain('/0');
    });
  });

  describe('getStreamingUrl', () => {
    it('returns movie URL for movie content', () => {
      const url = streamingServices.getStreamingUrl({ id: 550, type: 'movie' });
      expect(url).toContain('/movie/550');
    });

    it('returns TV URL for tv content with season/episode', () => {
      const url = streamingServices.getStreamingUrl(
        { id: 1399, type: 'tv' },
        { season: 3, episode: 9 }
      );
      expect(url).toContain('/tv/1399/3/9');
    });

    it('returns null for unknown content type', () => {
      const url = streamingServices.getStreamingUrl({ id: 1, type: 'podcast' });
      expect(url).toBeNull();
    });
  });

  describe('getAllStreamingUrls', () => {
    it('returns Videasy URL with legacy aliases for a movie', () => {
      const urls = streamingServices.getAllStreamingUrls({ id: 550, type: 'movie' });

      expect(urls.server1).toContain('player.videasy.to/movie/550');
      expect(urls.videasy).toBe(urls.server1);
      expect(urls.vidsrc).toBe(urls.server1);
    });

    it('returns Videasy URL with season/episode for TV', () => {
      const urls = streamingServices.getAllStreamingUrls(
        { id: 1399, type: 'tv' },
        { season: 1, episode: 1 }
      );

      expect(urls.server1).toContain('/tv/1399/1/1');
    });
  });

  describe('legacy aliases', () => {
    it('getVideasyMovieUrl maps to getMovieUrl', () => {
      expect(streamingServices.getVideasyMovieUrl(550)).toBe(streamingServices.getMovieUrl(550));
    });

    it('getVideasyTVUrl maps to getTVUrl', () => {
      expect(streamingServices.getVideasyTVUrl(1399, 1, 1)).toBe(
        streamingServices.getTVUrl(1399, 1, 1)
      );
    });
  });
});
