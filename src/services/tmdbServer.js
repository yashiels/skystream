/**
 * Server-side TMDB API helper for generateMetadata
 * This runs on the server only (no browser APIs)
 */

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.VITE_TMDB_API_KEY || '';
const TMDB_BASE_URL =
  process.env.NEXT_PUBLIC_TMDB_BASE_URL ||
  process.env.VITE_TMDB_BASE_URL ||
  'https://api.themoviedb.org/3';

export async function fetchMovieDetails(movieId) {
  try {
    const url = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchTVDetails(tvId) {
  try {
    const url = `${TMDB_BASE_URL}/tv/${tvId}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
