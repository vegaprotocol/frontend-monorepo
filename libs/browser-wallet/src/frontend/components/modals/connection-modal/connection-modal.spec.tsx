import { fireEvent, render, screen } from '@testing-library/react';

import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';
import { useErrorStore } from '@/stores/error';
import { useInteractionStore } from '@/stores/interaction-store';
import { useNetworksStore } from '@/stores/networks-store';
import { mockStore } from '@/test-helpers/mock-store';

import { testingNetwork } from '../../../../config/well-known-networks';
import locators from '../../locators';
import { locators as pageHeaderLocators } from '../../page-header';
import { ConnectionModal } from './connection-modal';
import { ConnectionSuccessProperties } from './connection-success';

jest.mock('@/stores/interaction-store');
jest.mock('@/stores/networks-store');
jest.mock('@/stores/error');

jest.mock('./connection-success', () => ({
  ConnectionSuccess: ({ onClose }: ConnectionSuccessProperties) => (
    <button onClick={onClose} data-testid="connection-success" />
  ),
}));

jest.mock('@/contexts/json-rpc/json-rpc-context', () => ({
  useJsonRpcClient: () => ({
    request: jest.fn(),
  }),
}));

const renderComponent = () => {
  return render(
    <MockNetworkProvider>
      <ConnectionModal />
    </MockNetworkProvider>
  );
};

describe('ConnectionModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders nothing when isOpen is false', () => {
    mockStore(useErrorStore, {});
    mockStore(useNetworksStore, {
      networks: [testingNetwork],
    });
    mockStore(useInteractionStore, { connectionModalOpen: false });
    const { container } = renderComponent();
    expect(container).toBeEmptyDOMElement();
  });
  it('renders connection details and page header when open but not yet connected', () => {
    // 1142-NWSW-001 Renders header with network when connecting
    // 1142-NWSW-004 Renders header with network when transacting
    mockStore(useErrorStore, {});
    mockStore(useNetworksStore, {
      networks: [testingNetwork],
    });
    mockStore(useInteractionStore, {
      connectionModalOpen: true,
      currentConnectionDetails: {},
    });
    renderComponent();
    expect(
      screen.getByTestId(locators.connectionModalApprove)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(pageHeaderLocators.pageHeader)
    ).toBeInTheDocument();
  });
  it('renders connection success when hasConnected is true', () => {
    mockStore(useErrorStore, {});
    mockStore(useNetworksStore, {
      networks: [testingNetwork],
    });
    mockStore(useInteractionStore, {
      connectionModalOpen: true,
      handleConnectionDecision: jest.fn(),
      currentConnectionDetails: {
        chainId: testingNetwork.chainId,
      },
    });
    renderComponent();
    fireEvent.click(screen.getByTestId(locators.connectionModalApproveButton));
    expect(screen.getByTestId('connection-success')).toBeInTheDocument();
  });
  it('renders nothing if connection is not approved', () => {
    mockStore(useErrorStore, {});
    mockStore(useNetworksStore, {
      networks: [testingNetwork],
    });
    mockStore(useInteractionStore, {
      connectionModalOpen: true,
      handleConnectionDecision: jest.fn(),
      currentConnectionDetails: {
        chainId: testingNetwork.chainId,
      },
    });
    renderComponent();
    fireEvent.click(screen.getByTestId(locators.connectionModalDenyButton));
    expect(screen.queryByTestId('connection-success')).not.toBeInTheDocument();
  });
  it('handle the interaction decision when connection is approve after showing success state', () => {
    mockStore(useErrorStore, {});
    mockStore(useNetworksStore, {
      networks: [testingNetwork],
    });
    const handleConnectionDecision = jest.fn();
    mockStore(useInteractionStore, {
      connectionModalOpen: true,
      handleConnectionDecision,
      currentConnectionDetails: {
        chainId: testingNetwork.chainId,
      },
    });
    renderComponent();
    fireEvent.click(screen.getByTestId(locators.connectionModalApproveButton));
    fireEvent.click(screen.getByTestId('connection-success'));
    expect(handleConnectionDecision).toHaveBeenCalledWith({
      approved: true,
      networkId: 'test',
    });
  });
  it('sets a global error if chainId could not be found', () => {
    mockStore(useNetworksStore, {
      networks: [testingNetwork],
    });
    const handleConnectionDecision = jest.fn();
    mockStore(useInteractionStore, {
      connectionModalOpen: true,
      handleConnectionDecision,
      currentConnectionDetails: {
        chainId: 'foo',
      },
    });
    const setError = jest.fn();
    mockStore(useErrorStore, {
      setError,
    });
    renderComponent();
    fireEvent.click(screen.getByTestId(locators.connectionModalApproveButton));
    fireEvent.click(screen.getByTestId('connection-success'));
    expect(setError).toHaveBeenCalledWith(
      new Error('Network could not be found with chainId foo')
    );
    expect(handleConnectionDecision).not.toHaveBeenCalled();
  });
});
