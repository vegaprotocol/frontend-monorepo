import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';
import { useGlobalsStore } from '@/stores/globals';
import { useNetworksStore } from '@/stores/networks-store';
import { mockStore } from '@/test-helpers/mock-store';

import {
  devnet,
  fairground,
  testingNetwork,
} from '../../../config/well-known-networks';
import { type NetworkListProperties } from '../networks-list';
import { locators, NetworkDropdown } from './network-dropdown';

jest.mock('@/stores/globals');
jest.mock('@/stores/networks-store');

jest.mock('@/contexts/json-rpc/json-rpc-context', () => ({
  useJsonRpcClient: jest.fn(),
}));

jest.mock('../networks-list', () => ({
  NetworksList: (properties: NetworkListProperties) => (
    <div data-testid="networks-list">
      {properties.networks.map((n) => (
        <button
          key={n.id}
          onClick={() => properties.onClick?.(n)}
          data-testid={n.id}
        >
          {n.name}
        </button>
      ))}
    </div>
  ),
}));

const renderComponent = (interactionMode?: boolean) => {
  return render(
    <MockNetworkProvider interactionMode={interactionMode}>
      <NetworkDropdown />
    </MockNetworkProvider>
  );
};

const mockStores = ({ showHiddenNetworks = false } = {}) => {
  const loadGlobals = jest.fn();
  const setSelectedNetwork = jest.fn();
  mockStore(useGlobalsStore, {
    loadGlobals: loadGlobals,
    globals: { settings: { showHiddenNetworks } },
  });
  mockStore(useNetworksStore, {
    networks: [testingNetwork, fairground, devnet],
    selectedNetwork: testingNetwork,
    setSelectedNetwork: setSelectedNetwork,
  });
  return {
    loadGlobals,
    setSelectedNetwork,
  };
};

describe('NetworkSwitcher', () => {
  it('renders message explaining network selector and networks list', async () => {
    mockStores();
    const mockRequest = jest.fn();
    (useJsonRpcClient as unknown as jest.Mock).mockReturnValue({
      request: mockRequest,
    });
    renderComponent();
    fireEvent.click(screen.getByTestId(locators.networkSwitcherCurrentNetwork));
    await screen.findByTestId('networks-list');
    expect(
      screen.getByTestId(locators.networkSwitcherMessage)
    ).toHaveTextContent(
      'Your selected network is for display purposes only, you can connect and place transactions on any configured network regardless of what network you have selected.'
    );
    expect(screen.getByTestId('networks-list')).toBeInTheDocument();
  });

  it('sets selected network and reloads the globals on network change', async () => {
    const { setSelectedNetwork, loadGlobals } = mockStores();
    const mockRequest = jest.fn();
    (useJsonRpcClient as unknown as jest.Mock).mockReturnValue({
      request: mockRequest,
    });
    renderComponent();
    fireEvent.click(screen.getByTestId(locators.networkSwitcherCurrentNetwork));
    await screen.findByTestId('networks-list');
    fireEvent.click(screen.getByTestId(fairground.id));
    await waitFor(() => expect(loadGlobals).toHaveBeenCalledTimes(1));
    expect(setSelectedNetwork).toHaveBeenCalledTimes(1);
  });

  it('renders development networks if setting is set', async () => {
    // 1142-NWSW-009 Shows hidden networks when setting is turned on
    // 1142-NWSW-010 Hides hidden networks when setting is turned off
    mockStores({
      showHiddenNetworks: true,
    });
    const mockRequest = jest.fn();
    (useJsonRpcClient as unknown as jest.Mock).mockReturnValue({
      request: mockRequest,
    });
    renderComponent();
    fireEvent.click(screen.getByTestId(locators.networkSwitcherCurrentNetwork));
    await screen.findByTestId('networks-list');
    expect(screen.getByText(devnet.name)).toBeInTheDocument();
  });
});
