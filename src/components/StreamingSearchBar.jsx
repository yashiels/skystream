import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Search, X } from 'lucide-react';
import './StreamingSearchBar.css';

const StreamingSearchBar = ({
  onSearch,
  onClear,
  placeholder = 'Search for movies, TV shows, anime...',
  autoFocus = true,
  debounceMs = 300,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimerRef = useRef(null);
  const inputRef = useRef(null);

  // Handle input change with debounce
  const handleInputChange = e => {
    const value = e.target.value;
    setQuery(value);

    // Clear existing timeout
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timeout
    debounceTimerRef.current = setTimeout(() => {
      if (value.trim()) {
        setIsLoading(true);
        onSearch(value.trim()).finally(() => {
          setIsLoading(false);
        });
      } else {
        onClear?.();
      }
    }, debounceMs);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Listen for global focusSearch event (triggered by '/' keyboard shortcut)
  useEffect(() => {
    const handleFocusSearch = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    window.addEventListener('focusSearch', handleFocusSearch);
    return () => window.removeEventListener('focusSearch', handleFocusSearch);
  }, []);

  // Handle clear
  const handleClear = () => {
    setQuery('');
    setIsLoading(false);
    onClear?.();
  };

  // Handle form submit (for Enter key)
  const handleSubmit = e => {
    e.preventDefault();
    if (query.trim()) {
      setIsLoading(true);
      onSearch(query.trim()).finally(() => {
        setIsLoading(false);
      });
    }
  };

  return (
    <div className="streaming-search-bar">
      <form onSubmit={handleSubmit} className="streaming-search-bar__form">
        <div className="streaming-search-bar__input-container">
          <div className="streaming-search-bar__icon">
            <Search size={20} />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="streaming-search-bar__input"
            autoFocus={autoFocus}
            autoComplete="off"
            spellCheck="false"
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="streaming-search-bar__clear"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}

          {isLoading && (
            <div className="streaming-search-bar__loading">
              <div className="streaming-search-bar__spinner"></div>
            </div>
          )}

          {/* Keyboard shortcut hint */}
          {!isLoading && !query && (
            <span className="streaming-search-bar__hint" aria-hidden="true">
              /
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

StreamingSearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  onClear: PropTypes.func,
  placeholder: PropTypes.string,
  autoFocus: PropTypes.bool,
  debounceMs: PropTypes.number,
};

export default StreamingSearchBar;
