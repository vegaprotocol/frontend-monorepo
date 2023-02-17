import { BigNumber } from '../../../lib/bignumber';
import { RowAccountTypes } from '../shared-rewards-table-assets/shared-rewards-table-assets';
import type { RewardFieldsFragment } from '../home/__generated__/Rewards';
import type { AccountType } from '@vegaprotocol/types';

export interface EpochIndividualReward {
  epoch: string;
  rewards: {
    asset: string;
    totalAmount: string;
    rewardTypes: {
      [key in AccountType]?: {
        amount: string;
        percentageOfTotal: string;
      };
    };
  }[];
}

const emptyRowAccountTypes = Object.keys(RowAccountTypes).map((type) => [
  type,
  {
    amount: '0',
    percentageOfTotal: '0',
  },
]);

export const generateEpochIndividualRewardsList = (
  rewards: RewardFieldsFragment[]
) => {
  // We take the rewards and aggregate them by epoch and asset.
  const epochsMap = rewards.reduce((map, reward) => {
    const epochId = reward.epoch.id;
    const assetName = reward.asset.symbol;
    const rewardType = reward.rewardType;
    const amount = reward.amount;
    const percentageOfTotal = reward.percentageOfTotal;

    // if the rewardType is not of a type we display in the table, we skip it.
    // @todo check if this is the correct behaviour
    if (!Object.keys(RowAccountTypes).includes(rewardType)) {
      return map;
    }

    if (!map.has(epochId)) {
      map.set(epochId, { epoch: epochId, rewards: [] });
    }

    const epoch = map.get(epochId);

    let asset = epoch?.rewards.find((r) => r.asset === assetName);

    if (!asset) {
      asset = { asset: assetName, totalAmount: '0', rewardTypes: {} };
      epoch?.rewards.push(asset);
    }

    asset.rewardTypes[rewardType] = { amount, percentageOfTotal };

    // totalAmount is the sum of all rewardTypes amounts
    asset.totalAmount = Object.values(asset.rewardTypes).reduce(
      (sum, rewardType) => {
        return new BigNumber(sum).plus(rewardType.amount).toString();
      },
      '0'
    );

    return map;
  }, new Map<string, EpochIndividualReward>());

  // Lastly, we'll add the empty values in the rewardTypes object along with the actual values
  const epochIndividualRewards = Array.from(epochsMap.values()).map(
    (epoch) => ({
      ...epoch,
      rewards: epoch.rewards.map((reward) => ({
        ...reward,
        rewardTypes: {
          ...Object.fromEntries(emptyRowAccountTypes),
          ...reward.rewardTypes,
        },
      })),
    })
  );

  return epochIndividualRewards.sort(
    (a, b) => Number(b.epoch) - Number(a.epoch)
  );
};
