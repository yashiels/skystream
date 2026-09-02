import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import BrowseModeSelectionScreen from './BrowseModeSelectionScreen';
import FilterSelectionScreen from './FilterSelectionScreen';
import ChannelListScreen from './ChannelListScreen';
import { DEFAULT_COUNTRY, getCountryName, DEFAULT_CATEGORY, getCategoryName } from '@/shared';
import './ChannelSelector.css';

const ChannelSelector = ({
  selectedChannel,
  onChannelSelect,
  currentlyPlayingId,
  onClose: _onClose,
}) => {
  // Navigation state: 'mode-selection', 'filter-selection', 'channel-list'
  const [currentScreen, setCurrentScreen] = useState(() => {
    // Check if user has previously selected a mode and filter
    const savedMode = localStorage.getItem('liveTV_browseMode');
    const savedCountry = localStorage.getItem('liveTV_selectedCountry');
    const savedCategory = localStorage.getItem('liveTV_selectedCategory');

    // If user has saved preferences, go directly to channel list
    if (savedMode && (savedCountry || savedCategory)) {
      return 'channel-list';
    }

    // Otherwise, start at mode selection
    return 'mode-selection';
  });

  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Browse mode state (country or category)
  const [browseMode, setBrowseMode] = useState(() => {
    return localStorage.getItem('liveTV_browseMode') || 'country';
  });

  // Country state
  const [selectedCountry, setSelectedCountry] = useState(() => {
    return localStorage.getItem('liveTV_selectedCountry') || DEFAULT_COUNTRY;
  });

  // Category state
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return localStorage.getItem('liveTV_selectedCategory') || DEFAULT_CATEGORY;
  });

  // Fetch channels from API based on browse mode and selection
  useEffect(() => {
    // Only fetch if we're on the channel list screen
    if (currentScreen !== 'channel-list') {
      return;
    }

    const fetchChannels = async () => {
      try {
        setLoading(true);

        // Build URL based on browse mode
        const baseUrl =
          'https://raw.githubusercontent.com/TVGarden/tv-garden-channel-list/refs/heads/main/channels/raw';
        const url =
          browseMode === 'country'
            ? `${baseUrl}/countries/${selectedCountry}.json`
            : `${baseUrl}/categories/${selectedCategory}.json`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch channels');
        }

        const data = await response.json();
        setChannels(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching channels:', err);
        setError('Failed to load channels. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, [currentScreen, browseMode, selectedCountry, selectedCategory]);

  // Save browse mode to localStorage
  useEffect(() => {
    localStorage.setItem('liveTV_browseMode', browseMode);
  }, [browseMode]);

  // Save selected country to localStorage
  useEffect(() => {
    localStorage.setItem('liveTV_selectedCountry', selectedCountry);
  }, [selectedCountry]);

  // Save selected category to localStorage
  useEffect(() => {
    localStorage.setItem('liveTV_selectedCategory', selectedCategory);
  }, [selectedCategory]);

  // Navigation handlers
  const handleModeSelection = mode => {
    setBrowseMode(mode);
    setCurrentScreen('filter-selection');
  };

  const handleFilterSelection = value => {
    if (browseMode === 'country') {
      setSelectedCountry(value);
    } else {
      setSelectedCategory(value);
    }
    setCurrentScreen('channel-list');
  };

  const handleBackFromFilterSelection = () => {
    setCurrentScreen('mode-selection');
  };

  const handleBackFromChannelList = () => {
    setCurrentScreen('filter-selection');
  };

  const handleChannelSelect = channel => {
    onChannelSelect(channel);
  };

  // Get current filter display name
  const currentFilterName =
    browseMode === 'country' ? getCountryName(selectedCountry) : getCategoryName(selectedCategory);

  const currentFilterType = browseMode === 'country' ? 'Country' : 'Category';
  const currentFilterValue = browseMode === 'country' ? selectedCountry : selectedCategory;

  return (
    <div className="channel-selector">
      {/* Layer 1: Browse Mode Selection */}
      {currentScreen === 'mode-selection' && (
        <BrowseModeSelectionScreen onSelectMode={handleModeSelection} />
      )}

      {/* Layer 2: Filter Selection (Country or Category) */}
      {currentScreen === 'filter-selection' && (
        <FilterSelectionScreen
          mode={browseMode}
          selectedValue={currentFilterValue}
          onSelect={handleFilterSelection}
          onBack={handleBackFromFilterSelection}
        />
      )}

      {/* Layer 3: Channel List */}
      {currentScreen === 'channel-list' && (
        <ChannelListScreen
          channels={channels}
          loading={loading}
          error={error}
          selectedChannel={selectedChannel}
          currentlyPlayingId={currentlyPlayingId}
          onChannelSelect={handleChannelSelect}
          onBack={handleBackFromChannelList}
          filterName={currentFilterName}
          filterType={currentFilterType}
        />
      )}
    </div>
  );
};

ChannelSelector.propTypes = {
  selectedChannel: PropTypes.object,
  onChannelSelect: PropTypes.func.isRequired,
  currentlyPlayingId: PropTypes.string,
  onClose: PropTypes.func,
};

export default ChannelSelector;
