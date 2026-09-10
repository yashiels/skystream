import { createHash } from 'node:crypto';
import { readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { injectManifest } from '@serwist/build';
import esbuild from 'esbuild';
import { PLAYER_DEFAULTS } from '../src/shared/index.js';
import { buildOfflinePrecacheEntries } from '../src/sw/precacheManifest.js';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const nextDir = path.join(rootDir, '.next');
const publicDir = path.join(rootDir, 'public');
const swSrc = path.join(rootDir, 'src', 'sw', 'sw.js');
const swBundle = path.join(nextDir, 'sw-bundle.js');
const swDest = path.join(publicDir, 'sw.js');
const offlineHtmlPath = path.join(nextDir, 'server', 'app', 'offline.html');

const hashContent = content => createHash('sha1').update(content).digest('hex').slice(0, 16);

const hashAsset = async url => {
  const filePath = path.join(nextDir, url.replace(/^\/_next\//, ''));
  const content = await readFile(filePath);
  return hashContent(content);
};

const main = async () => {
  const vidsrcOrigin = new URL(PLAYER_DEFAULTS.vidsrcBaseUrl).origin;
  const offlineHtml = await readFile(offlineHtmlPath, 'utf8');

  const assetUrls = [...offlineHtml.matchAll(/\/_next\/static\/[^"'\s)\\]+/g)].map(match => match[0]);
  const uniqueAssetUrls = Array.from(new Set(assetUrls));
  const assetHashes = await Promise.all(uniqueAssetUrls.map(hashAsset));
  const hashByUrl = new Map(uniqueAssetUrls.map((url, index) => [url, assetHashes[index]]));

  const additionalPrecacheEntries = buildOfflinePrecacheEntries({
    offlineUrl: '/offline',
    offlineHtml,
    offlineRevision: hashContent(offlineHtml),
    hashAsset: url => hashByUrl.get(url),
  });

  await esbuild.build({
    entryPoints: [swSrc],
    outfile: swBundle,
    bundle: true,
    format: 'iife',
    target: 'es2020',
    minifyWhitespace: true,
    minifySyntax: true,
    legalComments: 'none',
    define: {
      __VIDSRC_ORIGIN__: JSON.stringify(vidsrcOrigin),
    },
  });

  const { count, size } = await injectManifest({
    swSrc: swBundle,
    swDest,
    globDirectory: publicDir,
    globPatterns: [],
    additionalPrecacheEntries,
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
  });

  await rm(swBundle, { force: true });

  console.log(`[build-sw] wrote ${path.relative(rootDir, swDest)}: ${count} precached URLs, ${size} bytes`);
};

main().catch(error => {
  console.error('[build-sw] failed:', error);
  process.exitCode = 1;
});
