import type {
  EpochAssetsRewardsQuery,
  EpochRewardSummaryFieldsFragment,
} from '../home/__generated__/Rewards';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import { RowAccountTypes } from '../shared-rewards-table-assets/shared-rewards-table-assets';
import type { AccountType } from '@vegaprotocol/types';
import { calculateEpochOffset } from '../../../lib/epoch-pagination';

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
  decimals: number;
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
  data?: EpochAssetsRewardsQuery | undefined;
  epochId: number;
  page?: number;
  size?: number;
}) => {
  const epochRewardSummaries = removePaginationWrapper(
    data?.epochRewardSummaries?.edges
  );

  const assets = removePaginationWrapper(data?.assetsConnection?.edges);

  const map: Map<string, EpochTotalSummary> = new Map();
  const { fromEpoch, toEpoch } = calculateEpochOffset({ epochId, page, size });

  for (let i = toEpoch; i >= fromEpoch; i--) {
    map.set(i.toString(), {
      epoch: i,
      assetRewards: new Map(),
    });
  }

  return epochRewardSummaries.reduce((acc, reward) => {
    const epoch = acc.get(reward.epoch.toString());

    if (epoch) {
      const matchingAsset = assets.find((asset) => asset.id === reward.assetId);
      const assetWithRewards = epoch.assetRewards.get(reward.assetId);

      const rewards =
        assetWithRewards?.rewards || new Map(emptyRowAccountTypes);
      const rewardItem = rewards?.get(reward.rewardType);
      const amount = (
        (Number(rewardItem?.amount) || 0) + Number(reward.amount)
      ).toString();

      if (Object.keys(RowAccountTypes).includes(reward.rewardType)) {
        rewards?.set(reward.rewardType, {
          rewardType: reward.rewardType,
          amount,
        });
      }

      epoch.assetRewards.set(reward.assetId, {
        assetId: reward.assetId,
        name: matchingAsset?.name || '',
        rewards: rewards || new Map(emptyRowAccountTypes),
        decimals: matchingAsset?.decimals || 0,
        totalAmount: (
          Number(reward.amount) + Number(assetWithRewards?.totalAmount || 0)
        ).toString(),
      });
    }
    return acc;
  }, map);
};
