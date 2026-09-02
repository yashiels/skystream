import { render, screen } from '@testing-library/react';
import Layout from '../Layout';

jest.mock('../Layout.css', () => ({}));

jest.mock('../ThemeToggle', () => {
  return function MockThemeToggle() {
    return <div data-testid="theme-toggle">Theme Toggle</div>;
  };
});

jest.mock('../../utils/analytics', () => ({
  __esModule: true,
  default: { init: jest.fn() },
}));

let mockPathname = '/';
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('next/link', () => {
  return function MockLink({ children, href, className }) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  };
});

const renderLayout = (route = '/') => {
  mockPathname = route;
  return render(
    <Layout>
      <div>Content</div>
    </Layout>
  );
};

describe('Layout', () => {
  test('renders logo', () => {
    renderLayout();
    expect(screen.getByText('SkyStream')).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    renderLayout();
    expect(screen.getByText('Discover')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.queryByText('Live TV')).not.toBeInTheDocument();
  });

  test('renders children content', () => {
    renderLayout();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  test('renders footer', () => {
    renderLayout();
    expect(screen.getByText(/SkyStream - Search and stream/)).toBeInTheDocument();
    expect(screen.getByText(/Content provided by third-party services/)).toBeInTheDocument();
  });

  test('renders footer credits with attribution links', () => {
    renderLayout();
    expect(screen.getByText('Skyner Group')).toBeInTheDocument();
    expect(screen.getByText('Yashiel Sookdeo')).toBeInTheDocument();
    expect(screen.getByText('Mpho Ndlela')).toBeInTheDocument();
  });

  test('renders theme toggle', () => {
    renderLayout();
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  test('highlights active Discover link when on /home', () => {
    renderLayout('/home');
    const discoverLink = screen.getByText('Discover').closest('a');
    expect(discoverLink).toHaveClass('layout__nav-link--active');
  });

  test('highlights active Search link when on /', () => {
    renderLayout('/');
    const searchLink = screen.getByText('Search').closest('a');
    expect(searchLink).toHaveClass('layout__nav-link--active');
  });

  test('external links have aria-labels for accessibility', () => {
    renderLayout();
    expect(screen.getByLabelText('Skyner Group (opens in new tab)')).toBeInTheDocument();
    expect(screen.getByLabelText('Yashiel Sookdeo (opens in new tab)')).toBeInTheDocument();
    expect(screen.getByLabelText('Mpho Ndlela (opens in new tab)')).toBeInTheDocument();
  });
});
