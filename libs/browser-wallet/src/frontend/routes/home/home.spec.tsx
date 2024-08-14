import { render, screen } from '@testing-library/react';

import { useGetRedirectPath } from '@/hooks/redirect-path';

import { Home } from '.';

jest.mock('@/hooks/redirect-path', () => ({
  useGetRedirectPath: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: () => <div data-testid="navigate" />,
}));

describe('Home', () => {
  it('renders nothing if loading', () => {
    (useGetRedirectPath as jest.Mock).mockReturnValue({
      loading: true,
      path: null,
    });
    const { container } = render(<Home />);
    expect(container).toBeEmptyDOMElement();
  });
  it('renders nothing if path is undefined', () => {
    (useGetRedirectPath as jest.Mock).mockReturnValue({
      loading: false,
      path: null,
    });
    const { container } = render(<Home />);
    expect(container).toBeEmptyDOMElement();
  });
  it('renders navigate to the path specified', () => {
    (useGetRedirectPath as jest.Mock).mockReturnValue({
      loading: false,
      path: '/foo',
    });
    render(<Home />);
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
  });
});
