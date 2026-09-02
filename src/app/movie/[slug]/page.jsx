import { fetchMovieDetails } from '../../../services/tmdbServer';
import MovieClient from './MovieClient';

/**
 * Parse the slug to extract the TMDB ID
 * Format: movie-name-12345
 */
function parseMovieSlug(slug) {
  const match = slug.match(/-(\d+)$/);
  if (!match) return null;
  return parseInt(match[1], 10);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const movieId = parseMovieSlug(slug);
  if (!movieId) {
    return { title: 'Movie Not Found | SkyStream', robots: 'noindex' };
  }

  const movie = await fetchMovieDetails(movieId);
  if (!movie) {
    return {
      title: 'Movie Not Found | SkyStream',
    };
  }

  const title = `Watch ${movie.title} Online Free | SkyStream`;
  const description = movie.overview
    ? `${movie.overview.slice(0, 155)}...`
    : `Stream ${movie.title} online free in HD on SkyStream. No sign-up required.`;
  const image = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://www.sky-stream.online/LOGO.png';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'video.movie',
      url: `https://www.sky-stream.online/movie/${slug}`,
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
      canonical: `/movie/${slug}`,
    },
    other: {
      'structured-data': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Movie',
        name: movie.title,
        description: movie.overview,
        image,
        url: `https://www.sky-stream.online/movie/${slug}`,
        datePublished: movie.release_date,
        genre: movie.genres?.map(g => g.name),
        aggregateRating: movie.vote_average
          ? {
              '@type': 'AggregateRating',
              ratingValue: movie.vote_average.toFixed(1),
              bestRating: '10',
              ratingCount: movie.vote_count,
            }
          : undefined,
      }),
    },
  };
}

export default async function MoviePage({ params }) {
  const { slug } = await params;
  const movieId = parseMovieSlug(slug);
  let initialMovieData = null;

  if (movieId) {
    initialMovieData = await fetchMovieDetails(movieId);
  }

  return <MovieClient slug={slug} initialMovieData={initialMovieData} />;
}
