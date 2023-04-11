import type {
  EpochAssetsRewardsQuery,
  EpochRewardSummaryFieldsFragment,
} from '../home/__generated__/Rewards';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import { RowAccountTypes } from '../shared-rewards-table-assets/shared-rewards-table-assets';
import type { AccountType } from '@vegaprotocol/types';
import { BigNumber } from '../../../lib/bignumber';

interface EpochSummaryWithNamedReward extends EpochRewardSummaryFieldsFragment {
  name: string;
}

type RewardType = EpochRewardSummaryFieldsFragment['rewardType'];
type RewardItem = Pick<
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

export const generateEpochTotalRewardsList = (
  epochData: EpochAssetsRewardsQuery | undefined,
  epochId: number,
  page: number,
  size: number
) => {
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
    epochData?.epochRewardSummaries?.edges
  );

  const assets = removePaginationWrapper(epochData?.assetsConnection?.edges);

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

  // return Array.from(epochTotalRewards.values())
  //   .sort((a, b) => Number(b.epoch) - Number(a.epoch))
  //   .map((epochData) => {
  //     const assetRewards = Array.from(epochData.assetRewards.values()).sort(
  //       (a, b) => {
  //         return new BigNumber(b.totalAmount).comparedTo(a.totalAmount);
  //       }
  //     );

  //     return {
  //       epoch: epochData.epoch,
  //       assetRewards: assetRewards.map(a => {
  //         return {
  //           ...a,
  //           rewards: Array.from(a.rewards.values()),
  //         }
  //       }),
  //     };
  //   });
};
