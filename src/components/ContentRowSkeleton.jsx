import PropTypes from 'prop-types';
import StreamingResultCardSkeleton from './StreamingResultCardSkeleton';
import './ContentRowSkeleton.css';

const ContentRowSkeleton = ({ title = 'Loading...', cardCount = 6, showOverview = false }) => {
  return (
    <div className="content-row-skeleton">
      <h2 className="content-row-skeleton__title">
        {title}
        <span className="content-row-skeleton__title-shimmer"></span>
      </h2>

      <div className="content-row-skeleton__container">
        <div className="content-row-skeleton__scroll">
          {Array.from({ length: cardCount }).map((_, index) => (
            <div key={index} className="content-row-skeleton__item">
              <StreamingResultCardSkeleton showOverview={showOverview} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

ContentRowSkeleton.propTypes = {
  title: PropTypes.string,
  cardCount: PropTypes.number,
  showOverview: PropTypes.bool,
};

export default ContentRowSkeleton;
