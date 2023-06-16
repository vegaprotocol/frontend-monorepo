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

  const reward3: RewardFieldsFragment = {
    rewardType: AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES,
    amount: '200',
    percentageOfTotal: '0.2',
    receivedAt: new Date(),
    asset: { id: 'gbp', symbol: 'GBP', name: 'GBP', decimals: 7 },
    party: { id: 'blah' },
    epoch: { id: '2' },
  };

  const reward4: RewardFieldsFragment = {
    rewardType: AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES,
    amount: '100',
    percentageOfTotal: '0.1',
    receivedAt: new Date(),
    asset: { id: 'usd', symbol: 'USD', name: 'USD', decimals: 6 },
    party: { id: 'blah' },
    epoch: { id: '1' },
  };

  const reward5: RewardFieldsFragment = {
    rewardType: AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES,
    amount: '150',
    percentageOfTotal: '0.15',
    receivedAt: new Date(),
    asset: { id: 'usd', symbol: 'USD', name: 'USD', decimals: 6 },
    party: { id: 'blah' },
    epoch: { id: '3' },
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
          decimals: 6,
          totalAmount: '100',
          rewardTypes: {
            [AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE]: {
              amount: '0',
              percentageOfTotal: '0',
            },
            [AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES]: {
              amount: '0',
              percentageOfTotal: '0',
            },
            [AccountType.ACCOUNT_TYPE_GLOBAL_REWARD]: {
              amount: '100',
              percentageOfTotal: '0.1',
            },
            [AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES]: {
              amount: '0',
              percentageOfTotal: '0',
            },
            [AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES]: {
              amount: '0',
              percentageOfTotal: '0',
            },
            [AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS]: {
              amount: '0',
              percentageOfTotal: '0',
            },
          },
        },
      ],
    });
  });

  it('should return an array sorted by epoch descending', () => {
    const rewards = [reward1, reward2, reward3, reward4];
    const result1 = generateEpochIndividualRewardsList({
      rewards,
      epochId: 2,
      epochRewardSummaries: [],
    });

    expect(result1[0].epoch).toEqual(2);
    expect(result1[1].epoch).toEqual(1);

    const reorderedRewards = [reward4, reward3, reward2, reward1];
    const result2 = generateEpochIndividualRewardsList({
      rewards: reorderedRewards,
      epochId: 2,
      epochRewardSummaries: [],
    });

    expect(result2[0].epoch).toEqual(2);
    expect(result2[1].epoch).toEqual(1);
  });

  it('correctly calculates the total value of rewards for an asset', () => {
    const rewards = [reward1, reward4];
    const result = generateEpochIndividualRewardsList({
      rewards,
      epochId: 1,
      epochRewardSummaries: [],
    });

    expect(result[0].rewards[0].totalAmount).toEqual('200');
  });

  it('returns data in the expected shape', () => {
    // Just sanity checking the whole structure here
    const rewards = [reward1, reward2, reward3, reward4];
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
            asset: 'GBP',
            totalAmount: '200',
            decimals: 7,
            rewardTypes: {
              [AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES]: {
                amount: '200',
                percentageOfTotal: '0.2',
              },
              [AccountType.ACCOUNT_TYPE_GLOBAL_REWARD]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS]: {
                amount: '0',
                percentageOfTotal: '0',
              },
            },
          },
          {
            asset: 'EUR',
            totalAmount: '50',
            decimals: 5,
            rewardTypes: {
              [AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_GLOBAL_REWARD]: {
                amount: '50',
                percentageOfTotal: '0.05',
              },
              [AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS]: {
                amount: '0',
                percentageOfTotal: '0',
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
            totalAmount: '200',
            decimals: 6,
            rewardTypes: {
              [AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES]: {
                amount: '100',
                percentageOfTotal: '0.1',
              },
              [AccountType.ACCOUNT_TYPE_GLOBAL_REWARD]: {
                amount: '100',
                percentageOfTotal: '0.1',
              },
              [AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS]: {
                amount: '0',
                percentageOfTotal: '0',
              },
            },
          },
        ],
      },
    ]);
  });

  it('returns data correctly for the requested epoch range', () => {
    const rewards = [reward1, reward2, reward3, reward4, reward5];
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
        rewards: [
          {
            asset: 'USD',
            decimals: 6,
            totalAmount: '150',
            rewardTypes: {
              [AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES]: {
                amount: '150',
                percentageOfTotal: '0.15',
              },
              [AccountType.ACCOUNT_TYPE_GLOBAL_REWARD]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS]: {
                amount: '0',
                percentageOfTotal: '0',
              },
            },
          },
        ],
      },
      {
        epoch: 2,
        rewards: [
          {
            asset: 'GBP',
            totalAmount: '200',
            decimals: 7,
            rewardTypes: {
              [AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES]: {
                amount: '200',
                percentageOfTotal: '0.2',
              },
              [AccountType.ACCOUNT_TYPE_GLOBAL_REWARD]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS]: {
                amount: '0',
                percentageOfTotal: '0',
              },
            },
          },
          {
            asset: 'EUR',
            totalAmount: '50',
            decimals: 5,
            rewardTypes: {
              [AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_GLOBAL_REWARD]: {
                amount: '50',
                percentageOfTotal: '0.05',
              },
              [AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS]: {
                amount: '0',
                percentageOfTotal: '0',
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
            totalAmount: '200',
            decimals: 6,
            rewardTypes: {
              [AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES]: {
                amount: '100',
                percentageOfTotal: '0.1',
              },
              [AccountType.ACCOUNT_TYPE_GLOBAL_REWARD]: {
                amount: '100',
                percentageOfTotal: '0.1',
              },
              [AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS]: {
                amount: '0',
                percentageOfTotal: '0',
              },
            },
          },
        ],
      },
    ]);
  });

  it('correctly calculates the percentage of two or more rewards by referencing the total rewards amount', () => {
    const result = generateEpochIndividualRewardsList({
      rewards: [
        // reward1 is 100 usd, which is 10% of the total rewards amount
        reward1,
        {
          rewardType: AccountType.ACCOUNT_TYPE_GLOBAL_REWARD,
          amount: '200',
          percentageOfTotal: '0.2',
          receivedAt: new Date(),
          asset: { id: 'usd', symbol: 'USD', name: 'USD', decimals: 6 },
          party: { id: 'blah' },
          epoch: { id: '1' },
        },
      ],
      epochId: 1,
      epochRewardSummaries: [
        {
          __typename: 'EpochRewardSummary',
          epoch: 1,
          assetId: 'usd',
          amount: '1000',
          rewardType: AccountType.ACCOUNT_TYPE_GLOBAL_REWARD,
        },
      ],
    });

    expect(result[0]).toEqual({
      epoch: 1,
      rewards: [
        {
          asset: 'USD',
          decimals: 6,
          totalAmount: '300',
          rewardTypes: {
            [AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE]: {
              amount: '0',
              percentageOfTotal: '0',
            },
            [AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES]: {
              amount: '0',
              percentageOfTotal: '0',
            },
            [AccountType.ACCOUNT_TYPE_GLOBAL_REWARD]: {
              amount: '300',
              percentageOfTotal: '30',
            },
            [AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES]: {
              amount: '0',
              percentageOfTotal: '0',
            },
            [AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES]: {
              amount: '0',
              percentageOfTotal: '0',
            },
            [AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS]: {
              amount: '0',
              percentageOfTotal: '0',
            },
          },
        },
      ],
    });
  });
});
