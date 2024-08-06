import { render, screen } from '@testing-library/react';

import { locators as subHeaderLocators } from '@/components/sub-header';
import { mockStore } from '@/test-helpers/mock-store';

import { useAccountsStore } from './accounts-store';
import { AssetsList, locators } from './assets-list';
import { useAccounts } from './use-accounts';

jest.mock('./use-accounts');
jest.mock('./accounts-store');

jest.mock('./asset-card', () => ({
  AssetCard: () => <div data-testid="asset-card" />,
}));

jest.mock('./asset-list-empty-state', () => ({
  AssetListEmptyState: () => <div data-testid="empty" />,
}));

jest.mock('@vegaprotocol/ui-toolkit', () => ({
  ...jest.requireActual('@vegaprotocol/ui-toolkit'),
  Notification: () => <div data-testid="error" />,
}));

const ASSET_ID_1 = '1'.repeat(64);
const ASSET_ID_2 = '2'.repeat(64);
const ID = '3'.repeat(64);

describe('AssetsList', () => {
  it('renders title, description and a card for each asset', () => {
    (useAccounts as unknown as jest.Mock).mockReturnValue({
      accountsByAsset: {
        [ASSET_ID_1]: [
          {
            owner: ID,
            balance: '40000000000000000000',
            asset: ASSET_ID_1,
            marketId: '',
            type: 'ACCOUNT_TYPE_GENERAL',
          },
        ],
        [ASSET_ID_2]: [
          {
            owner: ID,
            balance: '40000000000000000000',
            asset: ASSET_ID_2,
            marketId: '',
            type: 'ACCOUNT_TYPE_GENERAL',
          },
        ],
      },
    });
    mockStore(useAccountsStore, {
      error: null,
    });
    render(<AssetsList publicKey={'123'} />);
    expect(screen.getByTestId(subHeaderLocators.subHeader)).toHaveTextContent(
      'Balances'
    );
    expect(screen.getByTestId(locators.assetListDescription)).toHaveTextContent(
      'Recent balance changes caused by your open positions may not be reflected below'
    );
    expect(screen.getAllByTestId('asset-card')).toHaveLength(2);
  });

  it('renders empty state when there are no assets', () => {
    // 1125-KEYD-012 If I have no assets I am shown 2 assets with tradeable markets on Vega
    mockStore(useAccountsStore, {
      error: null,
    });
    (useAccounts as unknown as jest.Mock).mockReturnValue({
      accountsByAsset: {},
    });
    render(<AssetsList publicKey={'123'} />);
    expect(screen.getByTestId('empty')).toBeInTheDocument();
  });

  it('renders error state', () => {
    // 1125-KEYD-011 If the data fails to load I am presented with an error state
    mockStore(useAccountsStore, {
      error: new Error('Some error'),
    });
    (useAccounts as unknown as jest.Mock).mockReturnValue({
      accountsByAsset: {},
    });
    render(<AssetsList publicKey={'123'} />);
    expect(screen.getByTestId('error')).toBeInTheDocument();
  });
});
