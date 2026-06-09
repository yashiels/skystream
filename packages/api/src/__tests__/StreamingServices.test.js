import streamingServices from '../streaming/StreamingServices.js';
import { PLAYER_DEFAULTS } from '@skystream/shared';

const BASE = PLAYER_DEFAULTS.playerBaseUrl;

describe('StreamingServices (VidLink)', () => {
  describe('getMovieUrl', () => {
    it('generates a movie URL with default options', () => {
      const url = streamingServices.getMovieUrl(550);
      expect(url).toContain(`${BASE}/movie/550`);
      expect(url).toContain('primaryColor=e50914');
      expect(url).toContain('poster=true');
      expect(url).toContain('title=true');
      // Videasy overlay param must not bleed through
      expect(url).not.toContain('overlay=');
    });

    it('accepts custom color (legacy param) and progress', () => {
      const url = streamingServices.getMovieUrl(550, { color: '3B82F6', progress: 120 });
      expect(url).toContain('primaryColor=3B82F6');
      expect(url).toContain('progress=120');
    });

    it('prefers explicit primaryColor over legacy color', () => {
      const url = streamingServices.getMovieUrl(550, { primaryColor: 'FF0000', color: '3B82F6' });
      expect(url).toContain('primaryColor=FF0000');
      expect(url).not.toContain('primaryColor=3B82F6');
    });
  });

  describe('getTVUrl', () => {
    it('generates a TV URL with season and episode', () => {
      const url = streamingServices.getTVUrl(1399, 2, 5);
      expect(url).toContain(`${BASE}/tv/1399/2/5`);
      expect(url).toContain('nextbutton=true');
      expect(url).toContain('poster=true');
      expect(url).toContain('title=true');
      // Removed Videasy-only params
      expect(url).not.toContain('episodeSelector=');
      expect(url).not.toContain('autoplayNextEpisode=');
      expect(url).not.toContain('overlay=');
    });

    it('defaults to season 1 episode 1', () => {
      const url = streamingServices.getTVUrl(1399);
      expect(url).toContain('/tv/1399/1/1');
    });

    it('supports explicit nextbutton param', () => {
      const url = streamingServices.getTVUrl(1399, 1, 1, { nextbutton: false });
      expect(url).not.toContain('nextbutton=');
    });
  });

  describe('getAnimeUrl', () => {
    it('generates an anime URL with episode (defaults to sub)', () => {
      const url = streamingServices.getAnimeUrl(21, 5);
      expect(url).toContain(`${BASE}/anime/21/5/sub`);
    });

    it('supports dub option (backward-compat boolean)', () => {
      const url = streamingServices.getAnimeUrl(21, 1, { dub: true });
      expect(url).toContain('/dub');
      expect(url).not.toContain('/sub');
    });

    it('supports explicit subOrDub path segment', () => {
      const url = streamingServices.getAnimeUrl(21, 1, { subOrDub: 'dub' });
      expect(url).toContain('/dub');
    });

    it('generates anime movie URL (no episode)', () => {
      const url = streamingServices.getAnimeUrl(145139, 0);
      expect(url).toContain(`${BASE}/anime/145139`);
      expect(url).not.toContain('/0');
      // Sub/dub segment still present
      expect(url).toMatch(/\/(sub|dub)$/);
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
    it('returns VidLink URL with legacy aliases for a movie', () => {
      const urls = streamingServices.getAllStreamingUrls({ id: 550, type: 'movie' });

      expect(urls.server1).toContain(`${BASE}/movie/550`);
      expect(urls.vidlink).toBe(urls.server1);
      // Legacy aliases still present for backward compat
      expect(urls.videasy).toBe(urls.server1);
      expect(urls.vidsrc).toBe(urls.server1);
    });

    it('returns VidLink URL with season/episode for TV', () => {
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
