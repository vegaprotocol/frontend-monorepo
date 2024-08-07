import { render, screen } from '@testing-library/react';
import {
  vegaAccount,
  vegaAccountType,
  vegaAsset,
} from '@vegaprotocol/rest-clients/dist/trading-data';

import { locators as dataTableLocators } from '@/components/data-table';
import { useAssetsStore } from '@/stores/assets-store';
import { mockStore } from '@/test-helpers/mock-store';
import { silenceErrors } from '@/test-helpers/silence-errors';

import { AssetCard, locators } from './asset-card';

const assetId = '1'.repeat(64);

jest.mock('@/stores/assets-store');
jest.mock('./markets-lozenges', () => ({
  MarketLozenges: () => <div data-testid="market-lozenges" />,
}));

const renderComponent = (
  assetInfo: vegaAsset | undefined,
  accounts: vegaAccount[]
) => {
  mockStore(useAssetsStore, {
    getAssetById: () => assetInfo,
  });

  render(<AssetCard accounts={accounts} assetId={assetId} />);
};

describe('AssetCard', () => {
  it('throws error if asset details are not populated', () => {
    silenceErrors();
    const account = {
      balance: '1',
      asset: assetId,
      market: '2'.repeat(64),
      party: '3'.repeat(64),
      type: vegaAccountType.ACCOUNT_TYPE_GENERAL,
    };
    expect(() =>
      renderComponent(
        {
          details: {
            decimals: undefined,
            symbol: 'foo',
            name: 'foo',
          },
        },
        [account]
      )
    ).toThrow('Asset details not populated');

    expect(() =>
      renderComponent(
        {
          details: {
            decimals: 'foo',
            symbol: undefined,
            name: 'foo',
          },
        },
        [account]
      )
    ).toThrow('Asset details not populated');

    expect(() =>
      renderComponent(
        {
          details: {
            decimals: 'foo',
            symbol: 'foo',
            name: undefined,
          },
        },
        [account]
      )
    ).toThrow('Asset details not populated');
  });
  it('renders header with total, symbol, name, market lozenges and row for each account', () => {
    // 1125-KEYD-003 I can see the balance of each (the sum across ALL account types)
    // 1125-KEYD-004 There is a button / icon that allows me to expand the view to show the breakdown of all non-zero accounts for that asset
    renderComponent(
      {
        details: {
          decimals: '5',
          symbol: 'Foo',
          name: 'Foobarbaz',
        },
      },
      [
        {
          balance: '1',
          asset: assetId,
          type: vegaAccountType.ACCOUNT_TYPE_GENERAL,
        },
        {
          balance: '2',
          asset: assetId,
          type: vegaAccountType.ACCOUNT_TYPE_FEES_MAKER,
        },
      ]
    );

    expect(screen.getByTestId(locators.assetHeaderName)).toHaveTextContent(
      'Foobarbaz'
    );
    expect(screen.getByTestId(locators.assetHeaderSymbol)).toHaveTextContent(
      'Foo'
    );
    expect(screen.getByTestId(locators.assetHeaderTotal)).toHaveTextContent(
      '0.00003'
    );
    expect(screen.getByTestId('market-lozenges')).toBeInTheDocument();

    const rows = screen.getAllByTestId(dataTableLocators.dataRow);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('General');
    expect(rows[0]).toHaveTextContent('0.00001');
    expect(rows[1]).toHaveTextContent('Fees (maker)');
    expect(rows[1]).toHaveTextContent('0.00002');
  });
  it('renders unknown if account type could not be found', () => {
    renderComponent(
      {
        details: {
          decimals: '5',
          symbol: 'Foo',
          name: 'Foobarbaz',
        },
      },
      [
        {
          balance: '1',
          asset: assetId,
        },
      ]
    );

    const rows = screen.getAllByTestId(dataTableLocators.dataRow);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent('Unknown');
    expect(rows[0]).toHaveTextContent('0.00001');
  });
});
