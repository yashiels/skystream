import './FeaturedHeroSkeleton.css';

const FeaturedHeroSkeleton = () => (
  <div className="featured-hero-skeleton" aria-busy="true" aria-label="Loading featured content">
    <div className="featured-hero-skeleton__shimmer" />
    <div className="featured-hero-skeleton__gradient" />

    <div className="featured-hero-skeleton__content">
      <div className="featured-hero-skeleton__title" />
      <div className="featured-hero-skeleton__title featured-hero-skeleton__title--second" />

      <div className="featured-hero-skeleton__meta">
        <div className="featured-hero-skeleton__badge" />
        <div className="featured-hero-skeleton__badge" />
        <div className="featured-hero-skeleton__badge" />
      </div>

      <div className="featured-hero-skeleton__overview" />
      <div className="featured-hero-skeleton__overview featured-hero-skeleton__overview--short" />

      <div className="featured-hero-skeleton__buttons">
        <div className="featured-hero-skeleton__btn" />
        <div className="featured-hero-skeleton__btn featured-hero-skeleton__btn--secondary" />
      </div>
    </div>

    <div className="featured-hero-skeleton__dots">
      <div className="featured-hero-skeleton__dot featured-hero-skeleton__dot--active" />
      <div className="featured-hero-skeleton__dot" />
      <div className="featured-hero-skeleton__dot" />
      <div className="featured-hero-skeleton__dot" />
      <div className="featured-hero-skeleton__dot" />
    </div>
  </div>
);

export default FeaturedHeroSkeleton;
