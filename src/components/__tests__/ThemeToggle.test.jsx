import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from '../ThemeToggle';
import { useTheme } from '../../utils';

jest.mock('../../utils');
jest.mock('../ThemeToggle.css', () => ({}));

describe('ThemeToggle', () => {
  const mockToggleTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders sun icon in dark mode', () => {
    useTheme.mockReturnValue({
      isDark: true,
      toggleTheme: mockToggleTheme,
    });

    const { container } = render(<ThemeToggle />);

    expect(container.querySelector('.theme-toggle__icon')).toBeInTheDocument();
  });

  test('renders moon icon in light mode', () => {
    useTheme.mockReturnValue({
      isDark: false,
      toggleTheme: mockToggleTheme,
    });

    const { container } = render(<ThemeToggle />);

    expect(container.querySelector('.theme-toggle__icon')).toBeInTheDocument();
  });

  test('calls toggleTheme when clicked', () => {
    useTheme.mockReturnValue({
      isDark: false,
      toggleTheme: mockToggleTheme,
    });

    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  test('has correct aria-label in dark mode', () => {
    useTheme.mockReturnValue({
      isDark: true,
      toggleTheme: mockToggleTheme,
    });

    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  test('has correct aria-label in light mode', () => {
    useTheme.mockReturnValue({
      isDark: false,
      toggleTheme: mockToggleTheme,
    });

    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
  });
});
