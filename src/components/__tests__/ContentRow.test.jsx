import { render, screen, fireEvent } from '@testing-library/react';
import ContentRow from '../ContentRow';

jest.mock('../ContentRow.css', () => ({}));
jest.mock('../StreamingResultCard', () => {
  return function MockStreamingResultCard({ content }) {
    return <div data-testid={`card-${content.id}`}>{content.title}</div>;
  };
});

describe('ContentRow', () => {
  const mockContent = [
    { id: 1, title: 'Movie 1', type: 'movie' },
    { id: 2, title: 'Movie 2', type: 'movie' },
    { id: 3, title: 'Movie 3', type: 'movie' },
  ];

  const mockOnPlay = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders nothing when content is null', () => {
    const { container } = render(<ContentRow title="Test" content={null} onPlay={mockOnPlay} />);

    expect(container.firstChild).toBeNull();
  });

  test('renders nothing when content is empty array', () => {
    const { container } = render(<ContentRow title="Test" content={[]} onPlay={mockOnPlay} />);

    expect(container.firstChild).toBeNull();
  });

  test('renders title', () => {
    render(<ContentRow title="Popular Movies" content={mockContent} onPlay={mockOnPlay} />);

    expect(screen.getByText('Popular Movies')).toBeInTheDocument();
  });

  test('renders all content items', () => {
    render(<ContentRow title="Test" content={mockContent} onPlay={mockOnPlay} />);

    expect(screen.getByTestId('card-1')).toBeInTheDocument();
    expect(screen.getByTestId('card-2')).toBeInTheDocument();
    expect(screen.getByTestId('card-3')).toBeInTheDocument();
  });

  test('renders right arrow initially', () => {
    render(<ContentRow title="Test" content={mockContent} onPlay={mockOnPlay} />);

    const rightArrow = screen.getByRole('button', { name: 'Scroll right' });
    expect(rightArrow).toBeInTheDocument();
  });

  test('does not render left arrow initially', () => {
    render(<ContentRow title="Test" content={mockContent} onPlay={mockOnPlay} />);

    const leftArrow = screen.queryByRole('button', { name: 'Scroll left' });
    expect(leftArrow).not.toBeInTheDocument();
  });

  test('scroll right button calls scroll function', () => {
    render(<ContentRow title="Test" content={mockContent} onPlay={mockOnPlay} />);

    const rightArrow = screen.getByRole('button', { name: 'Scroll right' });

    // Mock scrollTo
    const mockScrollTo = jest.fn();
    const scrollContainer = document.querySelector('.content-row__scroll');
    scrollContainer.scrollTo = mockScrollTo;

    fireEvent.click(rightArrow);

    expect(mockScrollTo).toHaveBeenCalled();
  });

  test('applies correct CSS classes', () => {
    const { container } = render(
      <ContentRow title="Test" content={mockContent} onPlay={mockOnPlay} />
    );

    expect(container.querySelector('.content-row')).toBeInTheDocument();
    expect(container.querySelector('.content-row__title')).toBeInTheDocument();
    expect(container.querySelector('.content-row__container')).toBeInTheDocument();
    expect(container.querySelector('.content-row__scroll')).toBeInTheDocument();
  });

  test('renders content items with correct keys', () => {
    const { container } = render(
      <ContentRow title="Test" content={mockContent} onPlay={mockOnPlay} />
    );

    const items = container.querySelectorAll('.content-row__item');
    expect(items).toHaveLength(3);
  });

  test('handles scroll event', () => {
    render(<ContentRow title="Test" content={mockContent} onPlay={mockOnPlay} />);

    const scrollContainer = document.querySelector('.content-row__scroll');

    // Simulate scroll
    Object.defineProperty(scrollContainer, 'scrollLeft', { value: 100, writable: true });
    Object.defineProperty(scrollContainer, 'scrollWidth', { value: 1000, writable: true });
    Object.defineProperty(scrollContainer, 'clientWidth', { value: 500, writable: true });

    fireEvent.scroll(scrollContainer);

    // Left arrow should now be visible
    const leftArrow = screen.getByRole('button', { name: 'Scroll left' });
    expect(leftArrow).toBeInTheDocument();
  });

  test('scroll left button calls scroll function', () => {
    render(<ContentRow title="Test" content={mockContent} onPlay={mockOnPlay} />);

    const scrollContainer = document.querySelector('.content-row__scroll');

    // Simulate scroll to show left arrow
    Object.defineProperty(scrollContainer, 'scrollLeft', { value: 100, writable: true });
    Object.defineProperty(scrollContainer, 'scrollWidth', { value: 1000, writable: true });
    Object.defineProperty(scrollContainer, 'clientWidth', { value: 500, writable: true });

    fireEvent.scroll(scrollContainer);

    const leftArrow = screen.getByRole('button', { name: 'Scroll left' });

    // Mock scrollTo
    const mockScrollTo = jest.fn();
    scrollContainer.scrollTo = mockScrollTo;

    fireEvent.click(leftArrow);

    expect(mockScrollTo).toHaveBeenCalled();
  });
});
