/**
 * useSeoMeta — Dynamic SEO meta tag injector
 *
 * Updates document.title, meta description, Open Graph, Twitter Card,
 * and JSON-LD structured data per-page without a full SSR stack.
 *
 * NOTE: For full crawlable SEO (Googlebot), migrate to Next.js App Router
 * and use generateMetadata() per route. This hook covers client-side
 * social sharing and partial bot crawling (Googlebot does execute JS).
 */

import { useEffect } from 'react';

const BASE_URL = 'https://www.sky-stream.online';
const DEFAULT_IMAGE = `${BASE_URL}/LOGO.png`;
const SITE_NAME = 'SkyStream';

/**
 * Set or create a <meta> tag by name attribute
 */
function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Set or create a <meta> tag by property attribute (Open Graph)
 */
function setMetaProperty(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Set or create a <link> tag by rel attribute
 */
function setLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Inject or update a JSON-LD script block
 */
function setJsonLd(id, data) {
  let el = document.querySelector(`script[data-seo-id="${id}"]`);
  if (!el) {
    el = document.createElement('script');
    el.setAttribute('type', 'application/ld+json');
    el.setAttribute('data-seo-id', id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/**
 * @param {object} meta
 * @param {string} meta.title       — Page title (without site name)
 * @param {string} meta.description — Meta description
 * @param {string} [meta.image]     — OG image URL (full)
 * @param {string} [meta.url]       — Canonical URL path (e.g. /movie/avengers-299534)
 * @param {'website'|'video.movie'|'video.tv_show'} [meta.type] — OG type
 * @param {object} [meta.structuredData] — Optional JSON-LD object to inject
 */
export function useSeoMeta({
  title,
  description,
  image = DEFAULT_IMAGE,
  url = '/',
  type = 'website',
  structuredData = null,
} = {}) {
  useEffect(() => {
    // Guard: DOM operations are browser-only.
    // useEffect never runs during SSR, but this makes intent explicit
    // and keeps the hook safe if the project migrates to Next.js / SSR.
    if (typeof window === 'undefined') return;

    const fullTitle = title
      ? `${title} | ${SITE_NAME}`
      : `${SITE_NAME} | Watch Free Movies & TV Shows Online`;
    const canonicalUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

    // Document title
    document.title = fullTitle;

    // Basic meta
    setMeta(
      'description',
      description || 'Watch free movies and TV shows in HD. No sign-up required.'
    );
    setLink('canonical', canonicalUrl);

    // Open Graph
    setMetaProperty('og:title', fullTitle);
    setMetaProperty('og:description', description || '');
    setMetaProperty('og:image', image);
    setMetaProperty('og:url', canonicalUrl);
    setMetaProperty('og:type', type);
    setMetaProperty('og:site_name', SITE_NAME);

    // Twitter Card
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description || '');
    setMeta('twitter:image', image);
    setMeta('twitter:card', 'summary_large_image');

    // JSON-LD
    if (structuredData) {
      setJsonLd('page-ld', structuredData);
    }
  }, [title, description, image, url, type, structuredData]);
}

/**
 * Convenience: build Movie structured data from TMDB content object
 *
 * @param {object} content — TMDB movie object
 * @param {string} canonicalUrl
 * @returns {object} JSON-LD Movie schema
 */
export function buildMovieSchema(content, canonicalUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: content.title,
    description: content.overview,
    image: content.poster_path
      ? `https://image.tmdb.org/t/p/w500${content.poster_path}`
      : DEFAULT_IMAGE,
    url: canonicalUrl,
    datePublished: content.release_date,
    genre: content.genres?.map(g => g.name),
    aggregateRating: content.vote_average
      ? {
          '@type': 'AggregateRating',
          ratingValue: content.vote_average.toFixed(1),
          bestRating: '10',
          ratingCount: content.vote_count,
        }
      : undefined,
  };
}

/**
 * Convenience: build TVSeries structured data from TMDB content object
 *
 * @param {object} content — TMDB TV series object
 * @param {string} canonicalUrl
 * @returns {object} JSON-LD TVSeries schema
 */
export function buildTVSeriesSchema(content, canonicalUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: content.name,
    description: content.overview,
    image: content.poster_path
      ? `https://image.tmdb.org/t/p/w500${content.poster_path}`
      : DEFAULT_IMAGE,
    url: canonicalUrl,
    datePublished: content.first_air_date,
    genre: content.genres?.map(g => g.name),
    aggregateRating: content.vote_average
      ? {
          '@type': 'AggregateRating',
          ratingValue: content.vote_average.toFixed(1),
          bestRating: '10',
          ratingCount: content.vote_count,
        }
      : undefined,
  };
}

export default useSeoMeta;
