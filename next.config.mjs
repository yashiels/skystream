/** @type {import('next').NextConfig} */
import { PLAYER_DEFAULTS } from './src/shared/index.js';

const isDev = process.env.NODE_ENV === 'development';
// Derive the player origin from the single source of truth — swapping to a
// CNAME'd custom VidSrc domain is an env change (VIDSRC_BASE_URL), not a CSP edit.
const vidsrcOrigin = new URL(PLAYER_DEFAULTS.vidsrcBaseUrl).origin;

const nextConfig = {
  // Self-hosted container runtime: emit `.next/standalone/server.js` with only
  // the traced runtime deps, so the image doesn't carry dev dependencies.
  // See Dockerfile.
  output: 'standalone',
  // Inline public env vars at build time with sensible defaults.
  env: {
    NEXT_PUBLIC_TMDB_API_KEY: process.env.NEXT_PUBLIC_TMDB_API_KEY || '',
    NEXT_PUBLIC_TMDB_BASE_URL:
      process.env.NEXT_PUBLIC_TMDB_BASE_URL || 'https://api.themoviedb.org/3',
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'SkyStream',
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '2.0.0',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com`,
              "worker-src 'self'",
              "manifest-src 'self'",
              "script-src-elem 'self' 'unsafe-inline' https://www.googletagmanager.com",
              "connect-src 'self' https:",
              `frame-src 'self' ${vidsrcOrigin}`,
              "img-src 'self' data: https: blob:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
