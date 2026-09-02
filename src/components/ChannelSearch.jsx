import { Search, X } from 'lucide-react';
import PropTypes from 'prop-types';
import './ChannelSearch.css';

const ChannelSearch = ({ searchQuery, onSearchChange, onClear }) => {
  return (
    <div className="channel-search">
      <div className="search-input-wrapper">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder="Search channels..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          aria-label="Search channels"
        />
        {searchQuery && (
          <button className="clear-button" onClick={onClear} aria-label="Clear search">
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

ChannelSearch.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};

export default ChannelSearch;
