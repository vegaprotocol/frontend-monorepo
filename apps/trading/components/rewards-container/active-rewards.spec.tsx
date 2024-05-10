import { render, screen } from '@testing-library/react';
import { applyFilter } from './active-rewards';
import {
  AccountType,
  AssetStatus,
  DispatchMetric,
  type DispatchStrategy,
  DistributionStrategy,
  EntityScope,
  IndividualScope,
  type StakingDispatchStrategy,
  TransferStatus,
  type Transfer,
} from '@vegaprotocol/types';
import { type EnrichedRewardTransfer } from '../../lib/hooks/use-rewards';
import { ActiveRewardCard } from './reward-card';

jest.mock('../../lib/hooks/__generated__/Rewards', () => ({
  useTWAPQuery: () => ({
    data: {
      timeWeightedNotionalPosition: {
        timeWeightedNotionalPosition: '1.00',
      },
    },
  }),
}));

describe('ActiveRewards', () => {
  const reward: EnrichedRewardTransfer<
    DispatchStrategy | StakingDispatchStrategy
  > = {
    __typename: 'TransferNode',
    transfer: {
      __typename: 'Transfer',
      amount: '1613000000',
      id: 'c4e59bd389c8098e6c7669f2d3e1613b9f42d30b1c4c3793ac44380f4c522835',
      from: '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f',
      fromAccountType: AccountType.ACCOUNT_TYPE_GENERAL,
      to: 'network',
      toAccountType: AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES,
      asset: {
        __typename: 'Asset',
        id: 'c9fe6fc24fce121b2cc72680543a886055abb560043fda394ba5376203b7527d',
        symbol: 'tUSDC',
        decimals: 5,
        name: 'tUSDC TEST',
        quantum: '1',
        status: AssetStatus.STATUS_ENABLED,
        source: {
          __typename: 'ERC20' as const,
          contractAddress: '0x123',
          lifetimeLimit: '100',
          withdrawThreshold: '100',
          chainId: '1',
        },
      },
      reference: 'reward',
      status: TransferStatus.STATUS_PENDING,
      timestamp: '2023-12-18T13:05:35.948706Z',
      kind: {
        __typename: 'RecurringTransfer',
        startEpoch: 115332,
        endEpoch: 115432,
        factor: '1',
        dispatchStrategy: {
          __typename: 'DispatchStrategy',
          dispatchMetric: DispatchMetric.DISPATCH_METRIC_LP_FEES_RECEIVED,
          dispatchMetricAssetId:
            'c9fe6fc24fce121b2cc72680543a886055abb560043fda394ba5376203b7527d',
          marketIdsInScope: null,
          entityScope: EntityScope.ENTITY_SCOPE_INDIVIDUALS,
          individualScope: IndividualScope.INDIVIDUAL_SCOPE_ALL,
          teamScope: null,
          nTopPerformers: '',
          stakingRequirement: '',
          notionalTimeWeightedAveragePositionRequirement: '',
          windowLength: 1,
          lockPeriod: 0,
          distributionStrategy:
            DistributionStrategy.DISTRIBUTION_STRATEGY_PRO_RATA,
          rankTable: null,
          transferInterval: 1,
        },
      },
      reason: null,
    },
    fees: [],
  };

  it('renders with valid props', () => {
    render(<ActiveRewardCard transferNode={reward} currentEpoch={115500} />);

    expect(
      screen.getByText(/Liquidity provision fees received/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Individual scope')).toBeInTheDocument();
    expect(screen.getByText('Average position')).toBeInTheDocument();
    expect(screen.getByText('Ends in')).toBeInTheDocument();
    expect(screen.getByText('Pays every')).toBeInTheDocument();
    expect(screen.getByText('Assessed over')).toBeInTheDocument();
    expect(screen.getByTestId('assessed-over')).toHaveTextContent('1 epoch');
    expect(screen.getByTestId('pays-every')).toHaveTextContent('1 epoch');
    expect(screen.getByTestId('ends-in')).toHaveTextContent('Ended');
  });

  describe('applyFilter', () => {
    it('returns true when filter matches dispatch metric label', () => {
      const transfer = {
        kind: {
          __typename: 'RecurringTransfer',
          dispatchStrategy: {
            dispatchMetric: DispatchMetric.DISPATCH_METRIC_AVERAGE_POSITION,
          },
        },
        asset: { symbol: 'XYZ' },
      } as Transfer;
      const filter = { searchTerm: 'average position' };
      expect(applyFilter({ transfer }, filter)).toBeTruthy();
    });

    it('returns true when filter matches asset symbol', () => {
      const transfer = {
        kind: {
          __typename: 'RecurringTransfer',
          dispatchStrategy: {
            dispatchMetric: DispatchMetric.DISPATCH_METRIC_AVERAGE_POSITION,
          },
        },
        asset: { symbol: 'XYZ' },
      } as Transfer;
      const filter = { searchTerm: 'average position' };
      expect(applyFilter({ transfer }, filter)).toBeTruthy();
    });
  });
});
