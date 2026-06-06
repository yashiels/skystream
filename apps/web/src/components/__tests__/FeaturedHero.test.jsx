import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import FeaturedHero from '../FeaturedHero';

// Mock streamingServices
jest.mock('../../services/streamingServices');

// Mock CSS
jest.mock('../FeaturedHero.css', () => ({}));

describe('FeaturedHero', () => {
  const mockContent = [
    {
      id: 1,
      title: 'Test Movie',
      type: 'movie',
      backdrop_path: '/test-backdrop.jpg',
      release_date: '2024-01-15',
      vote_average: 8.5,
      overview:
        'This is a test movie overview that is long enough to be truncated when displayed in the hero section. It needs to be over 200 characters to trigger the truncation logic in the FeaturedHero component, so we add more text here to make it longer and longer until it exceeds the limit.',
    },
    {
      id: 2,
      title: 'Test TV Show',
      type: 'tv',
      backdrop_path: '/test-backdrop-2.jpg',
      release_date: '2023-06-20',
      vote_average: 7.2,
      overview: 'Short overview',
    },
  ];

  const mockOnPlay = jest.fn();
  const mockOnInfo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Mock streamingServices.getAllStreamingUrls
    require('../../services/streamingServices').default.getAllStreamingUrls = jest.fn(() => ({
      server1: 'https://vidsrc-embed.ru/embed/movie?tmdb=1',
      server2: 'https://vidsrc-embed.su/embed/movie?tmdb=1',
      server3: 'https://vidsrcme.su/embed/movie?tmdb=1',
      server4: 'https://vsrc.su/embed/movie?tmdb=1',
      server5: `${require('@skystream/shared').PLAYER_DEFAULTS.videasyBaseUrl}/embed/movie?tmdb=1`,
    }));
    // Suppress act() warnings for this test suite - the component's setInterval
    // will naturally cause act() warnings in tests, which is expected behavior
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    console.error.mockRestore();
  });

  test('renders nothing when content is null', () => {
    const { container } = render(<FeaturedHero content={null} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders nothing when content is empty array', () => {
    const { container } = render(<FeaturedHero content={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders hero with single content item', () => {
    render(<FeaturedHero content={[mockContent[0]]} onPlay={mockOnPlay} />);

    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('8.5')).toBeInTheDocument();
    expect(screen.getByText('Movie')).toBeInTheDocument();
  });

  test('renders TV show type correctly', () => {
    render(<FeaturedHero content={[mockContent[1]]} onPlay={mockOnPlay} />);

    expect(screen.getByText('TV Show')).toBeInTheDocument();
  });

  test('truncates long overview text', () => {
    render(<FeaturedHero content={[mockContent[0]]} onPlay={mockOnPlay} />);

    const overview = screen.getByText(/This is a test movie overview/);
    expect(overview.textContent).toContain('...');
    expect(overview.textContent.length).toBeLessThanOrEqual(203); // 200 chars + "..."
  });

  test('displays short overview without truncation', () => {
    render(<FeaturedHero content={[mockContent[1]]} onPlay={mockOnPlay} />);

    const overview = screen.getByText('Short overview');
    expect(overview.textContent).not.toContain('...');
  });

  test('renders play button', () => {
    render(<FeaturedHero content={[mockContent[0]]} onPlay={mockOnPlay} />);

    expect(screen.getByText('Play')).toBeInTheDocument();
  });

  test('calls onPlay when Play button is clicked', () => {
    render(<FeaturedHero content={[mockContent[0]]} onPlay={mockOnPlay} />);

    const playButton = screen.getByText('Play');
    fireEvent.click(playButton);

    expect(mockOnPlay).toHaveBeenCalledWith(mockContent[0], 'server1', expect.any(String));
  });

  test('renders More Info button when onInfo is provided', () => {
    render(<FeaturedHero content={[mockContent[0]]} onPlay={mockOnPlay} onInfo={mockOnInfo} />);

    expect(screen.getByText('More Info')).toBeInTheDocument();
  });

  test('does not render More Info button when onInfo is not provided', () => {
    render(<FeaturedHero content={[mockContent[0]]} onPlay={mockOnPlay} />);

    expect(screen.queryByText('More Info')).not.toBeInTheDocument();
  });

  test('calls onInfo when More Info button is clicked', () => {
    render(<FeaturedHero content={[mockContent[0]]} onPlay={mockOnPlay} onInfo={mockOnInfo} />);

    const infoButton = screen.getByText('More Info');
    fireEvent.click(infoButton);

    expect(mockOnInfo).toHaveBeenCalledWith(mockContent[0]);
  });

  test('renders indicators when multiple content items exist', () => {
    render(<FeaturedHero content={mockContent} onPlay={mockOnPlay} />);

    const indicators = screen.getAllByRole('button', { name: /Go to slide/ });
    expect(indicators).toHaveLength(2);
  });

  test('does not render indicators for single content item', () => {
    render(<FeaturedHero content={[mockContent[0]]} onPlay={mockOnPlay} />);

    const indicators = screen.queryAllByRole('button', { name: /Go to slide/ });
    expect(indicators).toHaveLength(0);
  });

  test('changes content when indicator is clicked', async () => {
    render(<FeaturedHero content={mockContent} onPlay={mockOnPlay} />);

    expect(screen.getByText('Test Movie')).toBeInTheDocument();

    const secondIndicator = screen.getByRole('button', { name: 'Go to slide 2' });
    fireEvent.click(secondIndicator);

    // Fast-forward the transition timeout
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText('Test TV Show')).toBeInTheDocument();
    });
  });

  test('handles content without release date', () => {
    const contentWithoutDate = [
      {
        ...mockContent[0],
        release_date: null,
      },
    ];

    render(<FeaturedHero content={contentWithoutDate} onPlay={mockOnPlay} />);

    expect(screen.queryByText('2024')).not.toBeInTheDocument();
  });

  test('handles content without rating', () => {
    const contentWithoutRating = [
      {
        ...mockContent[0],
        vote_average: null,
      },
    ];

    render(<FeaturedHero content={contentWithoutRating} onPlay={mockOnPlay} />);

    expect(screen.queryByText('8.5')).not.toBeInTheDocument();
  });

  test('handles content without overview', () => {
    const contentWithoutOverview = [
      {
        ...mockContent[0],
        overview: null,
      },
    ];

    render(<FeaturedHero content={contentWithoutOverview} onPlay={mockOnPlay} />);

    expect(screen.queryByText(/This is a test/)).not.toBeInTheDocument();
  });

  test('handles content without backdrop path', () => {
    const contentWithoutBackdrop = [
      {
        ...mockContent[0],
        backdrop_path: null,
      },
    ];

    render(<FeaturedHero content={contentWithoutBackdrop} onPlay={mockOnPlay} />);

    expect(screen.getByText('Test Movie')).toBeInTheDocument();
  });

  test('auto-rotates content after 8 seconds', async () => {
    render(<FeaturedHero content={mockContent} onPlay={mockOnPlay} />);

    expect(screen.getByText('Test Movie')).toBeInTheDocument();

    // Fast-forward 8 seconds + transition time
    act(() => {
      jest.advanceTimersByTime(8300);
    });

    await waitFor(() => {
      expect(screen.getByText('Test TV Show')).toBeInTheDocument();
    });
  });

  test('does not auto-rotate with single content item', () => {
    render(<FeaturedHero content={[mockContent[0]]} onPlay={mockOnPlay} />);

    expect(screen.getByText('Test Movie')).toBeInTheDocument();

    // Fast-forward 10 seconds
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    // Should still show the same content
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
  });
});
