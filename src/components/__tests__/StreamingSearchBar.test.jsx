import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import StreamingSearchBar from '../StreamingSearchBar';

jest.mock('../StreamingSearchBar.css', () => ({}));

describe('StreamingSearchBar', () => {
  const mockOnSearch = jest.fn(() => Promise.resolve());
  const mockOnClear = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(async () => {
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  test('renders with default placeholder', () => {
    render(<StreamingSearchBar onSearch={mockOnSearch} />);

    expect(screen.getByPlaceholderText(/Search for movies, TV shows, anime/)).toBeInTheDocument();
  });

  test('renders with custom placeholder', () => {
    render(<StreamingSearchBar onSearch={mockOnSearch} placeholder="Custom placeholder" />);

    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  test('calls onSearch after debounce delay', async () => {
    render(<StreamingSearchBar onSearch={mockOnSearch} debounceMs={300} />);

    const input = screen.getByPlaceholderText(/Search for movies/);
    fireEvent.change(input, { target: { value: 'avengers' } });

    expect(mockOnSearch).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('avengers');
    });
  });

  test('debounces multiple rapid inputs', async () => {
    render(<StreamingSearchBar onSearch={mockOnSearch} debounceMs={300} />);

    const input = screen.getByPlaceholderText(/Search for movies/);

    fireEvent.change(input, { target: { value: 'a' } });
    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    fireEvent.change(input, { target: { value: 'av' } });
    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    fireEvent.change(input, { target: { value: 'ave' } });
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith('ave');
    });
  });

  test('calls onClear when input is cleared', async () => {
    render(<StreamingSearchBar onSearch={mockOnSearch} onClear={mockOnClear} debounceMs={300} />);

    const input = screen.getByPlaceholderText(/Search for movies/);

    fireEvent.change(input, { target: { value: 'test' } });
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    fireEvent.change(input, { target: { value: '' } });
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockOnClear).toHaveBeenCalled();
    });
  });

  test('shows clear button when input has value', () => {
    render(<StreamingSearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/Search for movies/);
    fireEvent.change(input, { target: { value: 'test' } });

    const clearButton = screen.getByRole('button', { name: 'Clear search' });
    expect(clearButton).toBeInTheDocument();
  });

  test('does not show clear button when input is empty', () => {
    render(<StreamingSearchBar onSearch={mockOnSearch} />);

    const clearButton = screen.queryByRole('button', { name: 'Clear search' });
    expect(clearButton).not.toBeInTheDocument();
  });

  test('clears input when clear button is clicked', () => {
    render(<StreamingSearchBar onSearch={mockOnSearch} onClear={mockOnClear} />);

    const input = screen.getByPlaceholderText(/Search for movies/);
    fireEvent.change(input, { target: { value: 'test' } });

    const clearButton = screen.getByRole('button', { name: 'Clear search' });
    fireEvent.click(clearButton);

    expect(input.value).toBe('');
    expect(mockOnClear).toHaveBeenCalled();
  });

  test('submits search on form submit', async () => {
    render(<StreamingSearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/Search for movies/);
    fireEvent.change(input, { target: { value: 'test query' } });

    const form = input.closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test query');
    });
  });

  test('does not submit empty search', () => {
    render(<StreamingSearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/Search for movies/);
    const form = input.closest('form');

    fireEvent.submit(form);

    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  test('trims whitespace from search query', async () => {
    render(<StreamingSearchBar onSearch={mockOnSearch} debounceMs={300} />);

    const input = screen.getByPlaceholderText(/Search for movies/);
    fireEvent.change(input, { target: { value: '  test query  ' } });

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test query');
    });
  });

  test('shows loading spinner when searching', async () => {
    const slowSearch = jest.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));
    render(<StreamingSearchBar onSearch={slowSearch} debounceMs={100} />);

    const input = screen.getByPlaceholderText(/Search for movies/);
    fireEvent.change(input, { target: { value: 'test' } });

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(document.querySelector('.streaming-search-bar__loading')).toBeInTheDocument();
    });
  });

  test('applies autoFocus when autoFocus is true', () => {
    render(<StreamingSearchBar onSearch={mockOnSearch} autoFocus={true} />);

    const input = screen.getByPlaceholderText(/Search for movies/);
    expect(input).toHaveFocus();
  });

  test('does not apply autoFocus when autoFocus is false', () => {
    render(<StreamingSearchBar onSearch={mockOnSearch} autoFocus={false} />);

    const input = screen.getByPlaceholderText(/Search for movies/);
    expect(input).not.toHaveFocus();
  });

  test('cleans up debounce timer on unmount', async () => {
    const { unmount } = render(<StreamingSearchBar onSearch={mockOnSearch} debounceMs={300} />);

    const input = screen.getByPlaceholderText(/Search for movies/);
    fireEvent.change(input, { target: { value: 'test' } });

    unmount();

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(mockOnSearch).not.toHaveBeenCalled();
  });
});
