import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../utils';
import './ThemeToggle.css';

/**
 * Theme Toggle Button Component
 * Allows users to switch between light and dark themes
 * Uses lucide-react icons (Sun for light mode, Moon for dark mode)
 */
const ThemeToggle = () => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun className="theme-toggle__icon" size={20} />
      ) : (
        <Moon className="theme-toggle__icon" size={20} />
      )}
    </button>
  );
};

export default ThemeToggle;
