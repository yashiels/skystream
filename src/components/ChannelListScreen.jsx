import { useState, useMemo } from 'react';
import { ChevronLeft, Tv } from 'lucide-react';
import PropTypes from 'prop-types';
import ChannelSearch from './ChannelSearch';
import ChannelListItem from './ChannelListItem';
import './ChannelListScreen.css';

const ChannelListScreen = ({
  channels,
  loading,
  error,
  selectedChannel,
  currentlyPlayingId,
  onChannelSelect,
  onBack,
  filterName,
  filterType,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter channels based on search
  const filteredChannels = useMemo(() => {
    let filtered = channels;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        channel =>
          channel.name.toLowerCase().includes(query) ||
          (channel.language && channel.language.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [channels, searchQuery]);

  const handleChannelClick = channel => {
    onChannelSelect(channel);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="channel-list-screen">
      {/* Header */}
      <div className="channel-list-header">
        <div className="channel-list-header-top">
          <button className="channel-list-back-button" onClick={onBack} aria-label="Go back">
            <ChevronLeft size={24} />
          </button>
          <div className="channel-list-header-title">
            <Tv size={20} />
            <h2>Live TV</h2>
          </div>
        </div>

        <div className="channel-list-header-subtitle">
          {filterType}: {filterName}
        </div>

        <div className="channel-list-count">
          {loading ? (
            <span>Loading...</span>
          ) : (
            <span>
              {filteredChannels.length} {filteredChannels.length === 1 ? 'channel' : 'channels'}
            </span>
          )}
        </div>
      </div>

      {/* Search */}
      <ChannelSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClear={handleClearSearch}
      />

      {/* Channel List */}
      <div className="channel-list-content">
        {loading && (
          <div className="channel-list-loading">
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
            <p>Loading channels...</p>
          </div>
        )}

        {error && (
          <div className="channel-list-error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && filteredChannels.length === 0 && (
          <div className="channel-list-empty">
            <Tv size={48} />
            <p>No channels found</p>
            {searchQuery && (
              <button className="clear-filters-button" onClick={handleClearSearch}>
                Clear search
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredChannels.length > 0 && (
          <div className="channel-list-items">
            {filteredChannels.map(channel => (
              <ChannelListItem
                key={channel.nanoid}
                channel={channel}
                isSelected={selectedChannel?.nanoid === channel.nanoid}
                isPlaying={currentlyPlayingId === channel.nanoid}
                onClick={() => handleChannelClick(channel)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

ChannelListScreen.propTypes = {
  channels: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  selectedChannel: PropTypes.object,
  currentlyPlayingId: PropTypes.string,
  onChannelSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  filterName: PropTypes.string.isRequired,
  filterType: PropTypes.string.isRequired,
};

export default ChannelListScreen;
