import { Globe, Tag } from 'lucide-react';
import PropTypes from 'prop-types';
import './BrowseModeSelectionScreen.css';

const BrowseModeSelectionScreen = ({ onSelectMode }) => {
  return (
    <div className="browse-mode-selection-screen">
      <div className="browse-mode-selection-content">
        <h2 className="browse-mode-selection-title">Browse Live TV Channels</h2>
        <p className="browse-mode-selection-subtitle">Choose how you want to explore channels</p>

        <div className="browse-mode-options">
          <button className="browse-mode-option" onClick={() => onSelectMode('country')}>
            <div className="browse-mode-option-icon">
              <Globe size={48} />
            </div>
            <h3 className="browse-mode-option-title">Browse by Country</h3>
            <p className="browse-mode-option-description">
              Explore channels from 168 countries worldwide
            </p>
          </button>

          <button className="browse-mode-option" onClick={() => onSelectMode('category')}>
            <div className="browse-mode-option-icon">
              <Tag size={48} />
            </div>
            <h3 className="browse-mode-option-title">Browse by Category</h3>
            <p className="browse-mode-option-description">
              Discover channels by genre: News, Sports, Movies, and more
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

BrowseModeSelectionScreen.propTypes = {
  onSelectMode: PropTypes.func.isRequired,
};

export default BrowseModeSelectionScreen;
