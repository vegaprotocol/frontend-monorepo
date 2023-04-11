import type {
  EpochAssetsRewardsQuery,
  EpochRewardSummaryFieldsFragment,
} from '../home/__generated__/Rewards';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import { RowAccountTypes } from '../shared-rewards-table-assets/shared-rewards-table-assets';
import type { AccountType } from '@vegaprotocol/types';

interface EpochSummaryWithNamedReward extends EpochRewardSummaryFieldsFragment {
  name: string;
}

export type RewardType = EpochRewardSummaryFieldsFragment['rewardType'];
export type RewardItem = Pick<
  EpochRewardSummaryFieldsFragment,
  'rewardType' | 'amount'
>;

export type AggregatedEpochRewardSummary = {
  assetId: EpochRewardSummaryFieldsFragment['assetId'];
  name: EpochSummaryWithNamedReward['name'];
  rewards: Map<RewardType, RewardItem>;
  totalAmount: string;
};

export type EpochTotalSummary = {
  epoch: EpochRewardSummaryFieldsFragment['epoch'];
  assetRewards: Map<
    EpochRewardSummaryFieldsFragment['assetId'],
    AggregatedEpochRewardSummary
  >;
};

const emptyRowAccountTypes: Map<RewardType, RewardItem> = new Map();

Object.keys(RowAccountTypes).forEach((type) => {
  emptyRowAccountTypes.set(type as AccountType, {
    rewardType: type as AccountType,
    amount: '0',
  });
});

export const generateEpochTotalRewardsList = ({
  data,
  epochId,
  page = 1,
  size = 10,
}: {
  data?: EpochAssetsRewardsQuery | undefined,
  epochId: number,
  page?: number,
  size?: number
}) => {
  const map: Map<string, EpochTotalSummary> = new Map();
  const fromEpoch = Math.max(0, epochId - size * page);
  const toEpoch = epochId - size * page + size;
  for (let i = fromEpoch; i <= toEpoch; i++) {
    map.set(i.toString(), {
      epoch: i,
      assetRewards: new Map(),
    });
  }

  const epochRewardSummaries = removePaginationWrapper(
    data?.epochRewardSummaries?.edges
  );

  const assets = removePaginationWrapper(data?.assetsConnection?.edges);

  return epochRewardSummaries.reduce((acc, reward) => {
    const epoch = acc.get(reward.epoch.toString());

    if (epoch) {
      const matchingAsset = assets.find((asset) => asset.id === reward.assetId);
      const assetRewards = epoch.assetRewards.get(reward.assetId);

      if (matchingAsset) {
        const rewards = assetRewards?.rewards || emptyRowAccountTypes;
        const r = rewards.get(reward.rewardType);
        rewards.set(reward.rewardType, {
          rewardType: reward.rewardType,
          amount: ((Number(r?.amount) || 0) + Number(reward.amount)).toString(),
        });

        epoch.assetRewards.set(reward.assetId, {
          assetId: matchingAsset.id,
          name: matchingAsset.name,
          rewards,
          totalAmount: (
            Number(reward.amount) + Number(assetRewards?.totalAmount || 0)
          ).toString(),
        });
      }
    }

    return acc;
  }, map);
};
