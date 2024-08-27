import { render, screen } from '@testing-library/react';

import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { type GlobalsStore, useGlobalsStore } from '@/stores/globals';
import {
  type InteractionStore,
  useInteractionStore,
} from '@/stores/interaction-store';
import { type DeepPartial, mockStore } from '@/test-helpers/mock-store';
import { silenceErrors } from '@/test-helpers/silence-errors';

import { fairground } from '../../../config/well-known-networks';
import { useNetwork } from './network-context';
import { locators, NetworkProvider } from './network-provider';

jest.mock('@/stores/globals');
jest.mock('@/stores/interaction-store');
jest.mock('@/contexts/json-rpc/json-rpc-context');

const TestComponent = () => {
  const networkData = useNetwork();
  return <div data-testid="test">{JSON.stringify(networkData)}</div>;
};

const renderComponent = (
  globalsState: DeepPartial<GlobalsStore> = {},
  interactionState: DeepPartial<InteractionStore> = {}
) => {
  mockStore(useGlobalsStore, globalsState);
  mockStore(useInteractionStore, interactionState);
  const request = jest.fn();
  (useJsonRpcClient as unknown as jest.Mock).mockReturnValue({ request });
  return render(
    <NetworkProvider
      explorer={'explorer'}
      docs={'docs'}
      governance={'governance'}
      console={'console'}
      chainId={'chainId'}
      etherscanUrl={'etherscanUrl'}
    >
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

  it('loads globals and returns null while loading', () => {
    const loadGlobals = jest.fn();
    const globalsState = {
      loading: true,
      loadGlobals,
    };
    const { unmount } = renderComponent(globalsState);
    expect(
      screen.getByTestId(locators.networkProviderLoading)
    ).toBeInTheDocument();
    expect(loadGlobals).toHaveBeenCalled();
    unmount();

    renderComponent(globalsState);
    expect(
      screen.getByTestId(locators.networkProviderLoading)
    ).toBeInTheDocument();
  });

  it('returns the network that is selected in settings by default', () => {
    const loadGlobals = jest.fn();
    renderComponent(
      {
        loadGlobals,
      },
      {}
    );
    expect(screen.getByTestId('test')).toHaveTextContent(
      JSON.stringify({
        explorer: 'explorer',
        docs: 'docs',
        governance: 'governance',
        console: 'console',
        chainId: 'chainId',
        etherscanUrl: 'etherscanUrl',
      })
    );
  });

  it('if we are approving a transaction then the chainId of the transaction is used to find the network', () => {
    const loadGlobals = jest.fn();
    renderComponent(
      {
        loadGlobals,
      },
      {
        transactionModalOpen: true,
        currentTransactionDetails: {
          chainId: fairground.chainId,
        },
      }
    );
    expect(screen.getByTestId('test')).toHaveTextContent(
      JSON.stringify({
        explorer: 'explorer',
        docs: 'docs',
        governance: 'governance',
        console: 'console',
        chainId: 'chainId',
        etherscanUrl: 'etherscanUrl',
        interactionMode: true,
      })
    );
  });
});
