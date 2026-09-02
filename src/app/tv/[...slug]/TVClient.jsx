'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StreamingPlayerModal from '../../../components/StreamingPlayerModal';
import { Loading } from '../../../components';
import tmdbApi from '../../../services/tmdbApi';
import streamingServices from '../../../services/streamingServices';

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

  return { type: 'tv', id, season, episode };
}

export default function TVClient({ slugSegments, initialTVData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(!initialTVData);
  const [error, setError] = useState(false);
  const [playerModal, setPlayerModal] = useState({
    isOpen: false,
    content: null,
    platform: null,
    embedUrl: null,
    contentType: 'tv',
    season: null,
    episode: null,
  });

  useEffect(() => {
    const parsed = parseTVSlug(slugSegments);
    if (!parsed) {
      router.replace('/');
      return;
    }

    const initPlayer = async () => {
      try {
        let tvData = initialTVData;

        if (!tvData) {
          tvData = await tmdbApi.getTVDetails(parsed.id);
        }

        if (!tvData) {
          setError(true);
          setLoading(false);
          return;
        }

        const content = tmdbApi.transformContent(tvData);
        const urls = streamingServices.getAllStreamingUrls(content, {
          season: parsed.season,
          episode: parsed.episode,
        });

        setPlayerModal({
          isOpen: true,
          content,
          platform: 'server1',
          embedUrl: urls.server1,
          contentType: 'tv',
          season: parsed.season,
          episode: parsed.episode,
        });
      } catch (err) {
        console.error('Failed to load TV show:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    initPlayer();
  }, [slugSegments, router, initialTVData]);

  const handleClosePlayer = useCallback(() => {
    setPlayerModal({
      isOpen: false,
      content: null,
      platform: null,
      embedUrl: null,
      contentType: 'tv',
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
        <Loading text="Loading TV show..." />
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
        <h3 style={{ color: 'var(--netflix-red)', marginBottom: '1rem' }}>TV Show Not Found</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Unable to load this TV show. It may have been removed or is temporarily unavailable.
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
