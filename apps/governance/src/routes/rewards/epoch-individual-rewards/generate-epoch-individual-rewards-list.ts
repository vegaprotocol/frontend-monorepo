import { BigNumber } from '../../../lib/bignumber';
import { RowAccountTypes } from '../shared-rewards-table-assets/shared-rewards-table-assets';
import type {
  EpochRewardSummaryFieldsFragment,
  RewardFieldsFragment,
} from '../home/__generated__/Rewards';
import type { AccountType } from '@vegaprotocol/types';
import { calculateEpochOffset } from '../../../lib/epoch-pagination';

export interface EpochIndividualReward {
  epoch: number;
  rewards: {
    asset: string;
    assetId?: string;
    totalAmount: string;
    decimals: number;
    rewardTypes: {
      [key in AccountType]?: {
        amount: string;
        percentageOfTotal: string;
      };
    };
  }[];
}

const accountTypes = Object.keys(RowAccountTypes);

const emptyRowAccountTypes = accountTypes.map((type) => [
  type,
  {
    amount: '0',
    percentageOfTotal: '0',
  },
]);

export const generateEpochIndividualRewardsList = ({
  rewards,
  epochId,
  epochRewardSummaries,
  page = 1,
  size = 10,
}: {
  rewards: RewardFieldsFragment[];
  epochId: number;
  epochRewardSummaries: EpochRewardSummaryFieldsFragment[];
  page?: number;
  size?: number;
}) => {
  const map: Map<string, EpochIndividualReward> = new Map();
  const { fromEpoch, toEpoch } = calculateEpochOffset({ epochId, page, size });

  for (let i = toEpoch; i >= fromEpoch; i--) {
    map.set(i.toString(), {
      epoch: i,
      rewards: [],
    });
  }

  // We take the rewards and aggregate them by epoch and asset.
  const epochIndividualRewards = rewards.reduce((acc, reward) => {
    const epochId = reward.epoch.id;
    const assetName = reward.asset.name;
    const assetDecimals = reward.asset.decimals;
    const rewardType = reward.rewardType;
    const amount = reward.amount;
    const percentageOfTotal = reward.percentageOfTotal;

    // if the rewardType is not of a type we display in the table, we skip it.
    if (!accountTypes.includes(rewardType)) {
      return acc;
    }

    if (!acc.has(epochId)) {
      return acc;
    }

    const epoch = acc.get(epochId);

    // matchingTotalReward is the total awarded for all users for the reward type in the epoch of the asset
    let asset = epoch?.rewards.find((r) => r.asset === assetName);

    if (!asset) {
      asset = {
        asset: assetName,
        assetId: reward.asset.id,
        decimals: assetDecimals,
        totalAmount: '0',
        rewardTypes: Object.fromEntries(emptyRowAccountTypes),
      };
      epoch?.rewards.push(asset);
    }

    if (!asset.rewardTypes[rewardType]) {
      asset.rewardTypes[rewardType] = { amount, percentageOfTotal };
    } else {
      const previousAmount = asset.rewardTypes[rewardType]?.amount;
      const newAmount = previousAmount
        ? new BigNumber(previousAmount).plus(amount).toString()
        : amount;

      asset.rewardTypes[rewardType] = {
        amount: newAmount,
        percentageOfTotal: percentageOfTotal,
      };
    }

    // totalAmount is the sum of all individual rewardTypes amounts
    asset.totalAmount = Object.values(asset.rewardTypes).reduce(
      (sum, rewardType) => {
        return new BigNumber(sum).plus(rewardType.amount).toString();
      },
      '0'
    );

    if (epoch) {
      epoch.rewards = epoch.rewards.sort((a, b) => {
        return new BigNumber(b.totalAmount).comparedTo(a.totalAmount);
      });
    }

    return acc;
  }, map);

  return Array.from(epochIndividualRewards.values()).sort(
    (a, b) => Number(b.epoch) - Number(a.epoch)
  );
};
