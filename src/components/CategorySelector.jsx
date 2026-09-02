import { useState, useRef, useEffect } from 'react';
import { Tag, ChevronDown } from 'lucide-react';
import PropTypes from 'prop-types';
import { CATEGORIES, getCategoryByCode } from '@/shared';
import './CategorySelector.css';

const CategorySelector = ({ selectedCategory, onCategoryChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedCategoryData = getCategoryByCode(selectedCategory);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter categories based on search query
  const filteredCategories = CATEGORIES.filter(category => {
    if (category.code === 'separator') return true;
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      category.name.toLowerCase().includes(query) || category.code.toLowerCase().includes(query)
    );
  });

  const handleCategorySelect = categoryCode => {
    if (categoryCode === 'separator') return;
    onCategoryChange(categoryCode);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchQuery('');
    }
  };

  return (
    <div className="category-selector" ref={dropdownRef}>
      <button
        className="category-selector-button"
        onClick={handleToggle}
        aria-label="Select category"
        aria-expanded={isOpen}
      >
        <Tag size={18} />
        <span className="category-name">
          {selectedCategoryData?.icon} {selectedCategoryData?.name || 'Select Category'}
        </span>
        <ChevronDown size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="category-dropdown">
          <div className="category-search">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="category-search-input"
            />
          </div>

          <div className="category-list">
            {filteredCategories.length === 0 ? (
              <div className="category-list-empty">
                <p>No categories found</p>
              </div>
            ) : (
              filteredCategories.map(category => {
                if (category.code === 'separator') {
                  return <div key="separator" className="category-separator" />;
                }

                return (
                  <button
                    key={category.code}
                    className={`category-item ${selectedCategory === category.code ? 'selected' : ''}`}
                    onClick={() => handleCategorySelect(category.code)}
                  >
                    <span className="category-icon">{category.icon}</span>
                    <span className="category-name">{category.name}</span>
                    {selectedCategory === category.code && (
                      <span className="category-checkmark">✓</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

CategorySelector.propTypes = {
  selectedCategory: PropTypes.string.isRequired,
  onCategoryChange: PropTypes.func.isRequired,
};

export default CategorySelector;
