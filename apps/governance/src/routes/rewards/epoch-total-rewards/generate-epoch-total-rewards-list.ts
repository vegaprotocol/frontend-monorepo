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

export interface AggregatedEpochRewardSummary {
  assetId: EpochRewardSummaryFieldsFragment['assetId'];
  name: EpochSummaryWithNamedReward['name'];
  rewards: {
    rewardType: EpochRewardSummaryFieldsFragment['rewardType'];
    amount: EpochRewardSummaryFieldsFragment['amount'];
  }[];
  totalAmount: string;
}

interface EpochTotalCollection {
  epoch: number
  assetRewards: Map<string, AggregatedEpochRewardSummary>
}

export interface EpochTotalSummary {
  epoch: EpochRewardSummaryFieldsFragment['epoch'];
  assetRewards: AggregatedEpochRewardSummary[];
}

const emptyRowAccountTypes = Object.keys(RowAccountTypes).map((type) => ({
  rewardType: type as AccountType,
  amount: '0',
}));

export const generateEpochTotalRewardsList = (
  epochData: EpochAssetsRewardsQuery | undefined,
  epochId: number,
  page: number,
  size: number,
) => {
  const map: Map<string, EpochTotalCollection> = new Map()
  const fromEpoch = Math.max(0, epochId - size * page)
  const toEpoch = epochId - size * page + size
  for (let i = fromEpoch; i <= toEpoch; i++) {
    map.set(i.toString(), {
      epoch: i,
      assetRewards: new Map(),
    })
  }

  const epochRewardSummaries = removePaginationWrapper(
    epochData?.epochRewardSummaries?.edges
  );

  const assets = removePaginationWrapper(epochData?.assetsConnection?.edges);

  const epochTotalRewards = epochRewardSummaries.reduce((acc, reward) => {
    const epoch = acc.get(reward.epoch.toString())

    if (epoch) {
      const matchingAsset = assets.find(asset => asset.id === reward.assetId)
      const assetRewards = epoch.assetRewards.get(reward.assetId)
      
      if (matchingAsset) {
        const rewards = assetRewards?.rewards || []
        rewards.push({
          rewardType: reward.rewardType,
          amount: reward.amount,
        })
        epoch.assetRewards.set(reward.assetId, {
          assetId: matchingAsset.id,
          name: matchingAsset.name,
          rewards,
          totalAmount: (Number(reward.amount) + Number(assetRewards?.totalAmount || 0)).toString(),
        })
      }
    }

    return acc
  }, map)

  return Array.from(epochTotalRewards.values())
    .sort((a, b) => (
      Number(b.epoch) - Number(a.epoch)
    ))
    .map(epochData => {
      const assetRewards = Array.from(epochData.assetRewards.values()).sort((a, b) => {
        return new BigNumber(b.totalAmount).comparedTo(a.totalAmount);
      });

      return {
        epoch: epochData.epoch,
        assetRewards,
      }
    });
};
