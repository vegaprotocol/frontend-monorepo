import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Nav } from './nav';

jest.mock('@vegaprotocol/environment', () => ({
  ...jest.requireActual('@vegaprotocol/environment'),
  NetworkSwitcher: () => <div data-testid="network-switcher" />,
  useEnvironment: () => ({ VEGA_ENV: 'MAINNET' }),
}));

const renderComponent = (initialEntries?: string[]) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Nav />
    </MemoryRouter>
  );
};

describe('nav', () => {
  it('Renders logo with link to home', () => {
    renderComponent();
    expect(screen.getByTestId('logo-link')).toHaveProperty(
      'href',
      'http://localhost/'
    );
  });
  it('Renders network switcher', () => {
    renderComponent();
    expect(screen.getByTestId('network-switcher')).toBeInTheDocument();
  });
  it('Renders all top level routes', () => {
    renderComponent();
    expect(screen.getByTestId('Proposals')).toHaveProperty(
      'href',
      'http://localhost/proposals'
    );
    expect(screen.getByTestId('Validators')).toHaveProperty(
      'href',
      'http://localhost/validators'
    );
    expect(screen.getByTestId('Rewards')).toHaveProperty(
      'href',
      'http://localhost/rewards'
    );
  });
  it('Shows active state on dropdown trigger when on home route for subroutes', () => {
    const { getByTestId } = renderComponent(['/token']);
    const dd = getByTestId('token-dd');
    expect(within(dd).getByTestId('link-active')).toBeInTheDocument();
  });
  it('Shows active state on dropdown trigger when on sub route of dropdown', () => {
    const { getByTestId } = renderComponent(['/token/withdraw']);
    const dd = getByTestId('token-dd');
    expect(within(dd).getByTestId('link-active')).toBeInTheDocument();
  });
});
