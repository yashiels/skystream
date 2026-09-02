import { useState } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import { Play, Star, Calendar, Info } from 'lucide-react';
import streamingServices from '../services/streamingServices';
import { TrailerButton } from './TrailerButton';
import './StreamingResultCard.css';

const StreamingResultCard = ({ content, onPlay }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const posterUrl = content.poster_path
    ? `https://image.tmdb.org/t/p/w500${content.poster_path}`
    : null;

  const releaseYear = content.release_date ? new Date(content.release_date).getFullYear() : null;

  const rating = content.vote_average ? Math.round(content.vote_average * 10) / 10 : null;

  const handlePlay = () => {
    // Open player with default server (Server 1)
    const urls = streamingServices.getAllStreamingUrls(content);
    onPlay?.(content, 'server1', urls.server1);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <div className="streaming-result-card">
      <div className="streaming-result-card__poster">
        <TrailerButton content={content} onWatch={handlePlay} />
        {posterUrl && !imageError ? (
          <Image
            src={posterUrl}
            alt={content.title || 'Content poster'}
            width={300}
            height={450}
            className={`streaming-result-card__image ${imageLoaded ? 'loaded' : ''}`}
            loading="lazy"
            unoptimized={!posterUrl.includes('image.tmdb.org')}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ width: '100%', height: 'auto' }}
          />
        ) : (
          <div className="streaming-result-card__placeholder">
            <Info size={32} />
          </div>
        )}

        <div className="streaming-result-card__overlay">
          <div className="streaming-result-card__play-buttons">
            <button className="streaming-result-card__play-btn" onClick={handlePlay} title="Play">
              <Play size={20} />
              Play
            </button>
          </div>
        </div>
      </div>

      <div className="streaming-result-card__info">
        <h3 className="streaming-result-card__title" title={content.title}>
          {content.title}
        </h3>

        <div className="streaming-result-card__meta">
          {Boolean(releaseYear) && (
            <span className="streaming-result-card__year">
              <Calendar size={12} />
              {releaseYear}
            </span>
          )}

          {Boolean(rating) && (
            <span className="streaming-result-card__rating">
              <Star size={12} />
              {rating}
            </span>
          )}

          <span className="streaming-result-card__type">
            {content.type === 'movie' ? 'Movie' : 'TV'}
          </span>
        </div>

        {content.overview && (
          <p className="streaming-result-card__overview">
            {content.overview.length > 120
              ? `${content.overview.substring(0, 120)}...`
              : content.overview}
          </p>
        )}
      </div>
    </div>
  );
};

StreamingResultCard.propTypes = {
  content: PropTypes.shape({
    id: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string,
    poster_path: PropTypes.string,
    release_date: PropTypes.string,
    vote_average: PropTypes.number,
    overview: PropTypes.string,
  }).isRequired,
  onPlay: PropTypes.func.isRequired,
};

export default StreamingResultCard;
