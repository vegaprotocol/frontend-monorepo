import { render, screen } from '@testing-library/react';
import { Header } from './header';
import { MemoryRouter } from 'react-router-dom';

jest.mock('@vegaprotocol/environment', () => ({
  ...jest.requireActual('@vegaprotocol/environment'),
  NetworkSwitcher: () => (
    <div data-testid="network-switcher">NetworkSwitcher</div>
  ),
}));

jest.mock('../search', () => ({
  Search: () => <div data-testid="search">OrderList</div>,
}));

const renderComponent = () => (
  <MemoryRouter initialEntries={['/txs']}>
    <Header />
  </MemoryRouter>
);

describe('Header', () => {
  it('should render navigation', () => {
    render(renderComponent());

    expect(screen.getByTestId('navigation')).toHaveTextContent('Explorer');
  });

  it('should render search', () => {
    render(renderComponent());

    expect(screen.getByTestId('search')).toBeInTheDocument();
  });

  // TODO: for some reason this test reports multiple testids found even though there is only one
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should render network switcher', () => {
    render(renderComponent());

    expect(screen.getByTestId('network-switcher')).toBeInTheDocument();
  });
});
