import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StreamingResultCard from '../StreamingResultCard';

// Mock streamingServices
jest.mock('../../services/streamingServices');

// Mock CSS
jest.mock('../StreamingResultCard.css', () => ({}));

describe('StreamingResultCard', () => {
  const mockMovieContent = {
    id: 1,
    title: 'Test Movie',
    type: 'movie',
    poster_path: '/test-poster.jpg',
    release_date: '2024-01-15',
    vote_average: 8.5,
    overview:
      'This is a test movie overview that is long enough to be truncated when displayed in the card to ensure proper formatting.',
  };

  const mockTVContent = {
    id: 2,
    title: 'Test TV Show',
    type: 'tv',
    poster_path: '/test-poster-2.jpg',
    release_date: '2023-06-20',
    vote_average: 7.2,
    overview: 'Short overview',
  };

  const mockOnPlay = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock streamingServices.getAllStreamingUrls
    require('../../services/streamingServices').default.getAllStreamingUrls = jest.fn(() => ({
      server1: 'https://vidsrc-embed.ru/embed/movie?tmdb=1',
      server2: 'https://vidsrc-embed.su/embed/movie?tmdb=1',
      server3: 'https://vidsrcme.su/embed/movie?tmdb=1',
      server4: 'https://vsrc.su/embed/movie?tmdb=1',
      server5: 'https://player.videasy.to/embed/movie?tmdb=1',
    }));
  });

  test('renders card with movie content', () => {
    render(<StreamingResultCard content={mockMovieContent} onPlay={mockOnPlay} />);

    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('8.5')).toBeInTheDocument();
    expect(screen.getByText('Movie')).toBeInTheDocument();
  });

  test('renders card with TV show content', () => {
    render(<StreamingResultCard content={mockTVContent} onPlay={mockOnPlay} />);

    expect(screen.getByText('Test TV Show')).toBeInTheDocument();
    expect(screen.getByText('TV')).toBeInTheDocument();
  });

  test('renders poster image when poster_path exists', () => {
    render(<StreamingResultCard content={mockMovieContent} onPlay={mockOnPlay} />);

    const image = screen.getByAltText('Test Movie');
    expect(image).toBeInTheDocument();
    // Next.js Image rewrites src through its optimizer
    expect(image.getAttribute('src')).toContain('test-poster.jpg');
  });

  test('renders placeholder when poster_path is null', () => {
    const contentWithoutPoster = {
      ...mockMovieContent,
      poster_path: null,
    };

    render(<StreamingResultCard content={contentWithoutPoster} onPlay={mockOnPlay} />);

    expect(screen.queryByAltText('Test Movie')).not.toBeInTheDocument();
    const placeholder = screen
      .getByText('Test Movie')
      .closest('.streaming-result-card')
      .querySelector('.streaming-result-card__placeholder');
    expect(placeholder).toBeInTheDocument();
  });

  test('handles image load event', async () => {
    render(<StreamingResultCard content={mockMovieContent} onPlay={mockOnPlay} />);

    const image = screen.getByAltText('Test Movie');
    fireEvent.load(image);

    // State update triggers re-render — wait for the class to appear
    await waitFor(() => {
      expect(image).toHaveClass('loaded');
    });
  });

  test('handles image error event', async () => {
    render(<StreamingResultCard content={mockMovieContent} onPlay={mockOnPlay} />);

    const image = screen.getByAltText('Test Movie');
    fireEvent.error(image);

    // After error, placeholder should be shown
    await waitFor(() => {
      const placeholder = screen
        .getByText('Test Movie')
        .closest('.streaming-result-card')
        .querySelector('.streaming-result-card__placeholder');
      expect(placeholder).toBeInTheDocument();
    });
  });

  test('truncates long overview text', () => {
    render(<StreamingResultCard content={mockMovieContent} onPlay={mockOnPlay} />);

    const overview = screen.getByText(/This is a test movie overview/);
    expect(overview.textContent).toContain('...');
    expect(overview.textContent.length).toBeLessThanOrEqual(123); // 120 chars + "..."
  });

  test('displays short overview without truncation', () => {
    render(<StreamingResultCard content={mockTVContent} onPlay={mockOnPlay} />);

    const overview = screen.getByText('Short overview');
    expect(overview.textContent).not.toContain('...');
  });

  test('renders play button', () => {
    render(<StreamingResultCard content={mockMovieContent} onPlay={mockOnPlay} />);

    expect(screen.getByTitle('Play')).toBeInTheDocument();
  });

  test('calls onPlay when Play button is clicked', () => {
    render(<StreamingResultCard content={mockMovieContent} onPlay={mockOnPlay} />);

    const playButton = screen.getByTitle('Play');
    fireEvent.click(playButton);

    expect(mockOnPlay).toHaveBeenCalledWith(mockMovieContent, 'server1', expect.any(String));
  });

  test('handles content without release date', () => {
    const contentWithoutDate = {
      ...mockMovieContent,
      release_date: null,
    };

    render(<StreamingResultCard content={contentWithoutDate} onPlay={mockOnPlay} />);

    expect(screen.queryByText('2024')).not.toBeInTheDocument();
  });

  test('handles content without rating', () => {
    const contentWithoutRating = {
      ...mockMovieContent,
      vote_average: null,
    };

    render(<StreamingResultCard content={contentWithoutRating} onPlay={mockOnPlay} />);

    expect(screen.queryByText('8.5')).not.toBeInTheDocument();
  });

  test('handles content without overview', () => {
    const contentWithoutOverview = {
      ...mockMovieContent,
      overview: null,
    };

    render(<StreamingResultCard content={contentWithoutOverview} onPlay={mockOnPlay} />);

    expect(screen.queryByText(/This is a test/)).not.toBeInTheDocument();
  });

  test('displays title with title attribute', () => {
    render(<StreamingResultCard content={mockMovieContent} onPlay={mockOnPlay} />);

    const titleElement = screen.getByText('Test Movie');
    expect(titleElement).toHaveAttribute('title', 'Test Movie');
  });

  test('rounds rating to one decimal place', () => {
    const contentWithPreciseRating = {
      ...mockMovieContent,
      vote_average: 8.567,
    };

    render(<StreamingResultCard content={contentWithPreciseRating} onPlay={mockOnPlay} />);

    expect(screen.getByText('8.6')).toBeInTheDocument();
  });

  test('extracts year from release date correctly', () => {
    const contentWithDifferentDate = {
      ...mockMovieContent,
      release_date: '2020-12-25',
    };

    render(<StreamingResultCard content={contentWithDifferentDate} onPlay={mockOnPlay} />);

    expect(screen.getByText('2020')).toBeInTheDocument();
  });

  test('does not call onPlay when onPlay is not provided', () => {
    render(<StreamingResultCard content={mockMovieContent} />);

    const playButton = screen.getByTitle('Play');
    fireEvent.click(playButton);

    // Should not throw error
    expect(mockOnPlay).not.toHaveBeenCalled();
  });

  test('renders all metadata elements when all data is present', () => {
    render(<StreamingResultCard content={mockMovieContent} onPlay={mockOnPlay} />);

    // Check that year, rating, and type are all present
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('8.5')).toBeInTheDocument();
    expect(screen.getByText('Movie')).toBeInTheDocument();
  });

  test('applies correct CSS classes', () => {
    const { container } = render(
      <StreamingResultCard content={mockMovieContent} onPlay={mockOnPlay} />
    );

    expect(container.querySelector('.streaming-result-card')).toBeInTheDocument();
    expect(container.querySelector('.streaming-result-card__poster')).toBeInTheDocument();
    expect(container.querySelector('.streaming-result-card__info')).toBeInTheDocument();
    expect(container.querySelector('.streaming-result-card__meta')).toBeInTheDocument();
  });

  describe('Simplified Play Button Coverage', () => {
    test('should render single Play button instead of multiple server buttons', () => {
      render(<StreamingResultCard content={mockMovieContent} onPlay={mockOnPlay} />);

      const playButton = screen.getByRole('button', { name: /play/i });
      expect(playButton).toBeInTheDocument();
    });

    test('should call onPlay with Server 1 when Play button clicked', () => {
      const mockStreamingServices = require('../../services/streamingServices');
      mockStreamingServices.getAllStreamingUrls = jest.fn(() => ({
        server1: 'https://vidsrc-embed.ru/embed/movie?tmdb=1',
        server2: 'https://vidsrc-embed.su/embed/movie?tmdb=1',
        server3: 'https://vidsrcme.su/embed/movie?tmdb=1',
        server4: 'https://vsrc.su/embed/movie?tmdb=1',
        server5: 'https://player.videasy.to/embed/movie?tmdb=1',
      }));

      render(<StreamingResultCard content={mockMovieContent} onPlay={mockOnPlay} />);

      const playButton = screen.getByRole('button', { name: /play/i });
      fireEvent.click(playButton);

      expect(mockOnPlay).toHaveBeenCalledWith(
        mockMovieContent,
        'server1',
        expect.stringContaining('vidsrc-embed.ru')
      );
    });

    test('should pass correct server URL to onPlay', () => {
      const mockStreamingServices = require('../../services/streamingServices');
      const mockUrl = 'https://vidsrc-embed.ru/embed/movie?tmdb=1';
      mockStreamingServices.getAllStreamingUrls = jest.fn(() => ({
        server1: mockUrl,
        server2: 'https://vidsrc-embed.su/embed/movie?tmdb=1',
        server3: 'https://vidsrcme.su/embed/movie?tmdb=1',
        server4: 'https://vsrc.su/embed/movie?tmdb=1',
        server5: 'https://player.videasy.to/embed/movie?tmdb=1',
      }));

      render(<StreamingResultCard content={mockMovieContent} onPlay={mockOnPlay} />);

      const playButton = screen.getByRole('button', { name: /play/i });
      fireEvent.click(playButton);

      expect(mockOnPlay).toHaveBeenCalledWith(mockMovieContent, 'server1', mockUrl);
    });

    test('should have proper button styling and accessibility', () => {
      const { container } = render(
        <StreamingResultCard content={mockMovieContent} onPlay={mockOnPlay} />
      );

      const playButton = container.querySelector('.streaming-result-card__play-btn');
      expect(playButton).toBeInTheDocument();
      expect(playButton).toHaveAttribute('title', 'Play');
    });

    test('should render Play button for TV shows', () => {
      render(<StreamingResultCard content={mockTVContent} onPlay={mockOnPlay} />);

      const playButton = screen.getByRole('button', { name: /play/i });
      expect(playButton).toBeInTheDocument();
    });

    test('should handle Play button click for TV shows', () => {
      const mockStreamingServices = require('../../services/streamingServices');
      mockStreamingServices.getAllStreamingUrls = jest.fn(() => ({
        server1: 'https://vidsrc-embed.ru/embed/tv?tmdb=2',
        server2: 'https://vidsrc-embed.su/embed/tv?tmdb=2',
        server3: 'https://vidsrcme.su/embed/tv?tmdb=2',
        server4: 'https://vsrc.su/embed/tv?tmdb=2',
        server5: 'https://player.videasy.to/embed/tv?tmdb=2',
      }));

      render(<StreamingResultCard content={mockTVContent} onPlay={mockOnPlay} />);

      const playButton = screen.getByRole('button', { name: /play/i });
      fireEvent.click(playButton);

      expect(mockOnPlay).toHaveBeenCalledWith(
        mockTVContent,
        'server1',
        expect.stringContaining('vidsrc-embed.ru')
      );
    });

    test('should only render one Play button', () => {
      render(<StreamingResultCard content={mockMovieContent} onPlay={mockOnPlay} />);

      const playButtons = screen.getAllByRole('button', { name: /play/i });
      expect(playButtons).toHaveLength(1);
    });

    test('Play button should be in overlay', () => {
      const { container } = render(
        <StreamingResultCard content={mockMovieContent} onPlay={mockOnPlay} />
      );

      const overlay = container.querySelector('.streaming-result-card__overlay');
      const playButton = overlay?.querySelector('.streaming-result-card__play-btn');
      expect(playButton).toBeInTheDocument();
    });
  });
});
