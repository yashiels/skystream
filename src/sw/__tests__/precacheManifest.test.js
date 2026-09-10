import { extractStaticAssetUrls } from '../precacheManifest';

describe('extractStaticAssetUrls', () => {
  it('extracts unique static asset URLs referenced in the HTML', () => {
    const html = `
      <link rel="stylesheet" href="/_next/static/chunks/a.css">
      <script src="/_next/static/chunks/b.js"></script>
      <script src="/_next/static/chunks/b.js"></script>
    `;
    expect(extractStaticAssetUrls(html)).toEqual([
      '/_next/static/chunks/a.css',
      '/_next/static/chunks/b.js',
    ]);
  });

  it('stops at an escaped quote inside inline JSON without swallowing a trailing backslash', () => {
    const html = `<script>window.__DATA__ = {"src":"\\/_next\\/static\\/chunks\\/c.js\\"more"}</script>
      <script src="/_next/static/chunks/d.js"></script>`;
    const urls = extractStaticAssetUrls(html);
    expect(urls).toContain('/_next/static/chunks/d.js');
    for (const url of urls) {
      expect(url).not.toMatch(/\\/);
    }
  });

  it('returns an empty list when there are no static asset references', () => {
    expect(extractStaticAssetUrls('<html><body>Offline</body></html>')).toEqual([]);
  });
});
