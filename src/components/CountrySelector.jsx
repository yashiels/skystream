import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import PropTypes from 'prop-types';
import { COUNTRIES, getCountryByCode } from '@/shared';
import './CountrySelector.css';

const CountrySelector = ({ selectedCountry, onCountryChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedCountryData = getCountryByCode(selectedCountry);

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

  // Filter countries based on search query
  const filteredCountries = COUNTRIES.filter(country => {
    if (country.code === 'separator') return true;
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return country.name.toLowerCase().includes(query) || country.code.toLowerCase().includes(query);
  });

  const handleCountrySelect = countryCode => {
    if (countryCode === 'separator') return;
    onCountryChange(countryCode);
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
    <div className="country-selector" ref={dropdownRef}>
      <button
        className="country-selector-button"
        onClick={handleToggle}
        aria-label="Select country"
        aria-expanded={isOpen}
      >
        <Globe size={18} />
        <span className="country-name">
          {selectedCountryData?.flag} {selectedCountryData?.name || 'Select Country'}
        </span>
        <ChevronDown size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="country-dropdown">
          <div className="country-search">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search countries..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="country-search-input"
            />
          </div>

          <div className="country-list">
            {filteredCountries.length === 0 ? (
              <div className="country-list-empty">
                <p>No countries found</p>
              </div>
            ) : (
              filteredCountries.map(country => {
                if (country.code === 'separator') {
                  return <div key="separator" className="country-separator" />;
                }

                return (
                  <button
                    key={country.code}
                    className={`country-item ${selectedCountry === country.code ? 'selected' : ''}`}
                    onClick={() => handleCountrySelect(country.code)}
                  >
                    <span className="country-flag">{country.flag}</span>
                    <span className="country-name">{country.name}</span>
                    {selectedCountry === country.code && (
                      <span className="country-checkmark">✓</span>
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

CountrySelector.propTypes = {
  selectedCountry: PropTypes.string.isRequired,
  onCountryChange: PropTypes.func.isRequired,
};

export default CountrySelector;
