import type {
  EpochAssetsRewardsQuery,
  EpochRewardSummaryFieldsFragment,
} from '../home/__generated__/Rewards';
import { removePaginationWrapper } from '@vegaprotocol/react-helpers';

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

export interface AggregatedEpochSummary {
  epoch: EpochRewardSummaryFieldsFragment['epoch'];
  assetRewards: AggregatedEpochRewardSummary[];
}

export const generateEpochTotalRewardsList = (
  epochData: EpochAssetsRewardsQuery
) => {
  const epochRewardSummaries = removePaginationWrapper(
    epochData.epochRewardSummaries?.edges
  );

  const assets = removePaginationWrapper(epochData.assetsConnection?.edges);

  // Because the epochRewardSummaries don't have the asset name, we need to find it in the assets list
  const epochSummariesWithNamedReward: EpochSummaryWithNamedReward[] =
    epochRewardSummaries.map((epochReward) => ({
      ...epochReward,
      name:
        assets.find((asset) => asset.id === epochReward.assetId)?.name || '',
    }));

  // Aggregating the epoch summaries by epoch number
  const aggregatedEpochSummariesByEpochNumber =
    epochSummariesWithNamedReward.reduce((acc, epochSummary) => {
      const epoch = epochSummary.epoch;
      const epochSummaryIndex = acc.findIndex(
        (epochSummary) => epochSummary[0].epoch === epoch
      );

      if (epochSummaryIndex === -1) {
        acc.push([epochSummary]);
      } else {
        acc[epochSummaryIndex].push(epochSummary);
      }

      return acc;
    }, [] as EpochSummaryWithNamedReward[][]);

  // Now aggregate the array of arrays of epoch summaries by asset rewards.
  const aggregatedEpochSummaries: AggregatedEpochSummary[] =
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
              {
                rewardType: epochSummary.rewardType,
                amount: epochSummary.amount,
              },
            ],
            totalAmount: epochSummary.amount,
          });
        } else {
          acc[assetRewardIndex].rewards.push({
            rewardType: epochSummary.rewardType,
            amount: epochSummary.amount,
          });
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

  return aggregatedEpochSummaries;
};
