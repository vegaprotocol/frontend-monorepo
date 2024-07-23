import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from './navbar';
import { useGlobalStore } from '../../stores';
import { ENV } from '@vegaprotocol/environment';
import {
  mockConfig,
  MockedWalletProvider,
} from '@vegaprotocol/wallet-react/testing';
import { MockedProvider, type MockedResponse } from '@apollo/react-testing';
import {
  PartyProfilesDocument,
  type PartyProfilesQuery,
  type PartyProfilesQueryVariables,
} from '../vega-wallet-connect-button/__generated__/PartyProfiles';

jest.mock('@vegaprotocol/proposals', () => ({
  ProtocolUpgradeCountdown: () => null,
}));

describe('Navbar', () => {
  const mockKeys = [
    {
      name: 'Key 1',
      publicKey: '1'.repeat(64),
    },
    {
      name: 'Key 2',
      publicKey: '2'.repeat(64),
    },
  ];
  const key1Alias = 'key 1 alias';
  const marketId = 'abc';
  const navbarContent = 'navbar-menu-content';

  const partyProfilesMock: MockedResponse<
    PartyProfilesQuery,
    PartyProfilesQueryVariables
  > = {
    request: {
      query: PartyProfilesDocument,
      variables: {
        partyIds: mockKeys.map((k) => k.publicKey),
      },
    },
    result: {
      data: {
        partiesProfilesConnection: {
          edges: [
            {
              node: {
                partyId: mockKeys[0].publicKey,
                alias: key1Alias,
                metadata: [],
              },
            },
          ],
        },
      },
    },
  };

  const renderComponent = (initialEntries?: string[]) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <MockedProvider mocks={[partyProfilesMock]}>
          <MockedWalletProvider>
            <Navbar />
          </MockedWalletProvider>
        </MockedProvider>
      </MemoryRouter>
    );
  };

  beforeAll(() => {
    useGlobalStore.setState({ marketId });
    const mockedENV = jest.mocked(ENV);
    mockedENV.VEGA_TOKEN_URL = 'governance';
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      mockConfig.reset();
    });
  });

  it('should be properly rendered', () => {
    renderComponent();

    const expectedLinks = [
      ['/', ''],
      ['/markets', 'Markets'],
      [`/markets/${marketId}`, 'Trading'],
      ['/portfolio', 'Portfolio'],
      ['/competitions', 'Competitions'],
      ['/referrals', 'Referrals'],
      ['/fees', 'Fees'],
      ['/rewards', 'Rewards'],
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
      ['/competitions', 'Competitions'],
      ['/referrals', 'Referrals'],
      ['/fees', 'Fees'],
      ['/rewards', 'Rewards'],
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
    mockConfig.store.setState({
      status: 'connected',
      keys: mockKeys,
      pubKey: mockKeys[0].publicKey,
    });
    const mockSelectPubKey = jest.spyOn(mockConfig.store, 'setState');
    renderComponent(undefined);
    await userEvent.click(screen.getByRole('button', { name: 'Wallet' }));

    const menuEl = screen.getByTestId(navbarContent);
    expect(menuEl).toBeInTheDocument();
    const menu = within(menuEl);

    expect(menu.getAllByTestId(/key-\d+-mobile/)).toHaveLength(mockKeys.length);

    const activeKey = within(menu.getByTestId(/key-1+-mobile/));
    expect(activeKey.getByText(mockKeys[0].name)).toBeInTheDocument();
    expect(activeKey.getByTestId('icon-tick')).toBeInTheDocument();
    expect(screen.getByText(key1Alias)).toBeInTheDocument();

    const inactiveKey = within(menu.getByTestId(/key-2+-mobile/));
    await userEvent.click(inactiveKey.getByText(mockKeys[1].name));
    expect(mockSelectPubKey).toHaveBeenCalledWith({
      pubKey: mockKeys[1].publicKey,
    });
  });

  it('can transfer and close menu', async () => {
    mockConfig.store.setState({
      status: 'connected',
      keys: mockKeys,
      pubKey: mockKeys[0].publicKey,
    });
    renderComponent();
    await userEvent.click(screen.getByRole('button', { name: 'Wallet' }));

    const menuEl = screen.getByTestId(navbarContent);
    expect(menuEl).toBeInTheDocument();
    const menu = within(menuEl);

    await userEvent.click(menu.getByText('Transfer'));

    expect(screen.queryByTestId(navbarContent)).not.toBeInTheDocument();
  });

  it('can disconnect and close menu', async () => {
    mockConfig.store.setState({
      status: 'connected',
      keys: mockKeys,
      pubKey: mockKeys[0].publicKey,
    });
    const mockDisconnect = jest.spyOn(mockConfig, 'disconnect');
    renderComponent(undefined);
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
