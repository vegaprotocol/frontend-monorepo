import {
  type AssetFieldsFragment,
  useAssetsMapProvider,
} from '@vegaprotocol/assets';
import { useActiveRewardsQuery } from './__generated__/Rewards';
import {
  type MarketMaybeWithData,
  getAsset,
  marketsWithDataProvider,
} from '@vegaprotocol/markets';
import {
  type RecurringTransfer,
  type TransferNode,
  TransferStatus,
  type DispatchStrategy,
  EntityScope,
  MarketState,
  AccountType,
} from '@vegaprotocol/types';
import { type ApolloError } from '@apollo/client';
import compact from 'lodash/compact';
import { useEpochInfoQuery } from './__generated__/Epoch';
import { useDataProvider } from '@vegaprotocol/data-provider';

export type RewardTransfer = TransferNode & {
  transfer: {
    kind: RecurringTransfer & {
      dispatchStrategy: DispatchStrategy;
    };
  };
};

export type EnrichedRewardTransfer = RewardTransfer & {
  /** Dispatch metric asset (reward asset) */
  dispatchAsset?: AssetFieldsFragment;
  /** A flag determining whether a reward asset is being traded on any of the active markets */
  isAssetTraded?: boolean;
  /** A list of markets in scope */
  markets?: MarketMaybeWithData[];
};

/**
 * Checks if given transfer is a reward.
 *
 * A reward has to be a recurring transfer and has to have a
 * dispatch strategy.
 */
export const isReward = (node: TransferNode): node is RewardTransfer => {
  if (
    ((node.transfer.kind.__typename === 'RecurringTransfer' ||
      node.transfer.kind.__typename === 'RecurringGovernanceTransfer') &&
      node.transfer.kind.dispatchStrategy != null) ||
    node.transfer.toAccountType === AccountType.ACCOUNT_TYPE_GLOBAL_REWARD
  ) {
    return true;
  }
  return false;
};

/**
 * Checks if given reward (transfer) is has not ended. If it is active or due to start in the future.
 */
export const isActiveReward = (node: RewardTransfer, currentEpoch: number) => {
  const { transfer } = node;

  const pending = transfer.status === TransferStatus.STATUS_PENDING;
  const withinEpochs =
    transfer.kind.endEpoch != null
      ? transfer.kind.endEpoch >= currentEpoch
      : true;

  if (pending && withinEpochs) return true;
  return false;
};

/**
 * Checks if given reward (transfer) is scoped to teams.
 */
export const isScopedToTeams = (node: EnrichedRewardTransfer) =>
  // scoped to teams
  node.transfer.kind.dispatchStrategy?.entityScope ===
  EntityScope.ENTITY_SCOPE_TEAMS;

/** Retrieves rewards (transfers) */
export const useRewards = ({
  // get active by default
  onlyActive = true,
  scopeToTeams = false,
}: {
  onlyActive: boolean;
  scopeToTeams?: boolean;
}): {
  data: EnrichedRewardTransfer[];
  loading: boolean;
  error?: ApolloError | Error;
} => {
  const {
    data: epochData,
    loading: epochLoading,
    error: epochError,
  } = useEpochInfoQuery({
    fetchPolicy: 'network-only',
  });

  const currentEpoch = Number(epochData?.epoch.id);

  const { data, loading, error } = useActiveRewardsQuery({
    variables: {
      isReward: true,
    },
    skip: onlyActive && isNaN(currentEpoch),
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: assets,
    loading: assetsLoading,
    error: assetsError,
  } = useAssetsMapProvider();

  const {
    data: markets,
    loading: marketsLoading,
    error: marketsError,
  } = useDataProvider({
    dataProvider: marketsWithDataProvider,
    variables: undefined,
  });

  const enriched = compact(
    data?.transfersConnection?.edges?.map((n) => n?.node)
  )
    .map((n) => n as TransferNode)
    // make sure we have only rewards here
    .filter(isReward)
    // take only active rewards if required, otherwise take all
    .filter((node) => (onlyActive ? isActiveReward(node, currentEpoch) : true))
    // take only those rewards that are scoped to teams if required, otherwise take all
    .filter((node) => (scopeToTeams ? isScopedToTeams(node) : true))
    // enrich with dispatch asset and markets in scope details
    .map((node) => {
      if (!node.transfer.kind.dispatchStrategy) return node;
      const dispatchAsset =
        (assets &&
          assets[node.transfer.kind.dispatchStrategy.dispatchMetricAssetId]) ||
        undefined;
      const marketsInScope = compact(
        node.transfer.kind.dispatchStrategy.marketIdsInScope?.map(
          (id) => markets && markets.find((m) => m.id === id)
        )
      );
      const isAssetTraded =
        markets &&
        Object.values(markets).some((m) => {
          try {
            const mAsset = getAsset(m);
            return (
              mAsset.id ===
                node.transfer.kind.dispatchStrategy.dispatchMetricAssetId &&
              m.data?.marketState === MarketState.STATE_ACTIVE
            );
          } catch {
            // NOOP
          }
          return false;
        });
      return {
        ...node,
        dispatchAsset,
        isAssetTraded: isAssetTraded != null ? isAssetTraded : undefined,
        markets: marketsInScope?.length > 0 ? marketsInScope : undefined,
      };
    });

  return {
    data: enriched,
    loading: loading || assetsLoading || marketsLoading || epochLoading,
    error: error || assetsError || marketsError || epochError,
  };
};
