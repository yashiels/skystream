import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import StreamingResultCard from './StreamingResultCard';
import './ContentRow.css';

const ContentRow = ({ title, content, onPlay }) => {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollContainerRef = useRef(null);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = direction => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
    const newScrollLeft =
      direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;

    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  };

  if (!content || content.length === 0) {
    return null;
  }

  return (
    <div className="content-row">
      <h2 className="content-row__title">{title}</h2>

      <div className="content-row__container">
        {showLeftArrow && (
          <button
            className="content-row__arrow content-row__arrow--left"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft size={32} />
          </button>
        )}

        <div className="content-row__scroll" ref={scrollContainerRef} onScroll={handleScroll}>
          {content.map(item => (
            <div key={`${item.type}-${item.id}`} className="content-row__item">
              <StreamingResultCard content={item} onPlay={onPlay} />
            </div>
          ))}
        </div>

        {showRightArrow && (
          <button
            className="content-row__arrow content-row__arrow--right"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <ChevronRight size={32} />
          </button>
        )}
      </div>
    </div>
  );
};

ContentRow.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
    })
  ).isRequired,
  onPlay: PropTypes.func.isRequired,
};

export default ContentRow;
