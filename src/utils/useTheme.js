import { useState, useEffect } from 'react';

/**
 * Custom hook for managing theme (light/dark mode)
 * Features:
 * - Detects system preference on initial load
 * - Persists user preference in localStorage
 * - Allows manual override of system preference
 * - Applies theme to document root element
 */

const THEME_STORAGE_KEY = 'skystream-theme';
const THEME_ATTRIBUTE = 'data-theme';

// Get initial theme based on localStorage or system preference
const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark';

  // Check localStorage first
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  // Fall back to system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  // Default to dark theme (Netflix-inspired)
  return 'dark';
};

// Apply theme to document
const applyTheme = theme => {
  document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
};

export const useTheme = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = e => {
      // Only update if user hasn't manually set a preference
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (!storedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Toggle between light and dark
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Set specific theme
  const setThemeMode = newTheme => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setTheme(newTheme);
    }
  };

  return {
    theme,
    toggleTheme,
    setTheme: setThemeMode,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
};

export default useTheme;
