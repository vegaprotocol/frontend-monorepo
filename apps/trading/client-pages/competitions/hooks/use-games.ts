import compact from 'lodash/compact';
import { useActiveRewardsQuery } from '../../../components/rewards-container/__generated__/Rewards';
import { isActiveReward } from '../../../components/rewards-container/active-rewards';
import { EntityScope, type TransferNode } from '@vegaprotocol/types';

const isScopedToTeams = (node: TransferNode) =>
  node.transfer.kind.__typename === 'RecurringTransfer' &&
  node.transfer.kind.dispatchStrategy?.entityScope ===
    EntityScope.ENTITY_SCOPE_TEAMS;

export const useGames = ({
  currentEpoch,
  onlyActive,
}: {
  currentEpoch: number;
  onlyActive: boolean;
}) => {
  const { data, loading, error } = useActiveRewardsQuery({
    variables: {
      isReward: true,
    },
    fetchPolicy: 'cache-and-network',
  });

  // const d: ActiveRewardsQuery = {
  //   transfersConnection: {
  //     edges: [
  //       {
  //         node: {
  //           transfer: {
  //             amount: '10000000',
  //             id: '6db4a5239151ba72dc5d61576ef0459e13bd109972621e1dc8813a0f9b84d952',
  //             from: 'd0ee848d70281144d1ac75ba89c51472464e3ffb2054f5ea1e592f62854ebdb3',
  //             fromAccountType: 'ACCOUNT_TYPE_GENERAL' as AccountType,
  //             to: 'network',
  //             toAccountType:
  //               'ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES' as AccountType,
  //             asset: {
  //               id: 'cfc41bd8dcf8819c005bb339f9a5f8b1f9141d16d6d374521f112146d7aa6508',
  //               symbol: 'tDAI',
  //               decimals: 5,
  //               name: 'tDAI',
  //               quantum: '1',
  //               status: 'STATUS_ENABLED' as AssetStatus,
  //               __typename: 'Asset',
  //             },
  //             reference: 'reward',
  //             status: 'STATUS_PENDING' as TransferStatus,
  //             timestamp: '2024-01-18T11:08:10.266487Z',
  //             kind: {
  //               startEpoch: 7,
  //               endEpoch: null,
  //               dispatchStrategy: {
  //                 dispatchMetric:
  //                   'DISPATCH_METRIC_MAKER_FEES_PAID' as DispatchMetric,
  //                 dispatchMetricAssetId:
  //                   'cfc41bd8dcf8819c005bb339f9a5f8b1f9141d16d6d374521f112146d7aa6508',
  //                 marketIdsInScope: null,
  //                 entityScope: 'ENTITY_SCOPE_TEAMS' as EntityScope,
  //                 individualScope:
  //                   'INDIVIDUAL_SCOPE_UNSPECIFIED' as IndividualScope,
  //                 teamScope: null,
  //                 nTopPerformers: '1',
  //                 stakingRequirement: '',
  //                 notionalTimeWeightedAveragePositionRequirement: '',
  //                 windowLength: 1,
  //                 lockPeriod: 1,
  //                 distributionStrategy:
  //                   'DISTRIBUTION_STRATEGY_PRO_RATA' as DistributionStrategy,
  //                 rankTable: null,
  //                 __typename: 'DispatchStrategy',
  //               },
  //               __typename: 'RecurringTransfer',
  //             },
  //             reason: null,
  //             __typename: 'Transfer',
  //           },
  //           fees: [],
  //           __typename: 'TransferNode',
  //         },
  //         __typename: 'TransferEdge',
  //       },
  //     ],
  //     __typename: 'TransferConnection',
  //   },
  // };

  const games = compact(data?.transfersConnection?.edges?.map((n) => n?.node))
    .map((n) => n as TransferNode)
    .filter((node) => {
      const recurring = node.transfer.kind.__typename === 'RecurringTransfer';
      const active = onlyActive ? isActiveReward(node, currentEpoch) : true;
      return recurring && active && isScopedToTeams(node);
    });

  return {
    data: games,
    loading,
    error,
  };
};
