import { render } from '@testing-library/react';
import { AppStateProvider } from '../../../contexts/app-state/app-state-provider';
import { EpochIndividualRewardsTable } from './epoch-individual-rewards-table';

const mockData = {
  epoch: 4441,
  rewards: [
    {
      asset: 'tDAI',
      totalAmount: '5',
      decimals: 6,
      rewardTypes: {
        ACCOUNT_TYPE_GLOBAL_REWARD: {
          amount: '0',
          percentageOfTotal: '0',
        },
        ACCOUNT_TYPE_FEES_INFRASTRUCTURE: {
          amount: '5',
          percentageOfTotal: '0.00305237260923',
        },
        ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES: {
          amount: '0',
          percentageOfTotal: '0',
        },
        ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES: {
          amount: '0',
          percentageOfTotal: '0',
        },
        ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES: {
          amount: '0',
          percentageOfTotal: '0',
        },
        ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS: {
          amount: '0',
          percentageOfTotal: '0',
        },
      },
    },
  ],
};

describe('EpochIndividualRewardsTable', () => {
  it('should render correctly', () => {
    const { getByTestId } = render(
      <AppStateProvider>
        <EpochIndividualRewardsTable
          data={mockData}
          marketCreationQuantumMultiple={'1000'}
        />
      </AppStateProvider>
    );
    expect(getByTestId('epoch-individual-rewards-table')).toBeInTheDocument();
    expect(getByTestId('individual-rewards-asset')).toBeInTheDocument();
    expect(getByTestId('ACCOUNT_TYPE_GLOBAL_REWARD')).toBeInTheDocument();
    expect(getByTestId('ACCOUNT_TYPE_FEES_INFRASTRUCTURE')).toBeInTheDocument();
    expect(
      getByTestId('ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES')
    ).toBeInTheDocument();
    expect(
      getByTestId('ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES')
    ).toBeInTheDocument();
    expect(
      getByTestId('ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES')
    ).toBeInTheDocument();
    expect(
      getByTestId('ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS')
    ).toBeInTheDocument();
  });
});
