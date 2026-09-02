import { render, screen } from '@testing-library/react';

// Mock next/font/google
jest.mock('next/font/google', () => ({
  Inter: () => ({ className: 'inter' }),
}));

// Mock next/script
jest.mock('next/script', () => {
  return function MockScript({ children, ...props }) {
    return <script {...props}>{children}</script>;
  };
});

jest.mock('../components/Layout', () => {
  return function MockLayout({ children }) {
    return <div data-testid="layout">{children}</div>;
  };
});

describe('App (RootLayout)', () => {
  test('renders layout component', async () => {
    // Import dynamically after mocks are set up
    const { default: RootLayout } = await import('../app/layout');

    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
