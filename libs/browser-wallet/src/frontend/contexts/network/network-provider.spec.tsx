import { render, screen } from '@testing-library/react';

import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { type GlobalsStore, useGlobalsStore } from '@/stores/globals';
import {
  type InteractionStore,
  useInteractionStore,
} from '@/stores/interaction-store';
import { type NetworksStore, useNetworksStore } from '@/stores/networks-store';
import { type DeepPartial, mockStore } from '@/test-helpers/mock-store';
import { silenceErrors } from '@/test-helpers/silence-errors';

import {
  fairground,
  testingNetwork,
} from '../../../config/well-known-networks';
import { useNetwork } from './network-context';
import { locators, NetworkProvider } from './network-provider';

jest.mock('@/stores/globals');
jest.mock('@/stores/interaction-store');
jest.mock('@/stores/networks-store');
jest.mock('@/contexts/json-rpc/json-rpc-context');

const TestComponent = () => {
  const { network } = useNetwork();
  return <div data-testid="test">{JSON.stringify(network)}</div>;
};

const renderComponent = (
  globalsState: DeepPartial<GlobalsStore> = {},
  networksState: DeepPartial<NetworksStore> = {},
  interactionState: DeepPartial<InteractionStore> = {}
) => {
  mockStore(useGlobalsStore, globalsState);
  mockStore(useNetworksStore, networksState);
  mockStore(useInteractionStore, interactionState);
  const request = jest.fn();
  (useJsonRpcClient as unknown as jest.Mock).mockReturnValue({ request });
  return render(
    <NetworkProvider>
      <TestComponent />
    </NetworkProvider>
  );
};

describe('NetworkProvider', () => {
  it('throws an error if a component is rendered inside of it', () => {
    silenceErrors();
    expect(() => render(<TestComponent />)).toThrow(
      'useNetwork must be used within NetworkProvider'
    );
  });

  it('loads networks and globals and returns null while loading', () => {
    const loadGlobals = jest.fn();
    const loadNetworks = jest.fn();
    const globalsState = {
      loading: true,
      loadGlobals,
    };
    const networksState = {
      loading: true,
      loadNetworks,
    };
    const { unmount } = renderComponent(globalsState, networksState);
    expect(
      screen.getByTestId(locators.networkProviderLoading)
    ).toBeInTheDocument();
    expect(loadGlobals).toHaveBeenCalled();
    expect(loadNetworks).toHaveBeenCalled();
    unmount();

    const { unmount: unmount2 } = renderComponent(
      {
        ...globalsState,
        loading: false,
      },
      networksState
    );
    expect(
      screen.getByTestId(locators.networkProviderLoading)
    ).toBeInTheDocument();
    unmount2();

    renderComponent(globalsState, {
      ...networksState,
      loading: false,
    });
    expect(
      screen.getByTestId(locators.networkProviderLoading)
    ).toBeInTheDocument();
  });

  it('returns the network that is selected in settings by default', () => {
    const loadGlobals = jest.fn();
    const loadNetworks = jest.fn();
    renderComponent(
      {
        loadGlobals,
      },
      {
        loadNetworks,
        selectedNetwork: testingNetwork,
      },
      {}
    );
    expect(screen.getByTestId('test')).toHaveTextContent(
      JSON.stringify(testingNetwork)
    );
  });

  it('if we are connecting to a dApp then the chainId of the connection is used to find the network', () => {
    const loadGlobals = jest.fn();
    const loadNetworks = jest.fn();
    renderComponent(
      {
        loadGlobals,
      },
      {
        loadNetworks,
        selectedNetwork: testingNetwork,
        networks: [testingNetwork, fairground],
      },
      {
        connectionModalOpen: true,
        currentConnectionDetails: {
          chainId: fairground.chainId,
        },
      }
    );
    expect(screen.getByTestId('test')).toHaveTextContent(
      JSON.stringify(fairground)
    );
  });

  it('if we are approving a transaction then the chainId of the transaction is used to find the network', () => {
    const loadGlobals = jest.fn();
    const loadNetworks = jest.fn();
    renderComponent(
      {
        loadGlobals,
      },
      {
        loadNetworks,
        selectedNetwork: testingNetwork,
        networks: [testingNetwork, fairground],
      },
      {
        transactionModalOpen: true,
        currentTransactionDetails: {
          chainId: fairground.chainId,
        },
      }
    );
    expect(screen.getByTestId('test')).toHaveTextContent(
      JSON.stringify(fairground)
    );
  });

  it('if the connection/transaction chainId cannot be found it throws an error', () => {
    const loadGlobals = jest.fn();
    const loadNetworks = jest.fn();
    expect(() =>
      renderComponent(
        {
          loadGlobals,
        },
        {
          loadNetworks,
          selectedNetwork: testingNetwork,
          networks: [testingNetwork, fairground],
        },
        {
          transactionModalOpen: true,
          currentTransactionDetails: {
            chainId: 'this-chain-id-does-not-exist',
          },
        }
      )
    ).toThrow('Could not find selected network');
  });
});
