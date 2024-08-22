import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import locators from '@/components/locators';
import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';
import { useAssetsStore } from '@/stores/assets-store';
import { useMarketsStore } from '@/stores/markets-store';
import { useWalletStore } from '@/stores/wallets';
import { mockStore } from '@/test-helpers/mock-store';

import { Auth } from './auth';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: () => <div data-testid="outlet" />,
}));

jest.mock('@/contexts/json-rpc/json-rpc-context', () => ({
  useJsonRpcClient: () => ({ request: jest.fn() }),
}));

jest.mock('@/stores/wallets');
jest.mock('@/stores/assets-store');
jest.mock('@/stores/markets-store');

jest.mock('@/components/modals', () => ({
  ModalWrapper: () => <div data-testid="modal-wrapper" />,
}));

const mockStores = () => {
  const loadWallets = jest.fn();
  const fetchAssets = jest.fn();
  const fetchMarkets = jest.fn();
  mockStore(useWalletStore, {
    loadWallets,
  });
  mockStore(useAssetsStore, {
    fetchAssets,
  });
  mockStore(useMarketsStore, {
    fetchMarkets,
  });

  return {
    loadWallets,
    fetchAssets,
    fetchMarkets,
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
  });
  it('loads the users wallets, networks, assets and markets', () => {
    const { loadWallets, fetchAssets, fetchMarkets } = mockStores();
    renderComponent();

    expect(loadWallets).toHaveBeenCalledTimes(1);
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
    const { container } = renderComponent();

    expect(container).toBeEmptyDOMElement();
  });
});
