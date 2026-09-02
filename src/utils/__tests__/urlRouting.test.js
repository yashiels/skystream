import {
  sanitizeForUrl,
  generateMovieUrl,
  generateTVUrl,
  parseMovieUrl,
  parseTVUrl,
  parseStreamingUrl,
  updateBrowserUrl,
  replaceBrowserUrl,
  isStreamingUrl,
} from '../urlRouting';

describe('urlRouting', () => {
  describe('sanitizeForUrl', () => {
    test('converts to lowercase', () => {
      expect(sanitizeForUrl('The Avengers')).toBe('the-avengers');
    });

    test('replaces spaces with hyphens', () => {
      expect(sanitizeForUrl('Breaking Bad')).toBe('breaking-bad');
    });

    test('removes special characters', () => {
      expect(sanitizeForUrl('Spider-Man: No Way Home')).toBe('spider-man-no-way-home');
    });

    test('removes leading and trailing hyphens', () => {
      expect(sanitizeForUrl('  test  ')).toBe('test');
    });

    test('handles multiple spaces', () => {
      expect(sanitizeForUrl('The   Quick   Brown')).toBe('the-quick-brown');
    });

    test('returns empty string for null/undefined', () => {
      expect(sanitizeForUrl(null)).toBe('');
      expect(sanitizeForUrl(undefined)).toBe('');
    });
  });

  describe('generateMovieUrl', () => {
    test('generates correct movie URL', () => {
      const content = { id: 299534, title: 'Avengers: Endgame' };
      expect(generateMovieUrl(content)).toBe('/movie/avengers-endgame-299534');
    });

    test('returns null for missing id', () => {
      const content = { title: 'Avengers: Endgame' };
      expect(generateMovieUrl(content)).toBeNull();
    });

    test('returns null for null content', () => {
      expect(generateMovieUrl(null)).toBeNull();
    });
  });

  describe('generateTVUrl', () => {
    test('generates correct TV URL with season and episode', () => {
      const content = { id: 1396, title: 'Breaking Bad' };
      expect(generateTVUrl(content, 1, 1)).toBe('/tv/breaking-bad-1396/s1/e1');
    });

    test('uses default season and episode', () => {
      const content = { id: 1396, title: 'Breaking Bad' };
      expect(generateTVUrl(content)).toBe('/tv/breaking-bad-1396/s1/e1');
    });

    test('returns null for missing id', () => {
      const content = { title: 'Breaking Bad' };
      expect(generateTVUrl(content, 1, 1)).toBeNull();
    });

    test('returns null for null content', () => {
      expect(generateTVUrl(null, 1, 1)).toBeNull();
    });
  });

  describe('parseMovieUrl', () => {
    test('parses valid movie URL', () => {
      const result = parseMovieUrl('/movie/avengers-endgame-299534');
      expect(result).toEqual({
        type: 'movie',
        slug: 'avengers-endgame',
        id: 299534,
      });
    });

    test('returns null for invalid movie URL', () => {
      expect(parseMovieUrl('/movie/invalid')).toBeNull();
    });

    test('returns null for non-movie URL', () => {
      expect(parseMovieUrl('/tv/breaking-bad-1396/s1/e1')).toBeNull();
    });
  });

  describe('parseTVUrl', () => {
    test('parses valid TV URL', () => {
      const result = parseTVUrl('/tv/breaking-bad-1396/s1/e1');
      expect(result).toEqual({
        type: 'tv',
        slug: 'breaking-bad',
        id: 1396,
        season: 1,
        episode: 1,
      });
    });

    test('parses TV URL with different season and episode', () => {
      const result = parseTVUrl('/tv/breaking-bad-1396/s5/e16');
      expect(result).toEqual({
        type: 'tv',
        slug: 'breaking-bad',
        id: 1396,
        season: 5,
        episode: 16,
      });
    });

    test('returns null for invalid TV URL', () => {
      expect(parseTVUrl('/tv/breaking-bad-1396')).toBeNull();
    });

    test('returns null for non-TV URL', () => {
      expect(parseTVUrl('/movie/avengers-endgame-299534')).toBeNull();
    });
  });

  describe('parseStreamingUrl', () => {
    test('parses movie URL', () => {
      const result = parseStreamingUrl('/movie/avengers-endgame-299534');
      expect(result?.type).toBe('movie');
      expect(result?.id).toBe(299534);
    });

    test('parses TV URL', () => {
      const result = parseStreamingUrl('/tv/breaking-bad-1396/s1/e1');
      expect(result?.type).toBe('tv');
      expect(result?.id).toBe(1396);
    });

    test('returns null for invalid URL', () => {
      expect(parseStreamingUrl('/invalid')).toBeNull();
    });
  });

  describe('updateBrowserUrl', () => {
    test('calls window.history.pushState', () => {
      const pushStateSpy = jest.spyOn(window.history, 'pushState');
      updateBrowserUrl('/movie/test-123', 'Test Movie');
      expect(pushStateSpy).toHaveBeenCalledWith(
        { url: '/movie/test-123', title: 'Test Movie' },
        'Test Movie',
        '/movie/test-123'
      );
      pushStateSpy.mockRestore();
    });
  });

  describe('replaceBrowserUrl', () => {
    test('calls window.history.replaceState', () => {
      const replaceStateSpy = jest.spyOn(window.history, 'replaceState');
      replaceBrowserUrl('/movie/test-123', 'Test Movie');
      expect(replaceStateSpy).toHaveBeenCalledWith(
        { url: '/movie/test-123', title: 'Test Movie' },
        'Test Movie',
        '/movie/test-123'
      );
      replaceStateSpy.mockRestore();
    });
  });

  describe('isStreamingUrl', () => {
    test('returns true for movie URL', () => {
      expect(isStreamingUrl('/movie/avengers-endgame-299534')).toBe(true);
    });

    test('returns true for TV URL', () => {
      expect(isStreamingUrl('/tv/breaking-bad-1396/s1/e1')).toBe(true);
    });

    test('returns false for non-streaming URL', () => {
      expect(isStreamingUrl('/')).toBe(false);
      expect(isStreamingUrl('/home')).toBe(false);
      expect(isStreamingUrl('/search')).toBe(false);
    });
  });
});
