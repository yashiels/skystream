import { render, screen } from '@testing-library/react';

// Simple component test
const SimpleComponent = () => {
  return <div>Hello SkyStream</div>;
};

describe('Simple Test Suite', () => {
  test('renders a simple component', () => {
    render(<SimpleComponent />);
    const element = screen.getByText('Hello SkyStream');
    expect(element).toBeInTheDocument();
  });

  test('basic math works', () => {
    expect(1 + 1).toBe(2);
  });

  test('string concatenation works', () => {
    expect('Sky' + 'Stream').toBe('SkyStream');
  });
});
