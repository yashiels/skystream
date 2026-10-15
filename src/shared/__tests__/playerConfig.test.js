import { execFileSync } from 'node:child_process';

describe('VidSrc provider configuration', () => {
  const originalBaseUrl = process.env.NEXT_PUBLIC_VIDSRC_BASE_URL;

  afterEach(() => {
    if (originalBaseUrl === undefined) {
      delete process.env.NEXT_PUBLIC_VIDSRC_BASE_URL;
    } else {
      process.env.NEXT_PUBLIC_VIDSRC_BASE_URL = originalBaseUrl;
    }
    jest.resetModules();
  });

  it.each([
    ['unset', undefined, 'https://vidsrc.sh'],
    ['empty', '', 'https://vidsrc.sh'],
    ['custom', 'https://player.example:8443', 'https://player.example:8443'],
  ])('keeps %s configuration consistent across URLs and CSP', (_, override, expectedBaseUrl) => {
    if (override === undefined) {
      delete process.env.NEXT_PUBLIC_VIDSRC_BASE_URL;
    } else {
      process.env.NEXT_PUBLIC_VIDSRC_BASE_URL = override;
    }

    jest.isolateModules(() => {
      const { PLAYER_DEFAULTS } = require('../config/index.js');
      const streamingServices = require('@/api/streaming/StreamingServices.js').default;
      const { PLAYER_CONFIG, utils } = require('@/utils/config.js');

      expect(PLAYER_DEFAULTS.vidsrcBaseUrl).toBe(expectedBaseUrl);
      expect(PLAYER_CONFIG.vidsrc.baseUrl).toBe(expectedBaseUrl);
      expect(streamingServices.getMovieUrl(9928)).toBe(
        `${expectedBaseUrl}/embed/movie/9928?autoplay=1`
      );
      expect(utils.generatePlayerUrl('vidsrc', 9928, 'movie')).toBe(
        `${expectedBaseUrl}/embed/movie/9928?autoplay=1`
      );
    });

    const headers = JSON.parse(
      execFileSync(
        process.execPath,
        [
          '--input-type=module',
          '-e',
          "import config from './next.config.mjs'; console.log(JSON.stringify(await config.headers()));",
        ],
        { cwd: process.cwd(), env: process.env, encoding: 'utf8' }
      )
    );
    const csp = headers
      .find(route => route.source === '/(.*)')
      .headers.find(header => header.key === 'Content-Security-Policy').value;

    expect(csp.split('; ')).toContain(`frame-src 'self' ${new URL(expectedBaseUrl).origin}`);
  });
});
