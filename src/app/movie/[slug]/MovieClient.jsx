'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StreamingPlayerModal from '../../../components/StreamingPlayerModal';
import { Loading } from '../../../components';
import tmdbApi from '../../../services/tmdbApi';
import streamingServices from '../../../services/streamingServices';

function parseMovieSlug(slug) {
  const match = slug.match(/-(\d+)$/);
  if (!match) return null;
  return { type: 'movie', id: parseInt(match[1], 10) };
}

export default function MovieClient({ slug, initialMovieData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(!initialMovieData);
  const [error, setError] = useState(false);
  const [playerModal, setPlayerModal] = useState({
    isOpen: false,
    content: null,
    platform: null,
    embedUrl: null,
    contentType: 'movie',
    season: null,
    episode: null,
  });

  useEffect(() => {
    const parsed = parseMovieSlug(slug);
    if (!parsed) {
      router.replace('/');
      return;
    }

    const initPlayer = async () => {
      try {
        let movieData = initialMovieData;

        // Fall back to client-side fetch only if server didn't provide data
        if (!movieData) {
          movieData = await tmdbApi.getMovieDetails(parsed.id);
        }

        if (!movieData) {
          setError(true);
          setLoading(false);
          return;
        }

        const content = tmdbApi.transformContent(movieData);
        const urls = streamingServices.getAllStreamingUrls(content, {
          season: 1,
          episode: 1,
        });

        setPlayerModal({
          isOpen: true,
          content,
          platform: 'server1',
          embedUrl: urls.server1,
          contentType: 'movie',
          season: null,
          episode: null,
        });
      } catch (err) {
        console.error('Failed to load movie:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    initPlayer();
  }, [slug, router, initialMovieData]);

  const handleClosePlayer = useCallback(() => {
    setPlayerModal({
      isOpen: false,
      content: null,
      platform: null,
      embedUrl: null,
      contentType: 'movie',
      season: null,
      episode: null,
    });
    router.push('/');
  }, [router]);

  if (loading && !playerModal.isOpen) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <Loading text="Loading movie..." />
      </div>
    );
  }

  if (error && !playerModal.isOpen) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <h3 style={{ color: 'var(--netflix-red)', marginBottom: '1rem' }}>Movie Not Found</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Unable to load this movie. It may have been removed or is temporarily unavailable.
        </p>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--netflix-red)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <StreamingPlayerModal
      isOpen={playerModal.isOpen}
      onClose={handleClosePlayer}
      content={playerModal.content}
      platform={playerModal.platform}
      embedUrl={playerModal.embedUrl}
      contentType={playerModal.contentType}
      season={playerModal.season}
      episode={playerModal.episode}
    />
  );
}
