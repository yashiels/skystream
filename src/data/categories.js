// Category list for Live TV channel selection
// Based on TV Garden API: https://github.com/TVGarden/tv-garden-channel-list

export const CATEGORIES = [
  // Popular categories (top of list)
  { code: 'news', name: 'News', icon: '📰' },
  { code: 'sports', name: 'Sports', icon: '⚽' },
  { code: 'movies', name: 'Movies', icon: '🎬' },
  { code: 'entertainment', name: 'Entertainment', icon: '🎭' },
  { code: 'music', name: 'Music', icon: '🎵' },
  { code: 'kids', name: 'Kids', icon: '👶' },

  // Separator
  { code: 'separator', name: '---', icon: '' },

  // All categories (alphabetically)
  { code: 'all-channels', name: 'All Channels', icon: '📺' },
  { code: 'animation', name: 'Animation', icon: '🎨' },
  { code: 'auto', name: 'Auto', icon: '🚗' },
  { code: 'business', name: 'Business', icon: '💼' },
  { code: 'classic', name: 'Classic', icon: '🎞️' },
  { code: 'comedy', name: 'Comedy', icon: '😂' },
  { code: 'cooking', name: 'Cooking', icon: '🍳' },
  { code: 'culture', name: 'Culture', icon: '🎭' },
  { code: 'documentary', name: 'Documentary', icon: '📽️' },
  { code: 'education', name: 'Education', icon: '📚' },
  { code: 'family', name: 'Family', icon: '👨‍👩‍👧‍👦' },
  { code: 'general', name: 'General', icon: '📡' },
  { code: 'legislative', name: 'Legislative', icon: '🏛️' },
  { code: 'lifestyle', name: 'Lifestyle', icon: '✨' },
  { code: 'outdoor', name: 'Outdoor', icon: '🏕️' },
  { code: 'public', name: 'Public', icon: '🌐' },
  { code: 'relax', name: 'Relax', icon: '🧘' },
  { code: 'religious', name: 'Religious', icon: '🙏' },
  { code: 'science', name: 'Science', icon: '🔬' },
  { code: 'series', name: 'Series', icon: '📺' },
  { code: 'shop', name: 'Shop', icon: '🛍️' },
  { code: 'show', name: 'Show', icon: '🎪' },
  { code: 'top-news', name: 'Top News', icon: '🔥' },
  { code: 'travel', name: 'Travel', icon: '✈️' },
  { code: 'weather', name: 'Weather', icon: '🌤️' },
];

// Default category
export const DEFAULT_CATEGORY = 'all-channels';

// Get category by code
export const getCategoryByCode = code => {
  return CATEGORIES.find(category => category.code === code);
};

// Get category name by code
export const getCategoryName = code => {
  const category = getCategoryByCode(code);
  return category ? category.name : 'Unknown';
};

// Get category icon by code
export const getCategoryIcon = code => {
  const category = getCategoryByCode(code);
  return category ? category.icon : '📺';
};
