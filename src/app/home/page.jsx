'use client';

import { useState, useEffect, useCallback } from 'react';
import FeaturedHero from '../../components/FeaturedHero';
import ContentRow from '../../components/ContentRow';
import StreamingPlayerModal from '../../components/StreamingPlayerModal';
import ContentRowSkeleton from '../../components/ContentRowSkeleton';
import FeaturedHeroSkeleton from '../../components/FeaturedHeroSkeleton';
import tmdbApi from '../../services/tmdbApi';
import { analytics, utils } from '../../utils';

const Discover = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playerModal, setPlayerModal] = useState({
    isOpen: false,
    content: null,
    platform: null,
    embedUrl: null,
    contentType: 'movie',
    season: null,
    episode: null,
  });

  // Fetch homepage content on mount
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const homeContent = await tmdbApi.getHomePageContent();
        setContent(homeContent);

        // Track page view
        analytics.trackPageView('/home', 'SkyStream - Discover');
      } catch (err) {
        utils.error('Failed to fetch homepage content:', err);
        setError(err);
        analytics.trackError(`Homepage content fetch failed: ${err.message}`, 'content_error');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Handle play content
  const handlePlay = useCallback((content, platform, embedUrl, options = {}) => {
    const { season = null, episode = null } = options;

    setPlayerModal({
      isOpen: true,
      content,
      platform,
      embedUrl,
      contentType: content.type || 'movie',
      season,
      episode,
    });

    // Track play event
    analytics.trackEvent('content_play', {
      category: 'streaming',
      label: platform,
      content_id: content.id,
      content_type: content.type,
      content_title: content.title,
      season,
      episode,
    });
  }, []);

  // Handle close player modal
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
  }, []);

  if (loading) {
    return (
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
        <FeaturedHeroSkeleton />
        <ContentRowSkeleton title="Trending Now" cardCount={6} />
        <ContentRowSkeleton title="Popular Movies" cardCount={6} />
        <ContentRowSkeleton title="Popular TV Shows" cardCount={6} />
        <ContentRowSkeleton title="Top Rated" cardCount={6} />
        <ContentRowSkeleton title="Popular Anime" cardCount={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          padding: '2rem',
          background: 'var(--bg-primary)',
        }}
      >
        <h2 style={{ color: 'var(--netflix-red)', marginBottom: '1rem' }}>
          Failed to Load Content
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Unable to fetch content. Please try again later.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 2rem',
            background: 'var(--netflix-red)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="discover-page" style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Featured Hero Section */}
      {content?.featured && content.featured.length > 0 && (
        <FeaturedHero content={content.featured} onPlay={handlePlay} />
      )}

      {/* Content Rows */}
      <div style={{ paddingBottom: '4rem' }}>
        {content?.trending && content.trending.length > 0 && (
          <ContentRow title="Trending Now" content={content.trending} onPlay={handlePlay} />
        )}

        {content?.popularMovies && content.popularMovies.length > 0 && (
          <ContentRow title="Popular Movies" content={content.popularMovies} onPlay={handlePlay} />
        )}

        {content?.popularTV && content.popularTV.length > 0 && (
          <ContentRow title="Popular TV Shows" content={content.popularTV} onPlay={handlePlay} />
        )}

        {content?.topRated && content.topRated.length > 0 && (
          <ContentRow title="Top Rated" content={content.topRated} onPlay={handlePlay} />
        )}

        {content?.popularAnime && content.popularAnime.length > 0 && (
          <ContentRow title="Popular Anime" content={content.popularAnime} onPlay={handlePlay} />
        )}
      </div>

      {/* Streaming Player Modal */}
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
    </div>
  );
};

export default Discover;
