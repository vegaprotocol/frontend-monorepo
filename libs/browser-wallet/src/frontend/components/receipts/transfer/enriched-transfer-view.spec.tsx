import { render, screen } from '@testing-library/react';
import { AccountType } from '@vegaprotocol/protos/vega/AccountType';
import {
  type vegaAsset,
  vegaAssetStatus,
} from '@vegaprotocol/rest-clients/dist/trading-data';

import { useAssetsStore } from '@/stores/assets-store';
import { useWalletStore } from '@/stores/wallets';
import { mockStore } from '@/test-helpers/mock-store';
import { type Key } from '@/types/backend';

import { locators as priceWithSymbolLocators } from '../utils/string-amounts/amount-with-symbol';
import {
  EnrichedTransferView,
  locators as enrichedLocators,
} from './enriched-transfer-view';

jest.mock('@/stores/wallets', () => ({
  useWalletStore: jest.fn(),
}));

jest.mock('@/stores/assets-store', () => ({
  useAssetsStore: jest.fn(),
}));

const mockTransaction = {
  transfer: {
    amount: '1',
    asset: '0'.repeat(64),
    to: '1'.repeat(64),
    fromAccountType: AccountType.ACCOUNT_TYPE_BOND,
    toAccountType: AccountType.ACCOUNT_TYPE_BOND,
    reference: 'reference',
    kind: null,
  },
};

const mockAsset: vegaAsset = {
  id: 'b340c130096819428a62e5df407fd6abe66e444b89ad64f670beb98621c9c663',
  details: {
    name: 'tDAI TEST',
    symbol: 'tDAI',
    decimals: '5',
    quantum: '1',
    erc20: {
      contractAddress: '0x26223f9C67871CFcEa329975f7BC0C9cB8FBDb9b',
      lifetimeLimit: '0',
      withdrawThreshold: '0',
    },
  },
  status: vegaAssetStatus.STATUS_ENABLED,
};

const mockStores = (keyDetails: Key | undefined) => {
  mockStore(useAssetsStore, {
    loading: false,
    assets: [],
    getAssetById: jest.fn().mockReturnValue(mockAsset),
  });
  mockStore(useWalletStore, { getKeyById: () => keyDetails });
};

describe('EnrichedTransferView', () => {
  it('renders correctly', () => {
    // 1124-TRAN-006 I can see the enriched price details if the data is provided - correctly formatted decimals and asset name
    mockStores({
      index: 0,
      name: 'MyKey',
      publicKey: '1'.repeat(64),
    });

    render(<EnrichedTransferView transaction={mockTransaction} />);

    expect(
      screen.getByTestId(enrichedLocators.enrichedSection)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(priceWithSymbolLocators.amountWithSymbol)
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(priceWithSymbolLocators.amount)
    ).toHaveTextContent('0.00001');
    expect(
      screen.getByTestId(priceWithSymbolLocators.symbol)
    ).toHaveTextContent('tDAI');
  });

  it('renders nothing if the amount could not be formatted', () => {
    mockStore(useAssetsStore, {
      loading: true,
      assets: [],
      getAssetById: jest.fn().mockReturnValue(mockAsset),
    });
    mockStore(useWalletStore, {
      getKeyById: () => ({
        index: 0,
        name: 'MyKey',
        publicKey: '1'.repeat(64),
      }),
    });

    const { container } = render(
      <EnrichedTransferView transaction={mockTransaction} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
