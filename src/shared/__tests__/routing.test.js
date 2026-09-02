import { describe, it, expect } from '@jest/globals';
import {
  sanitizeForUrl,
  generateMovieUrl,
  generateTVUrl,
  parseMovieUrl,
  parseTVUrl,
  parseStreamingUrl,
  isStreamingUrl,
} from '../routing/index.js';

describe('shared routing', () => {
  describe('sanitizeForUrl', () => {
    it('lowercases and hyphenates a normal title', () => {
      expect(sanitizeForUrl('The Matrix')).toBe('the-matrix');
    });

    it('returns an empty string for falsy input', () => {
      expect(sanitizeForUrl('')).toBe('');
      expect(sanitizeForUrl(null)).toBe('');
      expect(sanitizeForUrl(undefined)).toBe('');
    });

    it('strips special characters', () => {
      expect(sanitizeForUrl('Spider-Man: No Way Home!')).toBe('spider-man-no-way-home');
    });

    it('collapses multiple dashes and trims leading/trailing dashes', () => {
      expect(sanitizeForUrl('  --Hello---World--  ')).toBe('hello-world');
    });
  });

  describe('generateMovieUrl', () => {
    it('builds /movie/slug-id', () => {
      expect(generateMovieUrl({ id: 550, title: 'Fight Club' })).toBe('/movie/fight-club-550');
    });

    it('returns null when content is missing or has no id', () => {
      expect(generateMovieUrl(null)).toBeNull();
      expect(generateMovieUrl({ title: 'No Id' })).toBeNull();
    });
  });

  describe('generateTVUrl', () => {
    it('builds /tv/slug-id/sX/eY with default season/episode', () => {
      expect(generateTVUrl({ id: 1399, title: 'Game of Thrones' })).toBe(
        '/tv/game-of-thrones-1399/s1/e1'
      );
    });

    it('honours a custom season and episode', () => {
      expect(generateTVUrl({ id: 1399, title: 'Game of Thrones' }, 2, 7)).toBe(
        '/tv/game-of-thrones-1399/s2/e7'
      );
    });

    it('returns null when content is missing or has no id', () => {
      expect(generateTVUrl(null)).toBeNull();
      expect(generateTVUrl({ title: 'No Id' })).toBeNull();
    });
  });

  describe('parseMovieUrl', () => {
    it('round-trips with generateMovieUrl', () => {
      const content = { id: 550, title: 'Fight Club' };
      expect(parseMovieUrl(generateMovieUrl(content))).toEqual({
        type: 'movie',
        slug: 'fight-club',
        id: 550,
      });
    });

    it('returns null for a non-movie path', () => {
      expect(parseMovieUrl('/tv/game-of-thrones-1399/s1/e1')).toBeNull();
    });
  });

  describe('parseTVUrl', () => {
    it('round-trips with generateTVUrl', () => {
      const content = { id: 1399, title: 'Game of Thrones' };
      expect(parseTVUrl(generateTVUrl(content, 2, 7))).toEqual({
        type: 'tv',
        slug: 'game-of-thrones',
        id: 1399,
        season: 2,
        episode: 7,
      });
    });

    it('returns null for a non-tv path', () => {
      expect(parseTVUrl('/movie/fight-club-550')).toBeNull();
    });
  });

  describe('parseStreamingUrl / isStreamingUrl', () => {
    it('parseStreamingUrl resolves both movie and tv URLs', () => {
      expect(parseStreamingUrl('/movie/fight-club-550').type).toBe('movie');
      expect(parseStreamingUrl('/tv/game-of-thrones-1399/s1/e1').type).toBe('tv');
    });

    it('parseStreamingUrl returns null for unrelated paths', () => {
      expect(parseStreamingUrl('/about')).toBeNull();
    });

    it('isStreamingUrl detects /movie/ and /tv/ prefixes', () => {
      expect(isStreamingUrl('/movie/x-1')).toBe(true);
      expect(isStreamingUrl('/tv/x-1/s1/e1')).toBe(true);
      expect(isStreamingUrl('/search')).toBe(false);
    });
  });
});
