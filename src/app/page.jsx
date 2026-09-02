'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import StreamingSearchBar from '../components/StreamingSearchBar';
import StreamingResultCard from '../components/StreamingResultCard';
import StreamingPlayerModal from '../components/StreamingPlayerModal';
import StreamingResultCardSkeleton from '../components/StreamingResultCardSkeleton';
import tmdbApi from '../services/tmdbApi';
import { analytics } from '../utils';

const Search = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [playerModal, setPlayerModal] = useState({
    isOpen: false,
    content: null,
    platform: null,
    embedUrl: null,
    contentType: 'movie',
    season: null,
    episode: null,
  });

  const abortControllerRef = useRef(null);
  const lastQueryRef = useRef('');

  // Track page view on mount
  useEffect(() => {
    analytics.trackPageView('/', 'SkyStream - Search');
  }, []);

  // Handle search
  const handleSearch = useCallback(async query => {
    const trimmed = query.trim();
    if (trimmed === lastQueryRef.current) return;
    lastQueryRef.current = trimmed;

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      const searchResults = await tmdbApi.search(query);

      const transformedResults = searchResults.results
        .filter(item => item.media_type !== 'person')
        .map(item => tmdbApi.transformContent(item))
        .slice(0, 20);

      setSearchResults(transformedResults);

      analytics.trackSearch(query, transformedResults.length);
    } catch (err) {
      console.error('Search failed:', err);
      setError(err);
      setSearchResults([]);

      analytics.trackError(`Search failed: ${err.message}`, 'search_error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchResults([]);
    setHasSearched(false);
    setError(null);
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

  return (
    <div className="streaming-app">
      {/* Hero Section */}
      <div
        style={{
          padding:
            'clamp(2rem, 8vw, 4rem) clamp(1rem, 4vw, 2rem) clamp(1rem, 4vw, 2rem) clamp(1rem, 4vw, 2rem)',
          textAlign: 'center',
          background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
          transition: 'background 0.3s ease',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1
            style={{
              fontSize: 'clamp(2rem, 8vw, 3rem)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              margin: '0 0 1rem 0',
              background:
                'linear-gradient(135deg, var(--text-primary) 0%, var(--netflix-red) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            SkyStream
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 3vw, 1.25rem)',
              color: 'var(--text-secondary)',
              margin: '0 0 clamp(2rem, 6vw, 3rem) 0',
              lineHeight: '1.6',
            }}
          >
            Search and stream your favorite movies, TV shows, and anime instantly
          </p>

          {/* Search Bar */}
          <StreamingSearchBar
            onSearch={handleSearch}
            onClear={handleClearSearch}
            placeholder="Search for movies, TV shows, anime..."
            autoFocus={true}
          />
        </div>
      </div>

      {/* Search Results */}
      {loading && (
        <div style={{ padding: '2rem' }}>
          <h2
            style={{
              color: 'var(--text-primary)',
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '0 0 2rem 0',
              textAlign: 'center',
            }}
          >
            Searching...
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1.5rem',
              maxWidth: '1200px',
              margin: '0 auto',
            }}
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <StreamingResultCardSkeleton key={index} showOverview={true} />
            ))}
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px',
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          <h3 style={{ color: 'var(--netflix-red)', marginBottom: '1rem' }}>Search Failed</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Unable to search content. Please try again.
          </p>
        </div>
      )}

      {!loading && hasSearched && searchResults.length > 0 && (
        <div style={{ padding: '2rem' }}>
          <h2
            style={{
              color: 'var(--text-primary)',
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '0 0 2rem 0',
              textAlign: 'center',
            }}
          >
            Search Results ({searchResults.length})
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1.5rem',
              maxWidth: '1200px',
              margin: '0 auto',
            }}
          >
            {searchResults.map(content => (
              <StreamingResultCard
                key={`${content.type}-${content.id}`}
                content={content}
                onPlay={handlePlay}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && hasSearched && searchResults.length === 0 && !error && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px',
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          <SearchIcon size={64} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
          <h3
            style={{
              color: 'var(--text-primary)',
              fontSize: '1.5rem',
              margin: '0 0 0.5rem 0',
            }}
          >
            No Results Found
          </h3>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              maxWidth: '400px',
              margin: 0,
            }}
          >
            Try searching with different keywords or check your spelling.
          </p>
        </div>
      )}

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

export default Search;
