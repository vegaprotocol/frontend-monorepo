import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';
import { ConnectionsStore, useConnectionStore } from '@/stores/connections';
import { mockStore } from '@/test-helpers/mock-store';

import { fairground } from '../../../../../config/well-known-networks';
import { Connections, locators as connectionsLocators } from '.';
import { locators as connectionListLocators } from './connection-list';
import { locators as noConnectionsLocators } from './no-dapps-connected';

jest.mock('@/stores/connections');

const renderComponent = () =>
  render(
    <MemoryRouter>
      <MockNetworkProvider>
        <Connections />
      </MockNetworkProvider>
    </MemoryRouter>
  );

describe('Connections', () => {
  let initialState: ConnectionsStore | null = null;

  beforeEach(() => {
    initialState = useConnectionStore.getState();
  });
  afterEach(() => {
    // @ts-ignore
    global.browser = null;
    act(() => useConnectionStore.setState(initialState as ConnectionsStore));
  });
  it('renders sorted list of connections with instructions on how to connect', async () => {
    mockStore(useConnectionStore, {
      connections: [
        {
          allowList: {
            publicKeys: [],
            wallets: ['Wallet 1'],
          },
          accessedAt: Date.now(),
          origin: 'foo.com',
          chainId: 'foo',
          networkId: 'bar',
        },
        {
          allowList: {
            publicKeys: [],
            wallets: ['Wallet 1'],
          },
          accessedAt: Date.now(),
          origin: 'https://vega.xyz',
          chainId: 'foo',
          networkId: 'bar',
        },
      ],
    });
    renderComponent();
    const [foo, vega] = await screen.findAllByTestId(
      connectionListLocators.connectionOrigin
    );
    expect(foo).toHaveTextContent('foo.com');
    expect(vega).toHaveTextContent('https://vega.xyz');
    // 1109-VCON-002 I can see an explanation of what it means i.e. these dapps have permission to access my keys and connect to my wallet
    expect(
      screen.getByTestId(connectionListLocators.connectionDetails)
    ).toHaveTextContent(
      'These dapps have access to your public keys and permission to send transaction requests.'
    );
    // 1109-VCON-003 I can see instructions how to connect to a Vega dapp
    // 1109-VCON-004 There is a way to see the dapps I could connect with (e.g. a link to https://vega.xyz/apps)
    expect(
      screen.getByTestId(connectionsLocators.connectionInstructions)
    ).toHaveTextContent(
      'Trying to connect to a Vega dapp? Look for the "Connect Wallet" button and press it to create a connection.'
    );
    expect(
      screen.getByTestId(connectionsLocators.connectionInstructionsLink)
    ).toHaveAttribute('href', fairground.vegaDapps);
  });
  it('renders empty state with instructions on how to connect', async () => {
    mockStore(useConnectionStore, {
      connections: [],
    });
    renderComponent();
    await screen.findByTestId(noConnectionsLocators.connectionsNoConnections);
    expect(
      screen.getByTestId(noConnectionsLocators.connectionsNoConnections)
    ).toBeInTheDocument();
    // 1109-VCON-005 When I have no connections I can see that and still see instructions on how to connect to a Vega dapp
    expect(
      screen.getByTestId(connectionsLocators.connectionInstructions)
    ).toBeVisible();
  });
});
