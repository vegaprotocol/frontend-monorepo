import groupBy from 'lodash/groupBy';
import {
  type AssetFieldsFragment,
  useAssetsMapProvider,
} from '@vegaprotocol/assets';
import { useActiveRewardsQuery } from './__generated__/Rewards';
import {
  type MarketMaybeWithData,
  type MarketFieldsFragment,
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
  DispatchMetric,
  type StakingDispatchStrategy,
  DistributionStrategy,
  IndividualScope,
  DispatchMetricLabels,
  EntityScopeLabelMapping,
} from '@vegaprotocol/types';
import { type ApolloError } from '@apollo/client';
import compact from 'lodash/compact';
import { useEpochInfoQuery } from './__generated__/Epoch';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import first from 'lodash/first';
import set from 'lodash/set';
import omit from 'lodash/omit';
import { useState } from 'react';

type Strategy = DispatchStrategy | StakingDispatchStrategy;

export type RewardTransfer<T> = TransferNode & {
  transfer: {
    kind: Omit<RecurringTransfer, 'dispatchStrategy'> & {
      dispatchStrategy: T;
    };
  };
};

// This is the `de facto` dispatch strategy for staking rewards:
const STAKING_DISPATCH_STRATEGY: StakingDispatchStrategy = {
  dispatchMetric: 'STAKING_REWARD_METRIC',
  dispatchMetricAssetId: '', // <-- replace empty string here with correct value of the reward asset
  distributionStrategy: DistributionStrategy.DISTRIBUTION_STRATEGY_PRO_RATA,
  entityScope: EntityScope.ENTITY_SCOPE_INDIVIDUALS,
  individualScope: IndividualScope.INDIVIDUAL_SCOPE_ALL,
  lockPeriod: 0,
  notionalTimeWeightedAveragePositionRequirement: '',
  stakingRequirement: '1000000000000000000', // 1 VEGA
  windowLength: 1,
  transferInterval: 1,
};

/**
 * Maps raw transfer node to the reward transfer type. If a given node is
 * staking reward then it derives the dispatch strategy.
 * @returns `RewardTransfer<DispatchStrategy>` or
 * `RewardTransfer<StakingDispatchStrategy>`, otherwise `undefined`.
 */
const mapTransferNodeToRewardTransfer = (
  node: TransferNode
): RewardTransfer<Strategy> | undefined => {
  if (isReward(node)) {
    return node as RewardTransfer<DispatchStrategy>;
  }
  if (isStakingReward(node)) {
    let n = { ...node } as RewardTransfer<StakingDispatchStrategy>;
    const stakingDispatchStrategy: StakingDispatchStrategy = {
      ...STAKING_DISPATCH_STRATEGY,
      dispatchMetricAssetId: node.transfer.asset?.id || '',
    };
    n = set(
      omit(n, 'transfer.kind.dispatchStrategy'),
      'transfer.kind.dispatchStrategy',
      stakingDispatchStrategy
    );
    return n;
  }
  return undefined;
};

export type EnrichedRewardTransfer<T> = RewardTransfer<T> & {
  /** Dispatch metric asset (reward asset) */
  dispatchAsset?: AssetFieldsFragment;
  /**
   * A flag determining whether a reward asset is being traded on any
   * of the active markets.
   *
   * It evaluates to `true` even if asset is not actively traded when a reward
   * is for staking VEGA or validator ranking.
   */
  isAssetTraded?: boolean;
  /** A list of markets in scope */
  markets?: MarketMaybeWithData[];
};

/**
 * Checks if given transfer is a reward.
 *
 * A reward has to be a recurring transfer and has to have a
 * dispatch strategy unless it's a staking reward then see `isStakingReward`.
 */
export const isReward = (
  node: TransferNode
): node is RewardTransfer<DispatchMetric> =>
  (node.transfer.kind.__typename === 'RecurringTransfer' ||
    node.transfer.kind.__typename === 'RecurringGovernanceTransfer') &&
  node.transfer.kind.dispatchStrategy != null;

/**
 * Checks if given reward (transfer) is for staking VEGA.
 */
export const isStakingReward = (
  node: TransferNode
): node is RewardTransfer<StakingDispatchStrategy> =>
  (node.transfer.kind.__typename === 'RecurringGovernanceTransfer' ||
    node.transfer.kind.__typename === 'RecurringTransfer') &&
  !node.transfer.kind.dispatchStrategy &&
  node.transfer.toAccountType === AccountType.ACCOUNT_TYPE_GLOBAL_REWARD;

/**
 * Checks if given reward (transfer) is has not ended. If it is active or due to start in the future.
 */
export const isActiveReward = (
  node: RewardTransfer<Strategy>,
  currentEpoch: number
) => {
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
export const isScopedToTeams = (node: RewardTransfer<Strategy>) =>
  // scoped to teams
  node.transfer.kind.dispatchStrategy?.entityScope ===
  EntityScope.ENTITY_SCOPE_TEAMS;

/**
 * Creates a function that enriches the given reward transfer with additional
 * data based on the given markets and assets.
 */
const createTransferEnrichment =
  (
    markets: MarketMaybeWithData[] | null,
    assets: Record<string, AssetFieldsFragment> | null
  ) =>
  (node: RewardTransfer<Strategy>): EnrichedRewardTransfer<Strategy> => {
    const isAssetTraded = [
      // do not grey out a card when a reward is for validator ranking
      // or staking (VEGA doesn't need to be traded)
      DispatchMetric.DISPATCH_METRIC_VALIDATOR_RANKING,
      'STAKING_REWARD_METRIC',
    ].includes(node.transfer.kind.dispatchStrategy.dispatchMetric)
      ? true
      : markets &&
        Object.values(markets).some((m) => {
          try {
            const mAsset = getAsset(m);
            return (
              mAsset.id ===
                node.transfer.kind.dispatchStrategy?.dispatchMetricAssetId &&
              m.data?.marketState === MarketState.STATE_ACTIVE
            );
          } catch {
            // NOOP
          }
          return false;
        });

    const dispatchAsset =
      (assets &&
        assets[node.transfer.kind.dispatchStrategy.dispatchMetricAssetId]) ||
      undefined;

    const marketsInScope = compact(
      node.transfer.kind.dispatchStrategy.marketIdsInScope?.map(
        (id) => markets && markets.find((m) => m.id === id)
      )
    );

    return {
      ...node,
      dispatchAsset,
      isAssetTraded: isAssetTraded != null ? isAssetTraded : undefined,
      markets: marketsInScope?.length > 0 ? marketsInScope : undefined,
    };
  };

type RewardsArgs = {
  onlyActive: boolean;
  scopeToTeams?: boolean;
};

/** Retrieves rewards (transfers) */
export const useRewards = ({
  // get active by default
  onlyActive = true,
  scopeToTeams = false,
}: RewardsArgs): {
  data: EnrichedRewardTransfer<Strategy>[];
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
      pagination: {
        first: 1000,
      },
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

  const enrich = createTransferEnrichment(markets, assets);
  const transfers = removePaginationWrapper(data?.transfersConnection?.edges);
  const rewardTransfers = compact(
    transfers
      .map((n) => n as TransferNode)
      // make sure we have only rewards and staking rewards here
      .filter((n) => isReward(n) || isStakingReward(n))
      // derive dispatch strategy for staking rewards
      .map((n) => mapTransferNodeToRewardTransfer(n))
  );

  const enriched = rewardTransfers
    // take only active rewards if required, otherwise take all
    .filter((node) => (onlyActive ? isActiveReward(node, currentEpoch) : true))
    // take only those rewards that are scoped to teams if required, otherwise take all
    .filter((node) => (scopeToTeams ? isScopedToTeams(node) : true))
    // enrich with dispatch asset and markets in scope details
    .map(enrich);

  return {
    data: enriched,
    loading: loading || assetsLoading || marketsLoading || epochLoading,
    error: error || assetsError || marketsError || epochError,
  };
};

export const useReward = (gameId?: string) => {
  const { data, loading, error } = useActiveRewardsQuery({
    variables: {
      gameId,
    },
    skip: !gameId,
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

  const enrich = createTransferEnrichment(markets, assets);
  const transfers = removePaginationWrapper(data?.transfersConnection?.edges);
  const rewardTransfers = compact(
    transfers
      .map((n) => n as TransferNode)
      // make sure we have only rewards and staking rewards here
      .filter((n) => isReward(n) || isStakingReward(n))
      // derive dispatch strategy for staking rewards
      .map((n) => mapTransferNodeToRewardTransfer(n))
  );
  const enriched = rewardTransfers
    // enrich with dispatch asset and markets in scope details
    .map(enrich);

  return {
    data: first(enriched),
    loading: loading || assetsLoading || marketsLoading,
    error: error || assetsError || marketsError,
  };
};

export const useRewardsGrouped = (args: RewardsArgs) => {
  const [filter, setFilter] = useState<Filter>({
    searchTerm: '',
  });
  const queryResult = useRewards(args);

  // filter out the rewards that are scoped to teams on this page
  // we display those on the `Competitions` page
  const data = queryResult.data.filter((r) => !isScopedToTeams(r));

  const cards = data
    .filter((n) => applyFilter(n, filter))
    // filter out the cards (rewards) for which all of the markets
    // are settled
    .filter((n) => !areAllMarketsSettled(n));

  const groupedCards = groupBy(cards, (r) => {
    if (!r.transfer.asset) return null;

    return determineCardGroup({
      assetId: r.transfer.asset.id,
      metric: r.transfer.kind.dispatchStrategy.dispatchMetric,
      entityScope: r.transfer.kind.dispatchStrategy.entityScope,
      distributionStrategy:
        r.transfer.kind.dispatchStrategy.distributionStrategy,
      stakingRequirement:
        r.transfer.kind.dispatchStrategy.stakingRequirement || '0',
    });
  });

  return {
    ...queryResult,
    data: groupedCards,
    filter,
    setFilter,
  };
};

export const determineCardGroup = (data: {
  assetId: string;
  metric: string;
  entityScope: string;
  distributionStrategy: string;
  stakingRequirement: string;
}) =>
  [
    // groups by:
    // reward asset (usually VEGA)
    data.assetId,

    // reward for (dispatch metric)
    data.metric,

    // reward scope (teams vs individuals)
    data.entityScope,

    // reward distribution strategy
    data.distributionStrategy,

    // staking requirement
    data.stakingRequirement,
  ].join('-');

export type Filter = {
  searchTerm: string;
};

export const applyFilter = (
  node: TransferNode & {
    asset?: AssetFieldsFragment | null;
    markets?: (MarketFieldsFragment | null)[];
  },
  filter: Filter
) => {
  const { transfer } = node;

  // if the transfer is a staking reward then it should be displayed
  if (transfer.toAccountType === AccountType.ACCOUNT_TYPE_GLOBAL_REWARD) {
    return true;
  }

  if (
    transfer.kind.__typename !== 'RecurringTransfer' &&
    transfer.kind.__typename !== 'RecurringGovernanceTransfer'
  ) {
    return false;
  }

  if (
    (transfer.kind.dispatchStrategy?.dispatchMetric &&
      DispatchMetricLabels[transfer.kind.dispatchStrategy.dispatchMetric]
        .toLowerCase()
        .includes(filter.searchTerm.toLowerCase())) ||
    transfer.asset?.symbol
      .toLowerCase()
      .includes(filter.searchTerm.toLowerCase()) ||
    (
      (transfer.kind.dispatchStrategy &&
        EntityScopeLabelMapping[transfer.kind.dispatchStrategy.entityScope]) ||
      'Unspecified'
    )
      .toLowerCase()
      .includes(filter.searchTerm.toLowerCase()) ||
    node.asset?.name
      .toLocaleLowerCase()
      .includes(filter.searchTerm.toLowerCase()) ||
    node.markets?.some((m) =>
      m?.tradableInstrument?.instrument?.name
        .toLocaleLowerCase()
        .includes(filter.searchTerm.toLowerCase())
    )
  ) {
    return true;
  }

  return false;
};

export const areAllMarketsSettled = (
  transferNode: Pick<
    EnrichedRewardTransfer<DispatchStrategy | StakingDispatchStrategy>,
    'markets'
  >
) => {
  const settledMarkets = transferNode.markets?.filter(
    (m) =>
      m?.data?.marketState &&
      [
        MarketState.STATE_TRADING_TERMINATED,
        MarketState.STATE_SETTLED,
        MarketState.STATE_CANCELLED,
        MarketState.STATE_CLOSED,
      ].includes(m?.data?.marketState)
  );

  return (
    settledMarkets?.length === transferNode.markets?.length &&
    Boolean(transferNode.markets && transferNode.markets.length > 0)
  );
};
