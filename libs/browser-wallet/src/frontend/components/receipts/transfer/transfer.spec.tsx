import { render, screen } from '@testing-library/react';
import {
  type vegaAsset,
  vegaAssetStatus,
} from '@vegaprotocol/rest-clients/dist/trading-data';

import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';
import { useAssetsStore } from '@/stores/assets-store';
import { useWalletStore } from '@/stores/wallets';
import { mockStore } from '@/test-helpers/mock-store';
import { type Key } from '@/types/backend';

import { locators, Transfer } from './transfer';
import { AccountType } from '@vegaprotocol/enums';

jest.mock('./basic-transfer-view', () => ({
  BasicTransferView: () => <div data-testid="basic-transfer-view" />,
}));

jest.mock('./enriched-transfer-view', () => ({
  EnrichedTransferView: () => <div data-testid="enriched-transfer-view" />,
}));

jest.mock('../utils/receipt-wrapper', () => ({
  ReceiptWrapper: ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="receipt-wrapper">{children}</div>;
  },
}));

jest.mock('@/stores/assets-store', () => ({
  useAssetsStore: jest.fn(),
}));

jest.mock('@/stores/wallets', () => ({
  useWalletStore: jest.fn(),
}));

const baseTransfer = {
  amount: '1',
  asset: '0'.repeat(64),
  to: '1'.repeat(64),
  fromAccountType: AccountType.ACCOUNT_TYPE_BOND,
  toAccountType: AccountType.ACCOUNT_TYPE_BOND,
  reference: 'reference',
  kind: null,
  from: '1'.repeat(64),
};

const mockAsset: vegaAsset = {
  id: 'fc7fd956078fb1fc9db5c19b88f0874c4299b2a7639ad05a47a28c0aef291b55',
  details: {
    name: 'Vega (fairground)',
    symbol: 'VEGA',
    decimals: '18',
    quantum: '1',
    erc20: {
      contractAddress: '0xdf1B0F223cb8c7aB3Ef8469e529fe81E73089BD9',
      lifetimeLimit: '0',
      withdrawThreshold: '0',
    },
  },
  status: vegaAssetStatus.STATUS_ENABLED,
};

const mockWallets = [
  {
    name: 'Wallet 1',
    keys: [
      {
        name: 'Key 1',
        publicKey: '1'.repeat(64),
        index: 1,
      },
    ],
  },
];

const mockStores = (asset: vegaAsset | undefined, key?: Key) => {
  mockStore(useAssetsStore, {
    loading: false,
    assets: [],
    getAssetById: jest.fn().mockReturnValue(asset),
  });
  mockStore(useWalletStore, {
    loading: false,
    wallets: mockWallets,
    getKeyById: jest.fn().mockReturnValue(key),
  });
};

const renderComponent = (transaction: any) =>
  render(
    <MockNetworkProvider>
      <Transfer transaction={transaction} />
    </MockNetworkProvider>
  );

describe('TransferReceipt', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(1000);
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render nothing if the transfer type is recurring', () => {
    mockStores(mockAsset);
    const recurringTransfer = {
      transfer: {
        ...baseTransfer,
        recurring: {
          startEpoch: 0,
          endEpoch: 1,
          factor: '1',
        },
      },
    };

    const { container } = renderComponent(recurringTransfer);
    expect(container).toBeEmptyDOMElement();
  });

  it('if transfer time is in the past renders immediate', () => {
    // 1124-TRAN-002 For a oneOff transfer which is has a delivery date in the past there is a way to see that the transfer will be executed immediately
    mockStore(useWalletStore, {
      loading: false,
      wallets: mockWallets,
      getKeyById: jest.fn().mockReturnValue(undefined),
    });

    const oneOffTransfer = {
      transfer: {
        ...baseTransfer,
        oneOff: {
          deliverOn: '0',
        },
      },
    };
    renderComponent(oneOffTransfer);
    expect(screen.getByTestId(locators.whenElement)).toHaveTextContent(
      'Immediate'
    );
  });

  it('if deliverOn is not provided renders immediate', () => {
    mockStores(mockAsset);

    const oneOffTransfer = {
      transfer: {
        ...baseTransfer,
      },
    };
    renderComponent(oneOffTransfer);

    expect(screen.getByTestId(locators.whenElement)).toHaveTextContent(
      'Immediate'
    );
  });

  it('if transfer is in future then it renders relative & absolute time', () => {
    // 1124-TRAN-003 For a oneOff transfer which is has a delivery date in the future there is a way to see when the transfer will be delivered
    mockStores(mockAsset);

    const oneOffTransfer = {
      transfer: {
        ...baseTransfer,
        oneOff: {
          deliverOn: (1000 * 1000 * 1000 * 60 * 60 * 24 * 100).toString(),
        },
      },
    };
    renderComponent(oneOffTransfer);

    expect(screen.getByTestId(locators.whenElement)).toHaveTextContent(
      'in 3 months'
    );
    expect(screen.getByTestId(locators.whenElement)).toHaveTextContent(
      '4/11/1970, 12:00:00 AM'
    );
  });

  it('should render a warning if the key is not in the wallet', () => {
    // 1124-TRAN-007 I can see a warning if the key is not present in my wallet
    mockStores(mockAsset);
    mockStore(useWalletStore, {
      loading: false,
      wallets: [],
      getKeyById: jest.fn().mockReturnValue(undefined),
    });
    renderComponent({
      transfer: {
        ...baseTransfer,
        to: '2'.repeat(64),
      },
    });

    const notification = screen.getByTestId('notification');
    expect(notification).toHaveTextContent('External key');
    expect(notification).toHaveTextContent(
      'This key is not imported into your app. Please ensure this is the key you want to transfer to before confirming.'
    );
  });

  it('should render BasicTransferView whilst loading', async () => {
    mockStore(useAssetsStore, {
      loading: true,
      assets: [],
    });
    mockStore(useWalletStore, {
      loading: false,
      wallets: [],
      getKeyById: jest.fn().mockReturnValue(undefined),
    });
    const oneOffTransfer = {
      transfer: {
        ...baseTransfer,
        oneOff: {
          deliverOn: '0',
        },
      },
    };
    renderComponent(oneOffTransfer);

    expect(screen.getByTestId('basic-transfer-view')).toBeVisible();
  });

  it('should render EnrichedTransferView when loading is false', () => {
    mockStores(mockAsset);

    const oneOffTransfer = {
      transfer: {
        ...baseTransfer,
        oneOff: {
          deliverOn: '0',
        },
      },
    };
    renderComponent(oneOffTransfer);

    expect(screen.getByTestId('enriched-transfer-view')).toBeVisible();
  });

  it('should render show EnrichedTransferView showing key data when available', () => {
    mockStores(mockAsset, {
      index: 0,
      name: 'Key 1',
      publicKey: '1'.repeat(64),
    });

    const oneOffTransfer = {
      transfer: {
        ...baseTransfer,
        oneOff: {
          deliverOn: '0',
        },
      },
    };
    renderComponent(oneOffTransfer);

    expect(screen.getByTestId('enriched-transfer-view')).toBeVisible();
  });

  it('should render nothing while wallets are loading', () => {
    mockStore(useAssetsStore, {
      loading: false,
      assets: [],
      getAssetById: jest.fn().mockReturnValue(mockAsset),
    });
    mockStore(useWalletStore, {
      loading: true,
      wallets: [],
      getKeyById: jest.fn(),
    });

    const oneOffTransfer = {
      transfer: {
        ...baseTransfer,
        oneOff: {
          deliverOn: '0',
        },
      },
    };

    const { container } = renderComponent(oneOffTransfer);
    expect(container).toBeEmptyDOMElement();
  });
});
