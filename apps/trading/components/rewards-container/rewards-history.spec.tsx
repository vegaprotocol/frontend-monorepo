import groupBy from 'lodash/groupBy';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RewardHistoryTable } from './rewards-history';
import { AccountType, AssetStatus } from '@vegaprotocol/types';
import { type AssetFieldsFragment } from '@vegaprotocol/assets';

const assets: Record<string, AssetFieldsFragment> = {
  asset1: {
    id: 'asset1',
    name: 'Asset 1',
    status: AssetStatus.STATUS_ENABLED,
    symbol: 'A ASSET',
    decimals: 0,
    quantum: '1',
    // @ts-ignore not needed
    source: {},
  },
  asset2: {
    id: 'asset2',
    name: 'Asset 2',
    status: AssetStatus.STATUS_ENABLED,
    symbol: 'B ASSET',
    decimals: 0,
    quantum: '1',
    // @ts-ignore not needed
    source: {},
  },
};

const rewardSummaries = [
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
  {
    node: {
      epoch: 7,
      assetId: assets.asset2.id,
      amount: '300',
      rewardType: AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
    },
  },
];

const getCell = (cells: HTMLElement[], colId: string) => {
  return within(
    cells.find((c) => c.getAttribute('col-id') === colId) as HTMLElement
  );
};

describe('RewardsHistoryTable', () => {
  const props = {
    epochRewardSummaries: {
      edges: rewardSummaries,
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
    loading: false,
  };

  it('renders table with accounts summed up by asset', () => {
    render(<RewardHistoryTable {...props} />);

    const containerLeft = within(
      document.querySelector('.ag-pinned-left-cols-container') as HTMLElement
    );
    const pinnedRows = containerLeft.getAllByRole('row');

    const containerCenter = within(
      document.querySelector('.ag-center-cols-container') as HTMLElement
    );
    const rows = containerCenter.getAllByRole('row');
    expect(rows).toHaveLength(
      Object.keys(groupBy(rewardSummaries, 'node.assetId')).length
    );

    let row = within(rows[0]);
    let pinnedRow = within(pinnedRows[0]);
    let cells = [
      ...pinnedRow.getAllByRole('gridcell'),
      ...row.getAllByRole('gridcell'),
    ];

    let assetCell = getCell(cells, 'asset.symbol');
    expect(assetCell.getByTestId('stack-cell-primary')).toHaveTextContent(
      assets.asset2.symbol
    );
    expect(assetCell.getByTestId('stack-cell-secondary')).toHaveTextContent(
      assets.asset2.name
    );

    // First row
    const marketCreationCell = getCell(cells, 'marketCreation');
    expect(
      marketCreationCell.getByTestId('stack-cell-primary')
    ).toHaveTextContent('300');
    expect(
      marketCreationCell.getByTestId('stack-cell-secondary')
    ).toHaveTextContent('50.00%');

    const infrastructureFeesCell = getCell(cells, 'infrastructureFees');
    expect(
      infrastructureFeesCell.getByTestId('stack-cell-primary')
    ).toHaveTextContent('300');
    expect(
      infrastructureFeesCell.getByTestId('stack-cell-secondary')
    ).toHaveTextContent('50.00%');

    let totalCell = getCell(cells, 'total');
    expect(totalCell.getByText('600.00')).toBeInTheDocument();

    // Second row
    row = within(rows[1]);
    pinnedRow = within(pinnedRows[1]);
    cells = [
      ...pinnedRow.getAllByRole('gridcell'),
      ...row.getAllByRole('gridcell'),
    ];

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

  it('changes epochs using pagination', async () => {
    const epochVariables = {
      from: 3,
      to: 4,
    };
    const onEpochChange = jest.fn();

    render(
      <RewardHistoryTable
        {...props}
        epoch={5}
        epochVariables={epochVariables}
        onEpochChange={onEpochChange}
      />
    );
    const fromInput = screen.getByLabelText('From epoch');
    const toInput = screen.getByLabelText('to');
    expect(fromInput).toHaveValue(epochVariables.from);
    expect(toInput).toHaveValue(epochVariables.to);

    const buttons = within(screen.getByTestId('fromEpoch')).getAllByRole(
      'button'
    );
    const fromInc = buttons[0];
    const decInc = buttons[1];

    await userEvent.click(fromInc);
    expect(onEpochChange).toHaveBeenCalledWith({ from: 4, to: 4 });

    await userEvent.click(decInc);
    expect(onEpochChange).toHaveBeenCalledWith({ from: 2, to: 4 });

    onEpochChange.mockClear();

    await userEvent.type(fromInput, '1');
    // no state control so typing will just append to whats there
    expect(onEpochChange).toHaveBeenCalledWith({ from: 31, to: 4 });
  });
});
