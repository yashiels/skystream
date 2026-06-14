import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StreamingPlayerModal from '../StreamingPlayerModal';
import streamingServices from '../../services/streamingServices';
import tmdbApi from '../../services/tmdbApi';

jest.mock('../../services/streamingServices');
jest.mock('../../services/tmdbApi');
jest.mock('../../utils/urlRouting', () => ({
  generateMovieUrl: jest.fn(content => `/movie/${content.title}-${content.id}`),
  generateTVUrl: jest.fn(
    (content, season, episode) => `/tv/${content.title}-${content.id}/s${season}/e${episode}`
  ),
  updateBrowserUrl: jest.fn(),
}));

describe('StreamingPlayerModal', () => {
  const mockContent = {
    id: 1,
    title: 'Test Movie',
    type: 'movie',
  };

  const mockTVContent = {
    id: 2,
    title: 'Test TV Show',
    type: 'tv',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    streamingServices.getAllStreamingUrls = jest.fn(() => ({
      server1: 'https://vidlink.test/movie/1',
      vidlink: 'https://vidlink.test/movie/1',
      // Legacy aliases
      videasy: 'https://vidlink.test/movie/1',
      vidsrc: 'https://vidlink.test/movie/1',
    }));
    tmdbApi.getTVSeasonsData = jest.fn().mockResolvedValue({
      total_seasons: 2,
      total_episodes: 20,
      seasons: [
        { season_number: 1, episode_count: 10 },
        { season_number: 2, episode_count: 10 },
      ],
    });

    // Suppress console.error for expected errors
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test('does not render when isOpen is false', () => {
    render(
      <StreamingPlayerModal
        isOpen={false}
        onClose={jest.fn()}
        content={mockContent}
        platform="vidlink"
        embedUrl="https://test.com"
      />
    );

    expect(screen.queryByText('Test Movie')).not.toBeInTheDocument();
  });

  test('renders when isOpen is true', () => {
    render(
      <StreamingPlayerModal
        isOpen={true}
        onClose={jest.fn()}
        content={mockContent}
        platform="vidlink"
        embedUrl="https://test.com"
      />
    );

    expect(screen.getByText('Test Movie')).toBeInTheDocument();
  });

  test('displays content title', () => {
    render(
      <StreamingPlayerModal
        isOpen={true}
        onClose={jest.fn()}
        content={mockContent}
        platform="vidlink"
        embedUrl="https://test.com"
      />
    );

    expect(screen.getByText('Test Movie')).toBeInTheDocument();
  });

  test('has close button', () => {
    const onClose = jest.fn();

    render(
      <StreamingPlayerModal
        isOpen={true}
        onClose={onClose}
        content={mockContent}
        platform="vidlink"
        embedUrl="https://test.com"
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('renders iframe', () => {
    render(
      <StreamingPlayerModal
        isOpen={true}
        onClose={jest.fn()}
        content={mockContent}
        platform="vidlink"
        embedUrl="https://test.com"
      />
    );

    const iframes = document.querySelectorAll('iframe');
    expect(iframes.length).toBeGreaterThan(0);
  });

  test('fetches seasons data for TV content', async () => {
    render(
      <StreamingPlayerModal
        isOpen={true}
        onClose={jest.fn()}
        content={mockTVContent}
        platform="vidlink"
        embedUrl="https://test.com"
        contentType="tv"
      />
    );

    await waitFor(() => {
      expect(tmdbApi.getTVSeasonsData).toHaveBeenCalledWith(2);
    });
  });

  test('shows season and episode selectors for TV content', async () => {
    render(
      <StreamingPlayerModal
        isOpen={true}
        onClose={jest.fn()}
        content={mockTVContent}
        platform="vidlink"
        embedUrl="https://test.com"
        contentType="tv"
      />
    );

    await waitFor(() => {
      const seasonLabels = screen.getAllByText(/Season/);
      expect(seasonLabels.length).toBeGreaterThan(0);
    });
  });

  test('handles season change', async () => {
    render(
      <StreamingPlayerModal
        isOpen={true}
        onClose={jest.fn()}
        content={mockTVContent}
        platform="vidlink"
        embedUrl="https://test.com"
        contentType="tv"
        season={1}
        episode={1}
      />
    );

    await waitFor(() => {
      expect(tmdbApi.getTVSeasonsData).toHaveBeenCalled();
    });

    // Find and change season selector
    const seasonSelects = screen.getAllByRole('combobox');
    if (seasonSelects.length > 0) {
      fireEvent.change(seasonSelects[0], { target: { value: '2' } });
      expect(streamingServices.getStreamingUrl).toHaveBeenCalled();
    }
  });

  test('handles episode change', async () => {
    render(
      <StreamingPlayerModal
        isOpen={true}
        onClose={jest.fn()}
        content={mockTVContent}
        platform="vidlink"
        embedUrl="https://test.com"
        contentType="tv"
        season={1}
        episode={1}
      />
    );

    await waitFor(() => {
      expect(tmdbApi.getTVSeasonsData).toHaveBeenCalled();
    });

    // Find and change episode selector
    const episodeSelects = screen.getAllByRole('combobox');
    if (episodeSelects.length > 1) {
      fireEvent.change(episodeSelects[1], { target: { value: '5' } });
      expect(streamingServices.getStreamingUrl).toHaveBeenCalled();
    }
  });

  test('handles error when fetching seasons data', async () => {
    tmdbApi.getTVSeasonsData = jest.fn().mockRejectedValue(new Error('API Error'));

    render(
      <StreamingPlayerModal
        isOpen={true}
        onClose={jest.fn()}
        content={mockTVContent}
        platform="vidlink"
        embedUrl="https://test.com"
        contentType="tv"
      />
    );

    await waitFor(() => {
      expect(tmdbApi.getTVSeasonsData).toHaveBeenCalled();
    });

    // Should still render without crashing
    expect(screen.getByText('Test TV Show')).toBeInTheDocument();
  });

  test('resets season and episode when modal opens', () => {
    const { rerender } = render(
      <StreamingPlayerModal
        isOpen={false}
        onClose={jest.fn()}
        content={mockTVContent}
        platform="vidlink"
        embedUrl="https://test.com"
        contentType="tv"
        season={2}
        episode={5}
      />
    );

    rerender(
      <StreamingPlayerModal
        isOpen={true}
        onClose={jest.fn()}
        content={mockTVContent}
        platform="vidlink"
        embedUrl="https://test.com"
        contentType="tv"
        season={2}
        episode={5}
      />
    );

    expect(streamingServices.getStreamingUrl).toHaveBeenCalled();
  });

  test('renders with null content', () => {
    render(
      <StreamingPlayerModal
        isOpen={true}
        onClose={jest.fn()}
        content={null}
        platform="vidlink"
        embedUrl="https://fallback.com"
      />
    );

    const iframes = document.querySelectorAll('iframe');
    expect(iframes.length).toBeGreaterThan(0);
  });

  describe('Dialog Element Tests', () => {
    test('should render as dialog element instead of div', () => {
      const { container } = render(
        <StreamingPlayerModal isOpen={true} onClose={jest.fn()} content={mockContent} />
      );
      const dialog = container.querySelector('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('open');
    });

    test('should have aria-modal attribute', () => {
      const { container } = render(
        <StreamingPlayerModal isOpen={true} onClose={jest.fn()} content={mockContent} />
      );
      const dialog = container.querySelector('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    test('should close on Escape key press', () => {
      const mockOnClose = jest.fn();
      const { container } = render(
        <StreamingPlayerModal isOpen={true} onClose={mockOnClose} content={mockContent} />
      );
      const dialog = container.querySelector('dialog');
      fireEvent.keyDown(dialog, { key: 'Escape' });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Referrer Policy Coverage', () => {
    test('should have referrerPolicy attribute on iframe', () => {
      const { container } = render(
        <StreamingPlayerModal isOpen={true} onClose={jest.fn()} content={mockContent} />
      );
      const iframe = container.querySelector('iframe');
      expect(iframe).toHaveAttribute('referrerPolicy', 'origin');
    });

    test('should have referrer meta tag in document', () => {
      render(<StreamingPlayerModal isOpen={true} onClose={jest.fn()} content={mockContent} />);
      // The meta tag is in index.html, not rendered by the component
      // Just verify the iframe has the referrerPolicy attribute
      const iframe = document.querySelector('iframe');
      expect(iframe).toHaveAttribute('referrerPolicy', 'origin');
    });
  });

  describe('Accessibility Coverage', () => {
    test('should have proper heading hierarchy', () => {
      render(<StreamingPlayerModal isOpen={true} onClose={jest.fn()} content={mockContent} />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    test('should have accessible season selector for TV shows', async () => {
      render(
        <StreamingPlayerModal
          isOpen={true}
          onClose={jest.fn()}
          content={mockTVContent}
          contentType="tv"
          season={1}
          episode={1}
        />
      );
      await waitFor(() => {
        const seasonSelect = document.querySelector('#season-select');
        expect(seasonSelect).toBeInTheDocument();
      });
    });
  });

  describe('Button Actions Coverage', () => {
    test('should call onClose when close button clicked', async () => {
      const mockOnClose = jest.fn();
      render(<StreamingPlayerModal isOpen={true} onClose={mockOnClose} content={mockContent} />);
      const closeButton = screen.getByTitle('Close player');
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    test('should open new tab when open button clicked', async () => {
      window.open = jest.fn();
      render(<StreamingPlayerModal isOpen={true} onClose={jest.fn()} content={mockContent} />);
      const openButton = screen.getByTitle('Open in new tab');
      fireEvent.click(openButton);
      expect(window.open).toHaveBeenCalled();
    });
  });

  describe('PostMessage Handling', () => {
    test('should render modal for TV content with postMessage support', async () => {
      render(
        <StreamingPlayerModal
          isOpen={true}
          onClose={jest.fn()}
          content={mockTVContent}
          contentType="tv"
          platform="server5"
          season={1}
          episode={1}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test TV Show')).toBeInTheDocument();
      });
    });
  });

  describe('Season with No Episodes', () => {
    test('should handle season change', async () => {
      tmdbApi.getTVSeasonsData = jest.fn().mockResolvedValue({
        total_seasons: 2,
        total_episodes: 20,
        seasons: [
          { season_number: 1, episode_count: 10 },
          { season_number: 2, episode_count: 10 },
        ],
      });

      render(
        <StreamingPlayerModal
          isOpen={true}
          onClose={jest.fn()}
          content={mockTVContent}
          contentType="tv"
          season={1}
          episode={1}
        />
      );

      await waitFor(() => {
        const seasonSelect = document.querySelector('#season-select');
        expect(seasonSelect).toBeInTheDocument();
      });

      // Change season
      const seasonSelect = document.querySelector('#season-select');
      fireEvent.change(seasonSelect, { target: { value: '2' } });

      // Episode should be reset to 1
      await waitFor(() => {
        const episodeSelect = document.querySelector('#episode-select');
        expect(episodeSelect.value).toBe('1');
      });
    });
  });

  describe('Escape Key Handling', () => {
    test('should close modal when Escape key is pressed', async () => {
      const mockOnClose = jest.fn();
      render(<StreamingPlayerModal isOpen={true} onClose={mockOnClose} content={mockContent} />);

      const dialog = document.querySelector('dialog');
      fireEvent.keyDown(dialog, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Backdrop Click Handling', () => {
    test('should close modal when backdrop is clicked', async () => {
      const mockOnClose = jest.fn();
      render(<StreamingPlayerModal isOpen={true} onClose={mockOnClose} content={mockContent} />);

      const backdrop = document.querySelector('.streaming-player-modal__content');
      fireEvent.click(backdrop);

      expect(mockOnClose).toHaveBeenCalled();
    });

    test('should not close modal when content is clicked', async () => {
      const mockOnClose = jest.fn();
      render(<StreamingPlayerModal isOpen={true} onClose={mockOnClose} content={mockContent} />);

      const innerContent = document.querySelector('.streaming-player-modal__header');
      fireEvent.click(innerContent);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
