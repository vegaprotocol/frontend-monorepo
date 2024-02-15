import compact from 'lodash/compact';
import { useActiveRewardsQuery } from '../../components/rewards-container/__generated__/Rewards';
import { isActiveReward } from '../../components/rewards-container/active-rewards';
import {
  type RecurringTransfer,
  type TransferNode,
  EntityScope,
  IndividualScope,
} from '@vegaprotocol/types';
import {
  type AssetFieldsFragment,
  useAssetsMapProvider,
} from '@vegaprotocol/assets';
import {
  type MarketFieldsFragment,
  useMarketsMapProvider,
} from '@vegaprotocol/markets';
import { type ApolloError } from '@apollo/client';

export type EnrichedTransfer = TransferNode & {
  asset?: AssetFieldsFragment | null;
  markets?: (MarketFieldsFragment | null)[];
};

type RecurringTransferKind = EnrichedTransfer & {
  transfer: {
    kind: RecurringTransfer;
  };
};

export const isScopedToTeams = (
  node: TransferNode
): node is RecurringTransferKind =>
  node.transfer.kind.__typename === 'RecurringTransfer' &&
  // scoped to teams
  (node.transfer.kind.dispatchStrategy?.entityScope ===
    EntityScope.ENTITY_SCOPE_TEAMS ||
    // or to individuals
    (node.transfer.kind.dispatchStrategy?.entityScope ===
      EntityScope.ENTITY_SCOPE_INDIVIDUALS &&
      // but they have to be in a team
      node.transfer.kind.dispatchStrategy.individualScope ===
        IndividualScope.INDIVIDUAL_SCOPE_IN_TEAM));

export const useGameCards = ({
  currentEpoch,
  onlyActive,
}: {
  currentEpoch: number;
  onlyActive: boolean;
}): { data: EnrichedTransfer[]; loading: boolean; error?: ApolloError } => {
  const { data, loading, error } = useActiveRewardsQuery({
    variables: {
      isReward: true,
    },
    fetchPolicy: 'cache-and-network',
  });

  const { data: assets, loading: assetsLoading } = useAssetsMapProvider();
  const { data: markets, loading: marketsLoading } = useMarketsMapProvider();

  const games = compact(data?.transfersConnection?.edges?.map((n) => n?.node))
    .map((n) => n as TransferNode)
    .filter((node) => {
      const active = onlyActive ? isActiveReward(node, currentEpoch) : true;
      return active && isScopedToTeams(node);
    })
    .map((node) => {
      if (node.transfer.kind.__typename !== 'RecurringTransfer') {
        return node;
      }

      const asset =
        assets &&
        assets[
          node.transfer.kind.dispatchStrategy?.dispatchMetricAssetId || ''
        ];

      const marketsInScope =
        node.transfer.kind.dispatchStrategy?.marketIdsInScope?.map(
          (id) => markets && markets[id]
        );

      return { ...node, asset, markets: marketsInScope };
    });

  return {
    data: games,
    loading: loading || assetsLoading || marketsLoading,
    error,
  };
};
