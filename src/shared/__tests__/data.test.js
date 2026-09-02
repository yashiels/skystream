import { describe, it, expect } from '@jest/globals';
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  getCountryByCode,
  getCountryName,
  getCountryFlag,
  CATEGORIES,
  DEFAULT_CATEGORY,
  getCategoryByCode,
  getCategoryName,
  getCategoryIcon,
} from '../data/index.js';

describe('shared data', () => {
  describe('countries', () => {
    it('COUNTRIES is a non-empty array', () => {
      expect(Array.isArray(COUNTRIES)).toBe(true);
      expect(COUNTRIES.length).toBeGreaterThan(0);
    });

    it('DEFAULT_COUNTRY is "za" and exists in COUNTRIES', () => {
      expect(DEFAULT_COUNTRY).toBe('za');
      expect(getCountryByCode(DEFAULT_COUNTRY)).toBeDefined();
    });

    it('getCountryByCode returns the full country record', () => {
      expect(getCountryByCode('us')).toEqual({
        code: 'us',
        name: 'United States',
        flag: '🇺🇸',
      });
    });

    it('getCountryName returns the name, or "Unknown" for an unknown code', () => {
      expect(getCountryName('za')).toBe('South Africa');
      expect(getCountryName('zz')).toBe('Unknown');
    });

    it('getCountryFlag returns the flag, or the globe fallback', () => {
      expect(getCountryFlag('us')).toBe('🇺🇸');
      expect(getCountryFlag('zz')).toBe('🌍');
    });
  });

  describe('categories', () => {
    it('CATEGORIES is a non-empty array', () => {
      expect(Array.isArray(CATEGORIES)).toBe(true);
      expect(CATEGORIES.length).toBeGreaterThan(0);
    });

    it('DEFAULT_CATEGORY is "all-channels" and exists in CATEGORIES', () => {
      expect(DEFAULT_CATEGORY).toBe('all-channels');
      expect(getCategoryByCode(DEFAULT_CATEGORY)).toBeDefined();
    });

    it('getCategoryByCode returns the matching category', () => {
      expect(getCategoryByCode('news')).toMatchObject({ code: 'news', name: 'News' });
    });

    it('getCategoryName returns the name, or "Unknown" for an unknown code', () => {
      expect(getCategoryName('sports')).toBe('Sports');
      expect(getCategoryName('nope')).toBe('Unknown');
    });

    it('getCategoryIcon returns the icon, or the tv fallback', () => {
      expect(getCategoryIcon('news')).toBe('📰');
      expect(getCategoryIcon('nope')).toBe('📺');
    });
  });
});
