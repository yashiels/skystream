const NEXT_STATIC_ASSET_PATTERN = /\/_next\/static\/[^"'\s)\\]+/g;

export const extractStaticAssetUrls = html => {
  const matches = html.match(NEXT_STATIC_ASSET_PATTERN) ?? [];
  return Array.from(new Set(matches));
};

export const buildOfflinePrecacheEntries = ({ offlineUrl, offlineHtml, offlineRevision, hashAsset }) => {
  const assetEntries = extractStaticAssetUrls(offlineHtml).map(url => ({ url, revision: hashAsset(url) }));
  return [...assetEntries, { url: offlineUrl, revision: offlineRevision }];
};
