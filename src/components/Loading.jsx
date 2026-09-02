import PropTypes from 'prop-types';
import './Loading.css';

const Loading = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClass = `loading--${size}`;

  return (
    <div className={`loading ${sizeClass}`}>
      <div className="loading__spinner">
        <div className="loading__dot"></div>
        <div className="loading__dot"></div>
        <div className="loading__dot"></div>
      </div>
      {text && <p className="loading__text">{text}</p>}
    </div>
  );
};

Loading.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  text: PropTypes.string,
};

export default Loading;
