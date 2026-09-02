import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Search, Check } from 'lucide-react';
import PropTypes from 'prop-types';
import {
  COUNTRIES,
  getCountryName,
  getCountryFlag,
  CATEGORIES,
  getCategoryName,
  getCategoryIcon,
} from '@/shared';
import './FilterSelectionScreen.css';

const FilterSelectionScreen = ({ mode, selectedValue, onSelect, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  const isCountryMode = mode === 'country';
  const items = isCountryMode ? COUNTRIES : CATEGORIES;

  // Auto-focus search input
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Filter items based on search
  const filteredItems = items.filter(item => {
    if (item.code === 'separator') return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(query) || item.code.toLowerCase().includes(query);
  });

  // Separate popular items (before separator) and all items
  const separatorIndex = items.findIndex(item => item.code === 'separator');
  const popularItems = separatorIndex !== -1 ? items.slice(0, separatorIndex) : [];
  const hasPopularItems = popularItems.length > 0 && !searchQuery.trim();

  const handleItemClick = itemCode => {
    onSelect(itemCode);
  };

  const getItemDisplay = item => {
    if (isCountryMode) {
      return {
        icon: getCountryFlag(item.code),
        name: getCountryName(item.code),
      };
    } else {
      return {
        icon: getCategoryIcon(item.code),
        name: getCategoryName(item.code),
      };
    }
  };

  return (
    <div className="filter-selection-screen">
      {/* Header */}
      <div className="filter-selection-header">
        <button className="filter-back-button" onClick={onBack} aria-label="Go back">
          <ChevronLeft size={24} />
        </button>
        <h2 className="filter-selection-title">
          {isCountryMode ? 'Select Country' : 'Select Category'}
        </h2>
      </div>

      {/* Search */}
      <div className="filter-search-wrapper">
        <div className="filter-search-container">
          <Search size={18} className="filter-search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="filter-search-input"
            placeholder={isCountryMode ? 'Search countries...' : 'Search categories...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Items List */}
      <div className="filter-items-list">
        {hasPopularItems && (
          <div className="filter-items-section">
            <div className="filter-section-label">Popular</div>
            <div className="filter-items-grid">
              {popularItems.map(item => {
                const display = getItemDisplay(item);
                const isSelected = selectedValue === item.code;
                return (
                  <button
                    key={item.code}
                    className={`filter-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleItemClick(item.code)}
                  >
                    <span className="filter-item-icon">{display.icon}</span>
                    <span className="filter-item-name">{display.name}</span>
                    {isSelected && <Check size={18} className="filter-item-check" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="filter-items-section">
          {hasPopularItems && (
            <div className="filter-section-label">
              All {isCountryMode ? 'Countries' : 'Categories'}
            </div>
          )}
          <div className="filter-items-grid">
            {filteredItems.map(item => {
              const display = getItemDisplay(item);
              const isSelected = selectedValue === item.code;
              return (
                <button
                  key={item.code}
                  className={`filter-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleItemClick(item.code)}
                >
                  <span className="filter-item-icon">{display.icon}</span>
                  <span className="filter-item-name">{display.name}</span>
                  {isSelected && <Check size={18} className="filter-item-check" />}
                </button>
              );
            })}
          </div>
        </div>

        {filteredItems.length === 0 && (
          <div className="filter-items-empty">
            <p>No {isCountryMode ? 'countries' : 'categories'} found</p>
          </div>
        )}
      </div>
    </div>
  );
};

FilterSelectionScreen.propTypes = {
  mode: PropTypes.oneOf(['country', 'category']).isRequired,
  selectedValue: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default FilterSelectionScreen;
