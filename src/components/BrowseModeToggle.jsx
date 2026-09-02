import { Globe, Tag } from 'lucide-react';
import PropTypes from 'prop-types';
import './BrowseModeToggle.css';

const BrowseModeToggle = ({ browseMode, onBrowseModeChange }) => {
  return (
    <div className="browse-mode-toggle">
      <button
        className={`browse-mode-button ${browseMode === 'country' ? 'active' : ''}`}
        onClick={() => onBrowseModeChange('country')}
        aria-label="Browse by country"
        aria-pressed={browseMode === 'country'}
      >
        <Globe size={16} />
        <span>Country</span>
      </button>
      <button
        className={`browse-mode-button ${browseMode === 'category' ? 'active' : ''}`}
        onClick={() => onBrowseModeChange('category')}
        aria-label="Browse by category"
        aria-pressed={browseMode === 'category'}
      >
        <Tag size={16} />
        <span>Category</span>
      </button>
    </div>
  );
};

BrowseModeToggle.propTypes = {
  browseMode: PropTypes.oneOf(['country', 'category']).isRequired,
  onBrowseModeChange: PropTypes.func.isRequired,
};

export default BrowseModeToggle;
