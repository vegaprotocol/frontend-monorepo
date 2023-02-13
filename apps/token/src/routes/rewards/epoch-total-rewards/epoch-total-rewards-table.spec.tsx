import { render } from '@testing-library/react';
import { EpochTotalRewardsTable } from './epoch-total-rewards-table';
import { AccountType } from '@vegaprotocol/types';

const mockData = {
  epoch: 4431,
  assetRewards: [
    {
      assetId:
        'b340c130096819428a62e5df407fd6abe66e444b89ad64f670beb98621c9c663',
      name: 'tDAI TEST',
      rewards: [
        {
          rewardType: AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
          amount: '295',
        },
      ],
      totalAmount: '295',
    },
  ],
};

describe('EpochTotalRewardsTable', () => {
  it('should render correctly', () => {
    const { getByTestId } = render(<EpochTotalRewardsTable data={mockData} />);
    expect(getByTestId('epoch-total-rewards-table')).toBeInTheDocument();
    expect(getByTestId('asset')).toBeInTheDocument();
    expect(getByTestId('global')).toBeInTheDocument();
    expect(getByTestId('infra')).toBeInTheDocument();
    expect(getByTestId('taker')).toBeInTheDocument();
    expect(getByTestId('maker')).toBeInTheDocument();
    expect(getByTestId('liquidity')).toBeInTheDocument();
    expect(getByTestId('market-maker')).toBeInTheDocument();
    expect(getByTestId('total')).toBeInTheDocument();
  });
});
