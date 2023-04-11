import { generateEpochIndividualRewardsList } from './generate-epoch-individual-rewards-list';
import { AccountType } from '@vegaprotocol/types';
import type { RewardFieldsFragment } from '../home/__generated__/Rewards';

describe('generateEpochIndividualRewardsList', () => {
  const reward1: RewardFieldsFragment = {
    rewardType: AccountType.ACCOUNT_TYPE_GLOBAL_REWARD,
    amount: '100',
    percentageOfTotal: '0.1',
    receivedAt: new Date(),
    asset: { id: 'usd', symbol: 'USD', name: 'USD' },
    party: { id: 'blah' },
    epoch: { id: '1' },
  };

  const reward2: RewardFieldsFragment = {
    rewardType: AccountType.ACCOUNT_TYPE_GLOBAL_REWARD,
    amount: '50',
    percentageOfTotal: '0.05',
    receivedAt: new Date(),
    asset: { id: 'eur', symbol: 'EUR', name: 'EUR' },
    party: { id: 'blah' },
    epoch: { id: '2' },
  };

  const reward3: RewardFieldsFragment = {
    rewardType: AccountType.ACCOUNT_TYPE_FEES_LIQUIDITY,
    amount: '200',
    percentageOfTotal: '0.2',
    receivedAt: new Date(),
    asset: { id: 'gbp', symbol: 'GBP', name: 'GBP' },
    party: { id: 'blah' },
    epoch: { id: '2' },
  };

  const reward4: RewardFieldsFragment = {
    rewardType: AccountType.ACCOUNT_TYPE_FEES_LIQUIDITY,
    amount: '100',
    percentageOfTotal: '0.1',
    receivedAt: new Date(),
    asset: { id: 'usd', symbol: 'USD', name: 'USD' },
    party: { id: 'blah' },
    epoch: { id: '1' },
  };

  const rewardWrongType: RewardFieldsFragment = {
    rewardType: AccountType.ACCOUNT_TYPE_INSURANCE,
    amount: '50',
    percentageOfTotal: '0.05',
    receivedAt: new Date(),
    asset: { id: 'eur', symbol: 'EUR', name: 'EUR' },
    party: { id: 'blah' },
    epoch: { id: '2' },
  };

  it('should return an empty array if no rewards are provided', () => {
    expect(generateEpochIndividualRewardsList({ rewards: [], epochId: 1 })).toEqual([]);
  });

  it('should filter out any rewards of the wrong type', () => {
    const result = generateEpochIndividualRewardsList({
      rewards: [rewardWrongType],
      epochId: 1,
    });

    expect(result).toEqual([]);
  });

  it('should return reward in the correct format', () => {
    const result = generateEpochIndividualRewardsList({
      rewards: [reward1],
      epochId: 1,
    });

    expect(result[0]).toEqual({
      epoch: '1',
      rewards: [
        {
          asset: 'USD',
          totalAmount: '100',
          rewardTypes: {
            [AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE]: {
              amount: '0',
              percentageOfTotal: '0',
            },
            [AccountType.ACCOUNT_TYPE_FEES_LIQUIDITY]: {
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
    const result1 = generateEpochIndividualRewardsList({ rewards, epochId: 1 });

    expect(result1[0].epoch).toEqual('2');
    expect(result1[1].epoch).toEqual('1');

    const reorderedRewards = [reward4, reward3, reward2, reward1];
    const result2 = generateEpochIndividualRewardsList({
      rewards: reorderedRewards,
      epochId: 1,
    });

    expect(result2[0].epoch).toEqual('2');
    expect(result2[1].epoch).toEqual('1');
  });

  it('correctly calculates the total value of rewards for an asset', () => {
    const rewards = [reward1, reward4];
    const result = generateEpochIndividualRewardsList({ rewards, epochId: 1 });

    expect(result[0].rewards[0].totalAmount).toEqual('200');
  });

  it('returns data in the expected shape', () => {
    // Just sanity checking the whole structure here
    const rewards = [reward1, reward2, reward3, reward4];
    const result = generateEpochIndividualRewardsList({ rewards, epochId: 1 });

    expect(result).toEqual([
      {
        epoch: '2',
        rewards: [
          {
            asset: 'GBP',
            totalAmount: '200',
            rewardTypes: {
              [AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_FEES_LIQUIDITY]: {
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
            rewardTypes: {
              [AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_FEES_LIQUIDITY]: {
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
        epoch: '1',
        rewards: [
          {
            asset: 'USD',
            totalAmount: '200',
            rewardTypes: {
              [AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE]: {
                amount: '0',
                percentageOfTotal: '0',
              },
              [AccountType.ACCOUNT_TYPE_FEES_LIQUIDITY]: {
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
});
