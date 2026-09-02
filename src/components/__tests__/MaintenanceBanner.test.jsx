import { render, screen, fireEvent } from '@testing-library/react';
import MaintenanceBanner from '../MaintenanceBanner';

jest.mock('../MaintenanceBanner.css', () => ({}));

describe('MaintenanceBanner', () => {
  test('renders with default props', () => {
    render(<MaintenanceBanner />);

    expect(screen.getByText(/We are currently under maintenance/)).toBeInTheDocument();
  });

  test('renders with custom message', () => {
    render(<MaintenanceBanner message="Custom maintenance message" />);

    expect(screen.getByText('Custom maintenance message')).toBeInTheDocument();
  });

  test('renders dismiss button when dismissible is true', () => {
    render(<MaintenanceBanner dismissible={true} />);

    const dismissButton = screen.getByRole('button', { name: 'Dismiss maintenance notice' });
    expect(dismissButton).toBeInTheDocument();
  });

  test('does not render dismiss button when dismissible is false', () => {
    render(<MaintenanceBanner dismissible={false} />);

    const dismissButton = screen.queryByRole('button', { name: 'Dismiss maintenance notice' });
    expect(dismissButton).not.toBeInTheDocument();
  });

  test('hides banner when dismiss button is clicked', () => {
    render(<MaintenanceBanner />);

    const dismissButton = screen.getByRole('button', { name: 'Dismiss maintenance notice' });
    fireEvent.click(dismissButton);

    expect(screen.queryByText(/We are currently under maintenance/)).not.toBeInTheDocument();
  });

  test('applies warning type class', () => {
    const { container } = render(<MaintenanceBanner type="warning" />);

    expect(container.querySelector('.maintenance-banner--warning')).toBeInTheDocument();
  });

  test('applies info type class', () => {
    const { container } = render(<MaintenanceBanner type="info" />);

    expect(container.querySelector('.maintenance-banner--info')).toBeInTheDocument();
  });

  test('applies error type class', () => {
    const { container } = render(<MaintenanceBanner type="error" />);

    expect(container.querySelector('.maintenance-banner--error')).toBeInTheDocument();
  });

  test('renders alert icon', () => {
    const { container } = render(<MaintenanceBanner />);

    expect(container.querySelector('.maintenance-banner__icon')).toBeInTheDocument();
  });
});
