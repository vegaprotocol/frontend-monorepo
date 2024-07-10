import { generateEpochIndividualRewardsList } from './generate-epoch-individual-rewards-list';
import { AccountType } from '@vegaprotocol/types';
import type { RewardFieldsFragment } from '../home/__generated__/Rewards';

describe('generateEpochIndividualRewardsList', () => {
  const reward1: RewardFieldsFragment = {
    rewardType: AccountType.ACCOUNT_TYPE_GLOBAL_REWARD,
    amount: '100',
    percentageOfTotal: '0.1',
    receivedAt: new Date(),
    asset: { id: 'usd', symbol: 'USD', name: 'USD', decimals: 6 },
    party: { id: 'blah' },
    epoch: { id: '1' },
  };

  const reward2: RewardFieldsFragment = {
    rewardType: AccountType.ACCOUNT_TYPE_GLOBAL_REWARD,
    amount: '50',
    percentageOfTotal: '0.05',
    receivedAt: new Date(),
    asset: { id: 'eur', symbol: 'EUR', name: 'EUR', decimals: 5 },
    party: { id: 'blah' },
    epoch: { id: '2' },
  };

  const rewardWrongType: RewardFieldsFragment = {
    rewardType: AccountType.ACCOUNT_TYPE_INSURANCE,
    amount: '50',
    percentageOfTotal: '0.05',
    receivedAt: new Date(),
    asset: { id: 'eur', symbol: 'EUR', name: 'EUR', decimals: 5 },
    party: { id: 'blah' },
    epoch: { id: '2' },
  };

  it('should return an empty array if no rewards are provided', () => {
    expect(
      generateEpochIndividualRewardsList({
        rewards: [],
        epochId: 1,
        epochRewardSummaries: [],
      })
    ).toEqual([
      {
        epoch: 1,
        rewards: [],
      },
    ]);
  });

  it('should filter out any rewards of the wrong type', () => {
    const result = generateEpochIndividualRewardsList({
      rewards: [rewardWrongType],
      epochId: 1,
      epochRewardSummaries: [],
    });

    expect(result).toEqual([
      {
        epoch: 1,
        rewards: [],
      },
    ]);
  });

  it('should return reward in the correct format', () => {
    const result = generateEpochIndividualRewardsList({
      rewards: [reward1],
      epochId: 1,
      epochRewardSummaries: [
        {
          __typename: 'EpochRewardSummary',
          epoch: 1,
          assetId: 'usd',
          amount: '100000',
          rewardType: AccountType.ACCOUNT_TYPE_GLOBAL_REWARD,
        },
      ],
    });

    expect(result[0]).toEqual({
      epoch: 1,
      rewards: [
        {
          asset: 'USD',
          assetId: 'usd',
          decimals: 6,
          totalAmount: '100',
          rewardTypes: {
            [AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE]: {
              amount: '0',
              percentageOfTotal: '0',
            },
            [AccountType.ACCOUNT_TYPE_GLOBAL_REWARD]: {
              amount: '100',
              percentageOfTotal: '0.1',
            },
          },
        },
      ],
    });
  });

  it('should return an array sorted by epoch descending', () => {
    const rewards = [reward1, reward2];
    const result1 = generateEpochIndividualRewardsList({
      rewards,
      epochId: 2,
      epochRewardSummaries: [],
    });

    expect(result1[0].epoch).toEqual(2);
    expect(result1[1].epoch).toEqual(1);

    const reorderedRewards = [reward2, reward1];
    const result2 = generateEpochIndividualRewardsList({
      rewards: reorderedRewards,
      epochId: 2,
      epochRewardSummaries: [],
    });

    expect(result2[0].epoch).toEqual(2);
    expect(result2[1].epoch).toEqual(1);
  });

  it('returns data in the expected shape', () => {
    // Just sanity checking the whole structure here
    const rewards = [reward1, reward2];
    const result = generateEpochIndividualRewardsList({
      rewards,
      epochId: 2,
      epochRewardSummaries: [],
    });

    expect(result).toEqual([
      {
        epoch: 2,
        rewards: [
          {
            asset: 'EUR',
            assetId: 'eur',
            totalAmount: '50',
            decimals: 5,
            rewardTypes: {
              [AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_GLOBAL_REWARD]: {
                amount: '50',
                percentageOfTotal: '0.05',
              },
            },
          },
        ],
      },
      {
        epoch: 1,
        rewards: [
          {
            asset: 'USD',
            assetId: 'usd',
            totalAmount: '100',
            decimals: 6,
            rewardTypes: {
              [AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_GLOBAL_REWARD]: {
                amount: '100',
                percentageOfTotal: '0.1',
              },
            },
          },
        ],
      },
    ]);
  });

  it('returns data correctly for the requested epoch range', () => {
    const rewards = [reward1, reward2];
    const resultPageOne = generateEpochIndividualRewardsList({
      rewards,
      epochId: 3,
      epochRewardSummaries: [],
      page: 1,
      size: 2,
    });

    expect(resultPageOne).toEqual([
      {
        epoch: 3,
        rewards: [],
      },
      {
        epoch: 2,
        rewards: [
          {
            asset: 'EUR',
            assetId: 'eur',
            totalAmount: '50',
            decimals: 5,
            rewardTypes: {
              [AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_GLOBAL_REWARD]: {
                amount: '50',
                percentageOfTotal: '0.05',
              },
            },
          },
        ],
      },
    ]);

    const resultPageTwo = generateEpochIndividualRewardsList({
      rewards,
      epochId: 3,
      epochRewardSummaries: [],
      page: 2,
      size: 2,
    });

    expect(resultPageTwo).toEqual([
      {
        epoch: 1,
        rewards: [
          {
            asset: 'USD',
            assetId: 'usd',
            totalAmount: '100',
            decimals: 6,
            rewardTypes: {
              [AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_GLOBAL_REWARD]: {
                amount: '100',
                percentageOfTotal: '0.1',
              },
            },
          },
        ],
      },
    ]);
  });
});
