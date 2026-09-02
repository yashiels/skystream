import { fetchTVDetails } from '../../../services/tmdbServer';
import TVClient from './TVClient';

/**
 * Parse the TV slug segments
 * Format: /tv/show-name-12345/s1/e1
 * slug array: ['show-name-12345', 's1', 'e1'] or ['show-name-12345']
 */
function parseTVSlug(slugSegments) {
  if (!slugSegments || slugSegments.length === 0) return null;

  const firstSegment = slugSegments[0];
  const match = firstSegment.match(/-(\d+)$/);
  if (!match) return null;

  const id = parseInt(match[1], 10);
  let season = 1;
  let episode = 1;

  if (slugSegments.length >= 2) {
    const seasonMatch = slugSegments[1].match(/^s(\d+)$/);
    if (seasonMatch) season = parseInt(seasonMatch[1], 10);
  }

  if (slugSegments.length >= 3) {
    const episodeMatch = slugSegments[2].match(/^e(\d+)$/);
    if (episodeMatch) episode = parseInt(episodeMatch[1], 10);
  }

  return { id, season, episode };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const parsed = parseTVSlug(slug);
  if (!parsed) {
    return { title: 'TV Show Not Found | SkyStream', robots: 'noindex' };
  }

  const tvShow = await fetchTVDetails(parsed.id);
  if (!tvShow) {
    return {
      title: 'TV Show Not Found | SkyStream',
    };
  }

  const title = `Watch ${tvShow.name} Online Free | SkyStream`;
  const description = tvShow.overview
    ? `${tvShow.overview.slice(0, 155)}...`
    : `Stream ${tvShow.name} online free in HD on SkyStream. No sign-up required.`;
  const image = tvShow.poster_path
    ? `https://image.tmdb.org/t/p/w500${tvShow.poster_path}`
    : 'https://www.sky-stream.online/LOGO.png';
  const urlPath = `/tv/${slug.join('/')}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'video.tv_show',
      url: `https://www.sky-stream.online${urlPath}`,
      images: [{ url: image }],
      siteName: 'SkyStream',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: urlPath,
    },
    other: {
      'structured-data': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TVSeries',
        name: tvShow.name,
        description: tvShow.overview,
        image,
        url: `https://www.sky-stream.online${urlPath}`,
        datePublished: tvShow.first_air_date,
        genre: tvShow.genres?.map(g => g.name),
        aggregateRating: tvShow.vote_average
          ? {
              '@type': 'AggregateRating',
              ratingValue: tvShow.vote_average.toFixed(1),
              bestRating: '10',
              ratingCount: tvShow.vote_count,
            }
          : undefined,
      }),
    },
  };
}

export default async function TVPage({ params }) {
  const { slug } = await params;
  const parsed = parseTVSlug(slug);
  let initialTVData = null;

  if (parsed) {
    initialTVData = await fetchTVDetails(parsed.id);
  }

  return <TVClient slugSegments={slug} initialTVData={initialTVData} />;
}
