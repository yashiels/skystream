import { useState } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, X } from 'lucide-react';
import './MaintenanceBanner.css';

const MaintenanceBanner = ({
  message = 'We are currently under maintenance. Some features may be temporarily unavailable.',
  dismissible = true,
  type = 'warning', // warning, info, error
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <div className={`maintenance-banner maintenance-banner--${type}`}>
      <div className="maintenance-banner__container">
        <div className="maintenance-banner__content">
          <div className="maintenance-banner__icon">
            <AlertTriangle size={20} />
          </div>
          <div className="maintenance-banner__message">{message}</div>
        </div>

        {dismissible && (
          <button
            className="maintenance-banner__dismiss"
            onClick={handleDismiss}
            aria-label="Dismiss maintenance notice"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

MaintenanceBanner.propTypes = {
  message: PropTypes.string,
  dismissible: PropTypes.bool,
  type: PropTypes.oneOf(['warning', 'info', 'error']),
};

export default MaintenanceBanner;
