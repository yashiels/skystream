import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { X, ExternalLink } from 'lucide-react';
import streamingServices from '../services/streamingServices';
import tmdbApi from '../services/tmdbApi';
import { generateMovieUrl, generateTVUrl, PLAYER_DEFAULTS } from '@skystream/shared';
import { updateBrowserUrl } from '../utils/urlRouting';

import './StreamingPlayerModal.css';

// Single player — VidSrc handles all streaming
const DEFAULT_SERVER = 'vidsrc';

// Continue-watching: persist playback position per title (and per episode for
// TV) so it can be restored via the `startAt` param on the next open.
const getProgressStorageKey = (content, type, season, episode) => {
  if (!content?.id) return null;
  return type === 'tv'
    ? `skystream:progress:tv:${content.id}:${season}:${episode}`
    : `skystream:progress:movie:${content.id}`;
};

const readStoredProgress = key => {
  if (!key || typeof window === 'undefined') return undefined;
  try {
    const value = window.localStorage.getItem(key);
    return value ? Number.parseInt(value, 10) : undefined;
  } catch {
    return undefined;
  }
};

const writeStoredProgress = (key, seconds) => {
  if (!key || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, String(Math.floor(seconds)));
  } catch {
    // localStorage unavailable (private browsing, quota, etc.) — non-fatal
  }
};

const clearStoredProgress = key => {
  if (!key || typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // localStorage unavailable — non-fatal
  }
};

const StreamingPlayerModal = ({
  isOpen,
  onClose,
  content,
  platform: _platform,
  embedUrl,
  contentType = 'movie',
  season = null,
  episode = null,
}) => {
  // State for season and episode selection
  const [selectedSeason, setSelectedSeason] = useState(season || 1);
  const [selectedEpisode, setSelectedEpisode] = useState(episode || 1);
  const [currentEmbedUrl, setCurrentEmbedUrl] = useState(embedUrl);

  const [seasonsData, setSeasonsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [iframeSwitching] = useState(false);

  // Sync state with props when they change (e.g., from deep linking)
  useEffect(() => {
    if (season !== null && season !== selectedSeason) {
      setSelectedSeason(season);
    }
    if (episode !== null && episode !== selectedEpisode) {
      setSelectedEpisode(episode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: sync from props only, not on internal state changes; see DEV-149 for full fix
  }, [season, episode]);

  // Handle season change - reset episode to 1
  const handleSeasonChange = newSeason => {
    const seasonNum = Number.parseInt(newSeason, 10);
    setSelectedSeason(seasonNum);
    setSelectedEpisode(1); // Reset to episode 1 when season changes

    // Ensure episode 1 exists for the selected season
    if (seasonsData) {
      const currentSeason = seasonsData.seasons.find(s => s.season_number === seasonNum);
      if (currentSeason && currentSeason.episode_count === 0) {
        // If season has no episodes, don't change episode
        return;
      }
    }
  };

  // Update embed URL when season/episode changes, resuming from any saved
  // continue-watching position for this title/episode
  useEffect(() => {
    if (content?.id) {
      const startAt = readStoredProgress(
        getProgressStorageKey(content, contentType, selectedSeason, selectedEpisode)
      );
      const url = streamingServices.getStreamingUrl(content, {
        season: selectedSeason,
        episode: selectedEpisode,
        ...(startAt ? { startAt } : {}),
      });
      if (url) setCurrentEmbedUrl(url);
    } else {
      setCurrentEmbedUrl(embedUrl);
    }
  }, [selectedSeason, selectedEpisode, contentType, content, embedUrl]);

  // Fetch seasons data from TMDB when modal opens for TV content
  useEffect(() => {
    const fetchSeasonsData = async () => {
      if (isOpen && contentType === 'tv' && content?.id) {
        setLoading(true);
        try {
          const data = await tmdbApi.getTVSeasonsData(content.id);
          setSeasonsData(data);
        } catch (error) {
          console.warn('Failed to fetch seasons data:', error);
          // Fallback to generic data if API fails
          setSeasonsData(null);
        } finally {
          setLoading(false);
        }
      } else {
        setSeasonsData(null);
      }
    };

    fetchSeasonsData();
  }, [isOpen, contentType, content?.id]);

  // Store original title on mount
  const originalTitleRef = useRef(typeof document !== 'undefined' ? document.title : '');

  // Update browser URL and document title when modal opens with content
  useEffect(() => {
    if (isOpen && content?.id) {
      let url;
      let title;

      if (contentType === 'tv') {
        url = generateTVUrl(content, selectedSeason, selectedEpisode);
        title = `${content.title} S${selectedSeason}E${selectedEpisode} - SkyStream`;
      } else {
        url = generateMovieUrl(content);
        title = `${content.title} - SkyStream`;
      }

      if (url) {
        updateBrowserUrl(url, title);
        document.title = title;
      }
    } else if (!isOpen) {
      // Restore original title when modal closes
      document.title = originalTitleRef.current;
    }
  }, [isOpen, content, contentType, selectedSeason, selectedEpisode]);

  // Listen for VidSrc player events: track playback progress for
  // continue-watching, and follow autonext episode chaining for TV.
  useEffect(() => {
    if (!isOpen || !content?.id) return;

    const vidsrcOrigin = new URL(PLAYER_DEFAULTS.vidsrcBaseUrl).origin;

    const handleMessage = event => {
      if (event.origin !== vidsrcOrigin) return;
      if (!event.data || event.data.type !== 'PLAYER_EVENT') return;

      const {
        player_info: info,
        player_status: status,
        player_progress: progress,
      } = event.data.data || {};

      if (contentType === 'tv' && info?.season && info?.episode) {
        const seasonNum = Number.parseInt(info.season, 10);
        const episodeNum = Number.parseInt(info.episode, 10);

        if (
          seasonNum &&
          episodeNum &&
          (seasonNum !== selectedSeason || episodeNum !== selectedEpisode)
        ) {
          setSelectedSeason(seasonNum);
          setSelectedEpisode(episodeNum);
        }
      }

      const key = getProgressStorageKey(content, contentType, selectedSeason, selectedEpisode);
      if (status === 'completed') {
        clearStoredProgress(key);
      } else if (
        typeof progress === 'number' &&
        (status === 'playing' || status === 'paused' || status === 'seeked')
      ) {
        writeStoredProgress(key, progress);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isOpen, content, contentType, selectedSeason, selectedEpisode]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = e => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Open in new tab
  const handleOpenInNewTab = () => {
    window.open(currentEmbedUrl, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <dialog
      className="streaming-player-modal"
      aria-modal="true"
      open
      onKeyDown={e => {
        if (e.key === 'Escape') {
          onClose();
        }
      }}
    >
      <div className="streaming-player-modal__content" onClick={handleBackdropClick}>
        <div className="streaming-player-modal__header">
          <div className="streaming-player-modal__title">
            <h2>{content?.title}</h2>
          </div>

          {/* Season and Episode Selectors for TV Series */}
          {contentType === 'tv' && (
            <div className="streaming-player-modal__episode-controls">
              <div className="streaming-player-modal__selector">
                <label htmlFor="season-select">
                  Season: {loading && <span className="loading-text">(Loading...)</span>}
                </label>
                <select
                  id="season-select"
                  value={selectedSeason}
                  onChange={e => handleSeasonChange(e.target.value)}
                  className="streaming-player-modal__select"
                  disabled={loading}
                >
                  {seasonsData
                    ? seasonsData.seasons.map(season => (
                        <option key={season.season_number} value={season.season_number}>
                          Season {season.season_number}
                          {season.name &&
                            season.name !== `Season ${season.season_number}` &&
                            ` - ${season.name}`}
                        </option>
                      ))
                    : // Fallback to generic seasons if TMDB data not available
                      Array.from({ length: 10 }, (_, i) => i + 1).map(seasonNum => (
                        <option key={seasonNum} value={seasonNum}>
                          Season {seasonNum}
                        </option>
                      ))}
                </select>
              </div>

              <div className="streaming-player-modal__selector">
                <label htmlFor="episode-select">Episode:</label>
                <select
                  id="episode-select"
                  value={selectedEpisode}
                  onChange={e => setSelectedEpisode(Number.parseInt(e.target.value, 10))}
                  className="streaming-player-modal__select"
                  disabled={loading}
                >
                  {(() => {
                    // Get episode count for selected season
                    let episodeCount = 24; // Default fallback

                    if (seasonsData) {
                      const currentSeason = seasonsData.seasons.find(
                        s => s.season_number === selectedSeason
                      );
                      if (currentSeason) {
                        episodeCount = currentSeason.episode_count;
                      }
                    }

                    return Array.from({ length: episodeCount }, (_, i) => i + 1).map(episodeNum => (
                      <option key={episodeNum} value={episodeNum}>
                        Episode {episodeNum}
                      </option>
                    ));
                  })()}
                </select>
              </div>
            </div>
          )}

          <div className="streaming-player-modal__controls">
            <button
              className="streaming-player-modal__control-btn"
              onClick={handleOpenInNewTab}
              title="Open in new tab"
            >
              <ExternalLink size={18} />
            </button>
            <button
              className="streaming-player-modal__control-btn streaming-player-modal__close"
              onClick={onClose}
              title="Close player"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="streaming-player-modal__player">
          <iframe
            src={currentEmbedUrl}
            title={`${content?.title} - VidSrc`}
            className={`streaming-player-modal__iframe ${iframeSwitching ? 'streaming-player-modal__iframe--loading' : 'streaming-player-modal__iframe--loaded'}`}
            allowFullScreen
            allow="encrypted-media; autoplay; fullscreen"
            referrerPolicy="origin"
            style={{ border: 'none' }}
            loading="lazy"
          />
        </div>

        <div className="streaming-player-modal__footer">
          <p className="streaming-player-modal__disclaimer">
            Content is provided by third-party services. We do not host any content.
          </p>
        </div>
      </div>
    </dialog>
  );
};

StreamingPlayerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  content: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string,
  }),
  platform: PropTypes.oneOf(['server1', 'server2', 'server3', 'vidsrc']),
  embedUrl: PropTypes.string,
  contentType: PropTypes.oneOf(['movie', 'tv']),
  season: PropTypes.number,
  episode: PropTypes.number,
};

export default StreamingPlayerModal;
