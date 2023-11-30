import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { Navbar } from './navbar';
import { useGlobalStore } from '../../stores';
import { ENV, FLAGS } from '@vegaprotocol/environment';

jest.mock('@vegaprotocol/proposals', () => ({
  ProtocolUpgradeCountdown: () => null,
}));

describe('Navbar', () => {
  const pubKey = '000';
  const pubKeys = [
    {
      publicKey: pubKey,
      name: 'Pub key 0',
    },
    {
      publicKey: '111',
      name: 'Pub key 1',
    },
  ];
  const marketId = 'abc';
  const navbarContent = 'navbar-menu-content';

  const renderComponent = (
    initialEntries?: string[],
    walletContext?: Partial<VegaWalletContextShape>
  ) => {
    const context = {
      pubKey,
      pubKeys,
      selectPubKey: jest.fn(),
      disconnect: jest.fn(),
      ...walletContext,
    } as VegaWalletContextShape;
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <VegaWalletContext.Provider value={context}>
          <Navbar />
        </VegaWalletContext.Provider>
      </MemoryRouter>
    );
  };

  beforeAll(() => {
    useGlobalStore.setState({ marketId });
    const mockedFLAGS = jest.mocked(FLAGS);
    mockedFLAGS.REFERRALS = true;
    const mockedENV = jest.mocked(ENV);
    mockedENV.VEGA_TOKEN_URL = 'governance';
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should be properly rendered', () => {
    renderComponent();

    const expectedLinks = [
      ['/', ''],
      ['/markets', 'Markets'],
      [`/markets/${marketId}`, 'Trading'],
      ['/portfolio', 'Portfolio'],
      ['/referrals', 'Referrals'],
      ['/fees', 'Fees'],
      [expect.stringContaining('governance'), 'Governance'],
    ];

    const links = screen.getAllByRole('link');

    links.forEach((link, i) => {
      const [href, text] = expectedLinks[i];
      expect(link).toHaveAttribute('href', href);
      expect(link).toHaveTextContent(text);
    });
  });

  it('Markets page route should not match empty market page', () => {
    renderComponent(['/markets']);
    expect(screen.getByRole('link', { name: 'Markets' })).toHaveClass('active');
    expect(screen.getByRole('link', { name: 'Trading' })).not.toHaveClass(
      'active'
    );
  });

  it('can open menu and navigate on small screens', async () => {
    renderComponent();
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }));

    const menuEl = screen.getByTestId(navbarContent);
    expect(menuEl).toBeInTheDocument();
    const menu = within(menuEl);

    const expectedLinks = [
      ['/markets', 'Markets'],
      [`/markets/${marketId}`, 'Trading'],
      ['/portfolio', 'Portfolio'],
      ['/referrals', 'Referrals'],
      ['/fees', 'Fees'],
      [expect.stringContaining('governance'), 'Governance'],
    ];
    const links = menu.getAllByRole('link');
    links.forEach((link, i) => {
      const [href, text] = expectedLinks[i];
      expect(link).toHaveAttribute('href', href);
      expect(link).toHaveTextContent(text);
    });

    await userEvent.click(screen.getByRole('button', { name: 'Close menu' }));
    expect(screen.queryByTestId(navbarContent)).not.toBeInTheDocument();
  });

  it('can close menu by clicking overlay', async () => {
    renderComponent();
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
    expect(screen.getByTestId(navbarContent)).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('navbar-menu-overlay'));
    expect(screen.queryByTestId(navbarContent)).not.toBeInTheDocument();
  });

  it('can open wallet menu on small screens and change pubkey', async () => {
    const mockSelectPubKey = jest.fn();
    renderComponent(undefined, { selectPubKey: mockSelectPubKey });
    await userEvent.click(screen.getByRole('button', { name: 'Wallet' }));

    const menuEl = screen.getByTestId(navbarContent);
    expect(menuEl).toBeInTheDocument();
    const menu = within(menuEl);

    expect(menu.getAllByTestId(/key-\d+-mobile/)).toHaveLength(pubKeys.length);

    const activeKey = within(menu.getByTestId('key-000-mobile'));
    expect(activeKey.getByText(pubKeys[0].name)).toBeInTheDocument();
    expect(activeKey.getByTestId('icon-tick')).toBeInTheDocument();

    const inactiveKey = within(menu.getByTestId('key-111-mobile'));
    await userEvent.click(inactiveKey.getByText(pubKeys[1].name));
    expect(mockSelectPubKey).toHaveBeenCalledWith(pubKeys[1].publicKey);
  });

  it('can transfer and close menu', async () => {
    renderComponent();
    await userEvent.click(screen.getByRole('button', { name: 'Wallet' }));

    const menuEl = screen.getByTestId(navbarContent);
    expect(menuEl).toBeInTheDocument();
    const menu = within(menuEl);

    await userEvent.click(menu.getByText('Transfer'));

    expect(screen.queryByTestId(navbarContent)).not.toBeInTheDocument();
  });

  it('can disconnect and close menu', async () => {
    const mockDisconnect = jest.fn();
    renderComponent(undefined, { disconnect: mockDisconnect });
    await userEvent.click(screen.getByRole('button', { name: 'Wallet' }));

    const menuEl = screen.getByTestId(navbarContent);
    expect(menuEl).toBeInTheDocument();
    const menu = within(menuEl);

    await userEvent.click(menu.getByText('Disconnect'));

    expect(mockDisconnect).toHaveBeenCalled();
    expect(screen.queryByTestId(navbarContent)).not.toBeInTheDocument();
  });

  it('does not render the language selector until we have more languages', () => {
    renderComponent();
    expect(screen.queryByTestId('icon-globe')).not.toBeInTheDocument();
  });

  it('renders the theme switcher', async () => {
    renderComponent();
    await userEvent.click(screen.getByTestId('icon-moon'));
    expect(screen.queryByTestId('icon-moon')).not.toBeInTheDocument();
    expect(screen.getByTestId('icon-sun')).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('icon-sun'));
    expect(screen.queryByTestId('icon-sun')).not.toBeInTheDocument();
    expect(screen.getByTestId('icon-moon')).toBeInTheDocument();
  });
});
