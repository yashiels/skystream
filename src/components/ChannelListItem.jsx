import PropTypes from 'prop-types';
import './ChannelListItem.css';

const ChannelListItem = ({ channel, isSelected, isPlaying, onClick }) => {
  // Get country flag emoji
  const getCountryFlag = countryCode => {
    if (!countryCode) return '🌍';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  };

  return (
    <div
      className={`channel-list-item ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={channel.name}
    >
      <div className="channel-item-content">
        <div className="channel-main-info">
          <span className="channel-flag">{getCountryFlag(channel.country)}</span>
          <span className="channel-name">{channel.name}</span>
          {isPlaying && (
            <span className="playing-indicator">
              <span className="playing-dot"></span>
            </span>
          )}
        </div>

        <div className="channel-meta">
          {channel.language && (
            <span className="channel-language">{channel.language.toUpperCase()}</span>
          )}
        </div>
      </div>
    </div>
  );
};

ChannelListItem.propTypes = {
  channel: PropTypes.shape({
    nanoid: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    iptv_urls: PropTypes.arrayOf(PropTypes.string),
    youtube_urls: PropTypes.arrayOf(PropTypes.string),
    language: PropTypes.string,
    country: PropTypes.string,
    isGeoBlocked: PropTypes.bool,
  }).isRequired,
  isSelected: PropTypes.bool,
  isPlaying: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

ChannelListItem.defaultProps = {
  isSelected: false,
  isPlaying: false,
};

export default ChannelListItem;
