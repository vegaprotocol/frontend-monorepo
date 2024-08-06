import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { locators as pageLocators } from '@/components/pages/page';
import { useAssetsStore } from '@/stores/assets-store';
import { useMarketsStore } from '@/stores/markets-store';
import { useWalletStore } from '@/stores/wallets';
import { mockStore } from '@/test-helpers/mock-store';
import { silenceErrors } from '@/test-helpers/silence-errors';

import { FULL_ROUTES } from '../../../route-names';
import { KeyDetailsPage } from './key-details-page';

jest.mock('./export-private-key-dialog', () => ({
  ExportPrivateKeysDialog: () => (
    <div data-testid="export-private-key-dialog" />
  ),
}));

jest.mock('./rename-key-dialog', () => ({
  RenameKeyDialog: () => <div data-testid="rename-key-dialog" />,
}));

jest.mock('./key-selector', () => ({
  KeySelector: () => <div data-testid="key-selector" />,
}));

jest.mock('@/components/keys/vega-key', () => ({
  VegaKey: () => <div data-testid="vega-key" />,
}));

jest.mock('./assets-list', () => ({
  AssetsList: () => <div data-testid="assets-list" />,
}));

jest.mock('@/stores/assets-store');
jest.mock('@/stores/wallets');
jest.mock('@/stores/markets-store');

const mockRequest = jest.fn().mockResolvedValue(null);

jest.mock('@/contexts/json-rpc/json-rpc-context', () => ({
  useJsonRpcClient: () => ({
    request: mockRequest,
  }),
}));

const ID = '1'.repeat(64);

const renderComponent = () => {
  return render(
    <MemoryRouter>
      <KeyDetailsPage id={ID} />
    </MemoryRouter>
  );
};

describe('KeyDetailsPage', () => {
  it('throws error if the key cannot be found', () => {
    silenceErrors();
    mockStore(useWalletStore, {
      loading: false,
      getKeyById: () => {},
    });
    mockStore(useAssetsStore, {
      loading: false,
    });
    mockStore(useMarketsStore, {
      loading: false,
    });
    expect(() => render(<KeyDetailsPage id={ID} />)).toThrow(
      `Key with id ${ID} not found`
    );
  });

  it('renders nothing while loading assets', () => {
    mockStore(useWalletStore, {
      loading: false,
      getKeyById: () => ({
        publicKey: ID,
        name: 'test',
      }),
    });
    mockStore(useMarketsStore, {
      loading: false,
    });
    mockStore(useAssetsStore, {
      loading: true,
    });
    const { container } = render(<KeyDetailsPage id={ID} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the back button, key selector, vega key indicator, title, description and export button', () => {
    // 1125-KEYD-002 There is a warning to remember that if I hold an open position the balance / totals may not be accurate as is constantly changing
    // 1125-KEYD-005 There is a way to switch between keys (or to easily navigate back to the keys page to achieve this)
    // 1125-KEYD-007 In the key details screen I can see my currently selected key and associated info
    // 1125-KEYD-008 There is a way to export a private key
    mockStore(useWalletStore, {
      loading: false,
      getKeyById: () => ({
        publicKey: ID,
        name: 'test',
      }),
    });
    mockStore(useMarketsStore, {
      loading: false,
    });
    mockStore(useAssetsStore, {
      loading: false,
    });
    renderComponent();
    expect(screen.getByTestId('key-selector')).toBeInTheDocument();
    expect(screen.getByTestId('vega-key')).toBeInTheDocument();
    expect(screen.getByTestId('export-private-key-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('rename-key-dialog')).toBeInTheDocument();
    expect(screen.getByTestId(pageLocators.basePageBack)).toHaveAttribute(
      'href',
      FULL_ROUTES.wallets
    );
  });

  it('renders asset assets list', () => {
    mockStore(useWalletStore, {
      loading: false,
      getKeyById: () => ({
        publicKey: ID,
        name: 'test',
      }),
    });
    mockStore(useAssetsStore, {
      loading: false,
    });
    mockStore(useMarketsStore, {
      loading: false,
    });
    renderComponent();
    expect(screen.getByTestId('key-selector')).toBeInTheDocument();
    expect(screen.getByTestId('vega-key')).toBeInTheDocument();
    expect(screen.getByTestId('assets-list')).toBeInTheDocument();
  });
});
