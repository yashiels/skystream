import { render, screen, fireEvent } from '@testing-library/react';
import OfflineClient from '../OfflineClient';
import { reloadPage } from '../reload';

jest.mock('../offline.css', () => ({}));

jest.mock('next/link', () => {
  return function MockLink({ children, href }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('../reload', () => ({
  reloadPage: jest.fn(),
}));

describe('OfflineClient', () => {
  test('renders the offline message', () => {
    render(<OfflineClient />);
    expect(screen.getByText(/you're offline/i)).toBeInTheDocument();
  });

  test('renders a Retry button that triggers a reload', () => {
    render(<OfflineClient />);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(reloadPage).toHaveBeenCalled();
  });

  test('renders a link back home', () => {
    render(<OfflineClient />);
    expect(screen.getByRole('link', { name: 'Go home' })).toHaveAttribute('href', '/');
  });
});
