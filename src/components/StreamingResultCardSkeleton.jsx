import PropTypes from 'prop-types';
import './StreamingResultCardSkeleton.css';

const StreamingResultCardSkeleton = ({ showOverview = true }) => {
  return (
    <div className="streaming-result-card-skeleton">
      <div className="streaming-result-card-skeleton__poster">
        <div className="streaming-result-card-skeleton__shimmer"></div>
      </div>

      <div className="streaming-result-card-skeleton__info">
        <div className="streaming-result-card-skeleton__title">
          <div className="streaming-result-card-skeleton__shimmer"></div>
        </div>

        <div className="streaming-result-card-skeleton__meta">
          <div className="streaming-result-card-skeleton__meta-item">
            <div className="streaming-result-card-skeleton__shimmer"></div>
          </div>
          <div className="streaming-result-card-skeleton__meta-item">
            <div className="streaming-result-card-skeleton__shimmer"></div>
          </div>
          <div className="streaming-result-card-skeleton__meta-item streaming-result-card-skeleton__meta-item--type">
            <div className="streaming-result-card-skeleton__shimmer"></div>
          </div>
        </div>

        {showOverview && (
          <div className="streaming-result-card-skeleton__overview">
            <div className="streaming-result-card-skeleton__overview-line">
              <div className="streaming-result-card-skeleton__shimmer"></div>
            </div>
            <div className="streaming-result-card-skeleton__overview-line">
              <div className="streaming-result-card-skeleton__shimmer"></div>
            </div>
            <div className="streaming-result-card-skeleton__overview-line streaming-result-card-skeleton__overview-line--short">
              <div className="streaming-result-card-skeleton__shimmer"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

StreamingResultCardSkeleton.propTypes = {
  showOverview: PropTypes.bool,
};

export default StreamingResultCardSkeleton;
