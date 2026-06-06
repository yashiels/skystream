/** @type {import('next').NextConfig} */
import { PLAYER_DEFAULTS } from '@skystream/shared';

const isDev = process.env.NODE_ENV === 'development';
// Derive the player origin from the single source of truth.
// Legacy .net origin kept for backwards compat with older embeds.
const videasyOrigin = new URL(PLAYER_DEFAULTS.videasyBaseUrl).origin;

const nextConfig = {
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
              `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com https://va.vercel-scripts.com https://*.vercel-scripts.com https://vercel.live`,
              "worker-src 'self'",
              "manifest-src 'self'",
              "script-src-elem 'self' 'unsafe-inline' https://www.googletagmanager.com https://va.vercel-scripts.com https://*.vercel-scripts.com https://vercel.live",
              "connect-src 'self' https:",
              `frame-src 'self' ${videasyOrigin} https://player.videasy.net`,
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
