import type {
  EpochAssetsRewardsQuery,
  EpochRewardSummaryFieldsFragment,
} from '../home/__generated__/Rewards';
import { removePaginationWrapper } from '@vegaprotocol/react-helpers';
import { RowAccountTypes } from '../shared-rewards-table-assets/shared-rewards-table-assets';
import type { AccountType } from '@vegaprotocol/types';

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

export interface EpochTotalSummary {
  epoch: EpochRewardSummaryFieldsFragment['epoch'];
  assetRewards: AggregatedEpochRewardSummary[];
}

const emptyRowAccountTypes = Object.keys(RowAccountTypes).map((type) => ({
  rewardType: type as AccountType,
  amount: '0',
}));

export const generateEpochTotalRewardsList = (
  epochData: EpochAssetsRewardsQuery | undefined
) => {
  const epochRewardSummaries = removePaginationWrapper(
    epochData?.epochRewardSummaries?.edges
  );

  const assets = removePaginationWrapper(epochData?.assetsConnection?.edges);

  // Because the epochRewardSummaries don't have the asset name, we need to find it in the assets list
  const epochSummariesWithNamedReward: EpochSummaryWithNamedReward[] =
    epochRewardSummaries.map((epochReward) => ({
      ...epochReward,
      name:
        assets.find((asset) => asset.id === epochReward.assetId)?.name || '',
    }));

  // Aggregating the epoch summaries by epoch number
  const aggregatedEpochSummariesByEpochNumber =
    epochSummariesWithNamedReward.reduce((acc, epochReward) => {
      const epoch = epochReward.epoch;
      const epochSummaryIndex = acc.findIndex(
        (epochSummary) => epochSummary[0].epoch === epoch
      );

      if (epochSummaryIndex === -1) {
        acc.push([epochReward]);
      } else {
        acc[epochSummaryIndex].push(epochReward);
      }

      return acc;
    }, [] as EpochSummaryWithNamedReward[][]);

  // Now aggregate the array of arrays of epoch summaries by asset rewards.
  const epochTotalRewards: EpochTotalSummary[] =
    aggregatedEpochSummariesByEpochNumber.map((epochSummaries) => {
      const assetRewards = epochSummaries.reduce((acc, epochSummary) => {
        const assetRewardIndex = acc.findIndex(
          (assetReward) =>
            assetReward.assetId === epochSummary.assetId &&
            assetReward.name === epochSummary.name
        );

        if (assetRewardIndex === -1) {
          acc.push({
            assetId: epochSummary.assetId,
            name: epochSummary.name,
            rewards: [
              ...emptyRowAccountTypes.map((emptyRowAccountType) => {
                if (
                  emptyRowAccountType.rewardType === epochSummary.rewardType
                ) {
                  return {
                    rewardType: epochSummary.rewardType,
                    amount: epochSummary.amount,
                  };
                } else {
                  return emptyRowAccountType;
                }
              }),
            ],
            totalAmount: epochSummary.amount,
          });
        } else {
          acc[assetRewardIndex].rewards = acc[assetRewardIndex].rewards.map(
            (reward) => {
              if (reward.rewardType === epochSummary.rewardType) {
                return {
                  rewardType: epochSummary.rewardType,
                  amount: (
                    Number(reward.amount) + Number(epochSummary.amount)
                  ).toString(),
                };
              } else {
                return reward;
              }
            }
          );
          acc[assetRewardIndex].totalAmount = (
            Number(acc[assetRewardIndex].totalAmount) +
            Number(epochSummary.amount)
          ).toString();
        }

        return acc;
      }, [] as AggregatedEpochRewardSummary[]);

      return {
        epoch: epochSummaries[0].epoch,
        assetRewards,
      };
    });

  return epochTotalRewards;
};
