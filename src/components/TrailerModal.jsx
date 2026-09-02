import PropTypes from 'prop-types';
import { X, Play } from 'lucide-react';
import './TrailerModal.css';

export const TrailerModal = ({ isOpen, onClose, onWatch, trailerKey, title }) => {
  if (!isOpen) return null;

  return (
    <div className="trailer-modal__overlay" onClick={onClose}>
      <div className="trailer-modal__content" onClick={e => e.stopPropagation()}>
        <button className="trailer-modal__close-btn" onClick={onClose} aria-label="Close trailer">
          <X size={20} />
        </button>

        <div className="trailer-modal__video-container">
          <iframe
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
            title={`${title} Trailer`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-presentation allow-fullscreen allow-popups"
          />
        </div>

        {onWatch && (
          <div className="trailer-modal__footer">
            <button className="trailer-modal__watch-btn" onClick={onWatch}>
              <Play size={18} />
              Watch Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

TrailerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onWatch: PropTypes.func,
  trailerKey: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};
