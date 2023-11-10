import groupBy from 'lodash/groupBy';
import { render, within } from '@testing-library/react';
import { RewardHistoryTable } from './rewards-history';
import type { AssetSource} from '@vegaprotocol/types';
import { AccountType, AssetStatus } from '@vegaprotocol/types';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';

describe('RewarsHistoryTable', () => {
  const assets: Record<string, AssetFieldsFragment> = {
    asset1: {
      id: 'asset1',
      name: 'Asset 1',
      status: AssetStatus.STATUS_ENABLED,
      symbol: 'A ASSET',
      decimals: 0,
      quantum: '1',
      // @ts-ignore this field not needed here
      source: {} as AssetSource,
    },
    asset2: {
      id: 'asset2',
      name: 'Asset 2',
      status: AssetStatus.STATUS_ENABLED,
      symbol: 'B ASSET',
      decimals: 0,
      quantum: '1',
      // @ts-ignore this field not needed here
      source: {} as AssetSource,
    },
  };

  const props = {
    epochRewardSummaries: {
      edges: [
        {
          node: {
            epoch: 9,
            assetId: assets.asset1.id,
            amount: '60',
            rewardType: AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
          },
        },
        {
          node: {
            epoch: 8,
            assetId: assets.asset1.id,
            amount: '20',
            rewardType: AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
          },
        },
        {
          node: {
            epoch: 8,
            assetId: assets.asset1.id,
            amount: '20',
            rewardType: AccountType.ACCOUNT_TYPE_REWARD_AVERAGE_POSITION,
          },
        },
        {
          node: {
            epoch: 7,
            assetId: assets.asset2.id,
            amount: '300',
            rewardType: AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS,
          },
        },
      ],
    },
    partyRewards: {
      edges: [],
    },
    assets,
    pubKey: 'pubkey',
    epoch: 10,
    epochVariables: {
      from: 1,
      to: 10,
    },
    onEpochChange: jest.fn(),
  };

  const getCell = (cells: HTMLElement[], colId: string) => {
    return within(
      cells.find((c) => c.getAttribute('col-id') === colId) as HTMLElement
    );
  };

  it('Renders table with accounts summed up by asset', async () => {
    render(<RewardHistoryTable {...props} />);

    const container = within(
      document.querySelector('.ag-center-cols-container') as HTMLElement
    );
    const rows = container.getAllByRole('row');
    expect(rows).toHaveLength(
      Object.keys(groupBy(props.epochRewardSummaries.edges, 'node.assetId'))
        .length
    );

    let row = within(rows[0]);
    let cells = row.getAllByRole('gridcell');

    let assetCell = getCell(cells, 'asset.symbol');
    expect(assetCell.getByTestId('stack-cell-primary')).toHaveTextContent(
      assets.asset2.symbol
    );
    expect(assetCell.getByTestId('stack-cell-secondary')).toHaveTextContent(
      assets.asset2.name
    );

    const marketCreationCell = getCell(cells, 'marketCreation');
    expect(
      marketCreationCell.getByTestId('stack-cell-primary')
    ).toHaveTextContent('300');
    expect(
      marketCreationCell.getByTestId('stack-cell-secondary')
    ).toHaveTextContent('100.00%');

    let totalCell = getCell(cells, 'total');
    expect(totalCell.getByText('300.00')).toBeInTheDocument();

    row = within(rows[1]);
    cells = row.getAllByRole('gridcell');

    assetCell = getCell(cells, 'asset.symbol');
    expect(assetCell.getByTestId('stack-cell-primary')).toHaveTextContent(
      assets.asset1.symbol
    );
    expect(assetCell.getByTestId('stack-cell-secondary')).toHaveTextContent(
      assets.asset1.name
    );

    // check cells are summed and percentage of totals are shown
    const priceTakingCell = getCell(cells, 'priceTaking');
    expect(priceTakingCell.getByTestId('stack-cell-primary')).toHaveTextContent(
      '80'
    );
    expect(
      priceTakingCell.getByTestId('stack-cell-secondary')
    ).toHaveTextContent('80.00%');

    const avgPositionCell = getCell(cells, 'averagePosition');
    expect(avgPositionCell.getByTestId('stack-cell-primary')).toHaveTextContent(
      '20'
    );
    expect(
      avgPositionCell.getByTestId('stack-cell-secondary')
    ).toHaveTextContent('20.00%');

    totalCell = getCell(cells, 'total');
    expect(totalCell.getByText('100.00')).toBeInTheDocument();
  });
});
