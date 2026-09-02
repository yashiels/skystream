import streamingServices from '../streaming/StreamingServices.js';
import { PLAYER_DEFAULTS } from '@/shared';

const BASE = PLAYER_DEFAULTS.vidsrcBaseUrl;

describe('StreamingServices (VidSrc)', () => {
  describe('getMovieUrl', () => {
    it('generates a movie URL with default options', () => {
      const url = streamingServices.getMovieUrl(550);
      expect(url).toContain(`${BASE}/embed/movie/550`);
      expect(url).toContain('autoplay=1');
    });

    it('drops the dead color/overlay params and maps progress to startAt', () => {
      const url = streamingServices.getMovieUrl(550, { startAt: 120 });
      expect(url).toContain('startAt=120');
      expect(url).not.toContain('color');
      expect(url).not.toContain('overlay');
    });

    it('respects autoplay=0', () => {
      const url = streamingServices.getMovieUrl(550, { autoplay: 0 });
      expect(url).toContain('autoplay=0');
    });
  });

  describe('getTVUrl', () => {
    it('generates a TV URL with season and episode', () => {
      const url = streamingServices.getTVUrl(1399, 2, 5);
      expect(url).toContain(`${BASE}/embed/tv/1399/2/5`);
      expect(url).toContain('autonext=1');
    });

    it('defaults to season 1 episode 1', () => {
      const url = streamingServices.getTVUrl(1399);
      expect(url).toContain('/embed/tv/1399/1/1');
    });

    it('maps progress to startAt and drops the dead episodeSelector param', () => {
      const url = streamingServices.getTVUrl(1399, 1, 1, { startAt: 90 });
      expect(url).toContain('startAt=90');
      expect(url).not.toContain('nextEpisode');
      expect(url).not.toContain('episodeSelector');
      expect(url).not.toContain('autoplayNextEpisode');
    });

    it('can disable autonext', () => {
      const url = streamingServices.getTVUrl(1399, 1, 1, { autonext: false });
      expect(url).not.toContain('autonext');
    });
  });

  describe('getStreamingUrl', () => {
    it('returns movie URL for movie content', () => {
      const url = streamingServices.getStreamingUrl({ id: 550, type: 'movie' });
      expect(url).toContain('/embed/movie/550');
    });

    it('returns TV URL for tv content with season/episode', () => {
      const url = streamingServices.getStreamingUrl(
        { id: 1399, type: 'tv' },
        { season: 3, episode: 9 }
      );
      expect(url).toContain('/embed/tv/1399/3/9');
    });

    it('returns null for unknown content type', () => {
      const url = streamingServices.getStreamingUrl({ id: 1, type: 'podcast' });
      expect(url).toBeNull();
    });

    it('returns null for anime content — no VidSrc anime endpoint', () => {
      const url = streamingServices.getStreamingUrl({ id: 21, type: 'anime' });
      expect(url).toBeNull();
    });
  });

  describe('getAllStreamingUrls', () => {
    it('returns the VidSrc URL with legacy aliases for a movie', () => {
      const urls = streamingServices.getAllStreamingUrls({ id: 550, type: 'movie' });

      expect(urls.server1).toContain(`${BASE}/embed/movie/550`);
      expect(urls.vidsrc).toBe(urls.server1);
    });

    it('returns the VidSrc URL with season/episode for TV', () => {
      const urls = streamingServices.getAllStreamingUrls(
        { id: 1399, type: 'tv' },
        { season: 1, episode: 1 }
      );

      expect(urls.server1).toContain('/embed/tv/1399/1/1');
    });
  });
});
