import { useEffect, useRef, useState } from 'react';
import { DateTime } from 'luxon';
import PropTypes from 'prop-types';
import './LiveTVPlayer.css';

const LiveTVPlayer = ({ streamData = null, channelName = 'Live Stream', onStreamError }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(DateTime.now());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if stream data is available
  const hasStreamData = streamData !== null && streamData !== undefined;

  // Extract stream URL and type
  const streamUrl = streamData?.url || (typeof streamData === 'string' ? streamData : null);
  const streamType = streamData?.type || 'hls';
  const isYouTube = streamType === 'youtube';

  // Convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = url => {
    if (!url) return null;

    // If URL is already an embed URL (youtube.com or youtube-nocookie.com), use it directly
    if (url.includes('/embed/')) {
      // Extract video ID and rebuild with our preferred parameters
      const videoId = url.split('/embed/')[1]?.split('?')[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1`;
      }
      // If we can't extract ID, return the URL as-is
      return url;
    }

    // Handle different YouTube URL formats
    let videoId = null;

    // Format: https://www.youtube.com/watch?v=VIDEO_ID
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      videoId = urlParams.get('v');
    }
    // Format: https://youtu.be/VIDEO_ID
    else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    // Format: https://www.youtube.com/live/VIDEO_ID
    else if (url.includes('youtube.com/live/')) {
      videoId = url.split('live/')[1]?.split('?')[0];
    }

    if (!videoId) return null;

    // Return embed URL with autoplay and live stream parameters
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1`;
  };

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(DateTime.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Initialize HLS player (only for non-YouTube streams)
  useEffect(() => {
    // Skip HLS initialization for YouTube streams
    if (isYouTube) {
      setIsLoading(false);
      setError(null);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    const initPlayer = async () => {
      try {
        // Check if browser supports HLS natively (Safari)
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          setIsLoading(false);
          setError(null);
        } else {
          // Use HLS.js for other browsers
          const HLS = (await import('hls.js')).default;

          if (HLS.isSupported()) {
            const hls = new HLS({
              enableWorker: true,
              lowLatencyMode: true,
            });

            hlsRef.current = hls;

            hls.loadSource(streamUrl);
            hls.attachMedia(video);

            hls.on(HLS.Events.MANIFEST_PARSED, () => {
              setIsLoading(false);
              setError(null);
              video.play().catch(() => {
                // Autoplay might be blocked
                setIsLoading(false);
              });
            });

            hls.on(HLS.Events.ERROR, (_event, data) => {
              console.error('HLS error:', data);
              if (data.fatal) {
                let errorMessage = '';
                switch (data.type) {
                  case HLS.ErrorTypes.NETWORK_ERROR:
                    console.error('Network error details:', data.details, data.response);
                    if (data.response?.code === 0) {
                      errorMessage =
                        'CORS Error - Stream blocked by browser security. This stream may only work in VLC or similar players.';
                    } else {
                      errorMessage =
                        'Network error - Failed to load stream. Please check your connection.';
                    }
                    setError(errorMessage);
                    // Notify parent component
                    if (onStreamError) {
                      onStreamError(errorMessage);
                    }
                    // Try to recover
                    setTimeout(() => {
                      if (hlsRef.current) {
                        hls.startLoad();
                      }
                    }, 3000);
                    break;
                  case HLS.ErrorTypes.MEDIA_ERROR:
                    errorMessage = 'Media error - Trying to recover...';
                    setError(errorMessage);
                    hls.recoverMediaError();
                    break;
                  default:
                    errorMessage =
                      'Fatal error - Cannot play stream. Try using VLC or another media player.';
                    setError(errorMessage);
                    if (onStreamError) {
                      onStreamError(errorMessage);
                    }
                    hls.destroy();
                    break;
                }
                setIsLoading(false);
              }
            });
          } else {
            setError('HLS is not supported in this browser');
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error('Failed to initialize player:', err);
        setError('Failed to load video player');
        setIsLoading(false);
      }
    };

    // Handle video events
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handlePlaying = () => setIsLoading(false);
    const handleError = () => {
      const errorCode = video.error?.code;
      const errorMessages = {
        1: 'Video loading aborted',
        2: 'Network error',
        3: 'Video decoding failed',
        4: 'Video format not supported',
      };
      setError(errorMessages[errorCode] || 'Failed to load video');
      setIsLoading(false);
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('error', handleError);

    initPlayer();

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('error', handleError);

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl, isYouTube, onStreamError]);

  const formattedTime = currentTime.toFormat('HH:mm:ss');
  const formattedDate = currentTime.toFormat('EEEE, MMMM d, yyyy');

  return (
    <div className="live-tv-player">
      <div className="live-tv-container">
        <div className="live-tv-header">
          <div className="live-indicator">
            <span className="live-dot"></span>
            <span className="live-text">LIVE</span>
          </div>
          <div className="live-time">
            <div className="time">{formattedTime}</div>
            <div className="date">{formattedDate}</div>
          </div>
        </div>

        <div className="video-container">
          {/* No Stream Available */}
          {!hasStreamData && (
            <div
              className="error-message"
              style={{ background: 'rgba(255, 165, 0, 0.1)', borderColor: '#ffa500' }}
            >
              <p style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                {streamData === null && !channelName.includes('Live Stream')
                  ? 'No Stream Available'
                  : 'Select a Channel'}
              </p>
              <p>
                {streamData === null && !channelName.includes('Live Stream')
                  ? 'This channel does not have any available stream URLs.'
                  : 'Please select a channel from the sidebar to start watching.'}
              </p>
            </div>
          )}

          {/* Stream Errors */}
          {hasStreamData && error && (
            <div className="error-message">
              <p style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                {error}
              </p>
              {error.includes('CORS') ? (
                <div>
                  <p>This stream has CORS restrictions that prevent playback in browsers.</p>
                  <p style={{ marginTop: '1rem' }}>Alternative options:</p>
                  <ul style={{ textAlign: 'left', marginTop: '0.5rem', paddingLeft: '2rem' }}>
                    <li>
                      Use VLC Media Player with this URL: <br />
                      <code
                        style={{
                          background: 'rgba(0,0,0,0.5)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          wordBreak: 'break-all',
                        }}
                      >
                        {streamUrl}
                      </code>
                    </li>
                    <li style={{ marginTop: '0.5rem' }}>Try a different browser</li>
                    <li style={{ marginTop: '0.5rem' }}>Use a browser extension to bypass CORS</li>
                  </ul>
                </div>
              ) : (
                <p>Please try refreshing the page or check your internet connection.</p>
              )}
            </div>
          )}

          {/* Loading State */}
          {hasStreamData && isLoading && !error && (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading stream...</p>
            </div>
          )}

          {/* YouTube Player */}
          {hasStreamData && isYouTube && !error && (
            <iframe
              className="live-video youtube-player"
              src={getYouTubeEmbedUrl(streamUrl)}
              title={channelName}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{ width: '100%', height: '100%', backgroundColor: '#000', border: 'none' }}
            />
          )}

          {/* HLS Video Player */}
          {hasStreamData && !isYouTube && (
            <video
              ref={videoRef}
              className="live-video"
              controls
              playsInline
              muted
              crossOrigin="anonymous"
              style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
            />
          )}
        </div>

        <div className="live-tv-footer">
          <p>{channelName}</p>
        </div>
      </div>
    </div>
  );
};

LiveTVPlayer.propTypes = {
  streamData: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      url: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['hls', 'youtube']).isRequired,
    }),
  ]),
  channelName: PropTypes.string,
  onStreamError: PropTypes.func,
};

export default LiveTVPlayer;
