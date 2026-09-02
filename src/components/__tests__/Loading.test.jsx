import { render, screen } from '@testing-library/react';
import Loading from '../Loading';

jest.mock('../Loading.css', () => ({}));

describe('Loading', () => {
  test('renders with default props', () => {
    render(<Loading />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders with custom text', () => {
    render(<Loading text="Please wait..." />);

    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  test('renders without text when text is null', () => {
    render(<Loading text={null} />);

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  test('renders without text when text is empty string', () => {
    render(<Loading text="" />);

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  test('applies correct size class for small size', () => {
    const { container } = render(<Loading size="small" />);

    expect(container.querySelector('.loading--small')).toBeInTheDocument();
  });

  test('applies correct size class for medium size', () => {
    const { container } = render(<Loading size="medium" />);

    expect(container.querySelector('.loading--medium')).toBeInTheDocument();
  });

  test('applies correct size class for large size', () => {
    const { container } = render(<Loading size="large" />);

    expect(container.querySelector('.loading--large')).toBeInTheDocument();
  });

  test('renders spinner with three dots', () => {
    const { container } = render(<Loading />);

    const dots = container.querySelectorAll('.loading__dot');
    expect(dots).toHaveLength(3);
  });

  test('applies base loading class', () => {
    const { container } = render(<Loading />);

    expect(container.querySelector('.loading')).toBeInTheDocument();
  });
});
