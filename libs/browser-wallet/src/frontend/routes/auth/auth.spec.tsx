import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import locators from '@/components/locators';
import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';
import { useAssetsStore } from '@/stores/assets-store';
import { useConnectionStore } from '@/stores/connections';
import { useMarketsStore } from '@/stores/markets-store';
import { useNetworksStore } from '@/stores/networks-store';
import { useWalletStore } from '@/stores/wallets';
import { mockStore } from '@/test-helpers/mock-store';

// import { FULL_ROUTES } from '../route-names';
import { Auth } from './auth';

jest.mock('@/components/page-header', () => ({
  PageHeader: () => <div data-testid="page-header" />,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: () => <div data-testid="outlet" />,
}));

jest.mock('@/contexts/json-rpc/json-rpc-context', () => ({
  useJsonRpcClient: () => ({ request: jest.fn() }),
}));

jest.mock('@/stores/wallets');
jest.mock('@/stores/assets-store');
jest.mock('@/stores/networks-store');
jest.mock('@/stores/markets-store');
jest.mock('@/stores/connections');

jest.mock('@/components/modals', () => ({
  ModalWrapper: () => <div data-testid="modal-wrapper" />,
}));

jest.mock('@/components/dapps-header', () => ({
  DappsHeader: () => <div data-testid="dapps-header" />,
}));

const mockStores = () => {
  const loadWallets = jest.fn();
  const fetchAssets = jest.fn();
  const fetchMarkets = jest.fn();
  const loadNetworks = jest.fn();
  const loadConnections = jest.fn();
  mockStore(useWalletStore, {
    loadWallets,
  });
  mockStore(useNetworksStore, {
    loadNetworks,
  });
  mockStore(useAssetsStore, {
    fetchAssets,
  });
  mockStore(useMarketsStore, {
    fetchMarkets,
  });
  mockStore(useConnectionStore, {
    loadConnections,
  });
  mockStore(useNetworksStore, {});

  return {
    loadWallets,
    fetchAssets,
    fetchMarkets,
    loadConnections,
  };
};

const renderComponent = (route: string = '') => {
  return render(
    <MockNetworkProvider>
      <MemoryRouter initialEntries={[route]}>
        <Auth />
      </MemoryRouter>
    </MockNetworkProvider>
  );
};

describe('Auth', () => {
  it('renders outlet, header and navbar', () => {
    mockStores();
    renderComponent();

    expect(screen.getByTestId(locators.navBar)).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.getByTestId('modal-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('page-header')).toBeInTheDocument();
  });
  it('loads the users wallets, networks, assets and markets', () => {
    const { loadWallets, fetchAssets, fetchMarkets, loadConnections } =
      mockStores();
    renderComponent();

    expect(loadWallets).toHaveBeenCalledTimes(1);
    expect(loadConnections).toHaveBeenCalledTimes(1);
    expect(fetchAssets).toHaveBeenCalledTimes(1);
    expect(fetchMarkets).toHaveBeenCalledTimes(1);
  });
  it('renders nothing if wallets are loading', () => {
    mockStore(useWalletStore, {
      loadWallets: jest.fn(),
      loading: true,
    });
    mockStore(useAssetsStore, {
      fetchAssets: jest.fn(),
    });
    mockStore(useMarketsStore, {
      fetchMarkets: jest.fn(),
    });
    mockStore(useNetworksStore, {});
    const { container } = renderComponent();

    expect(container).toBeEmptyDOMElement();
  });
  it('renders nothing if networks are loading', () => {
    mockStore(useWalletStore, {
      loadWallets: jest.fn(),
    });
    mockStore(useAssetsStore, {
      fetchAssets: jest.fn(),
    });
    mockStore(useMarketsStore, {
      fetchMarkets: jest.fn(),
    });
    mockStore(useNetworksStore, {
      loading: true,
    });
    const { container } = renderComponent();
    expect(container).toBeEmptyDOMElement();
  });
});
