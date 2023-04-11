import { generateEpochTotalRewardsList } from './generate-epoch-total-rewards-list';
import { AccountType } from '@vegaprotocol/types';

describe('generateEpochAssetRewardsList', () => {
  it('should return an empty array if data is undefined', () => {
    const result = generateEpochTotalRewardsList({ epochId: 1 });

    expect(result).toEqual(new Map());
  });

  it('should return an empty array if empty data is provided', () => {
    const data = {
      assetsConnection: {
        edges: [],
      },
      epochRewardSummaries: {
        edges: [],
      },
      epoch: {
        timestamps: {
          expiry: null,
        },
      },
    };

    const result = generateEpochTotalRewardsList({ data, epochId: 1 });

    expect(result).toEqual(new Map());
  });

  it('should return an empty array if no epochRewardSummaries are provided', () => {
    const data = {
      assetsConnection: {
        edges: [
          {
            node: {
              id: '1',
              name: 'Asset 1',
            },
          },
          {
            node: {
              id: '2',
              name: 'Asset 2',
            },
          },
        ],
      },
      epochRewardSummaries: {
        edges: [],
      },
      epoch: {
        timestamps: {
          expiry: null,
        },
      },
    };

    const result = generateEpochTotalRewardsList({ data, epochId: 1 });

    expect(result).toEqual(new Map());
  });

  it('should return an array of unnamed assets if no asset names are provided (should not happen)', () => {
    const data = {
      assetsConnection: {
        edges: [],
      },
      epochRewardSummaries: {
        edges: [
          {
            node: {
              epoch: 1,
              assetId: '1',
              rewardType: AccountType.ACCOUNT_TYPE_GLOBAL_REWARD,
              amount: '123',
            },
          },
        ],
      },
      epoch: {
        timestamps: {
          expiry: null,
        },
      },
    };

    const result = generateEpochTotalRewardsList({ data, epochId: 1 });

    expect(result).toEqual([
      {
        epoch: 1,
        assetRewards: [
          {
            assetId: '1',
            name: '',
            rewards: [
              {
                rewardType: AccountType.ACCOUNT_TYPE_GLOBAL_REWARD,
                amount: '123',
              },
              {
                rewardType: AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
                amount: '0',
              },
              {
                rewardType: AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
                amount: '0',
              },
              {
                rewardType: AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES,
                amount: '0',
              },
              {
                rewardType: AccountType.ACCOUNT_TYPE_FEES_LIQUIDITY,
                amount: '0',
              },
              {
                rewardType: AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS,
                amount: '0',
              },
            ],
            totalAmount: '123',
          },
        ],
      },
    ]);
  });

  it('should return an array of aggregated epoch summaries', () => {
    const data = {
      assetsConnection: {
        edges: [
          {
            node: {
              id: '1',
              name: 'Asset 1',
            },
          },
          {
            node: {
              id: '2',
              name: 'Asset 2',
            },
          },
        ],
      },
      epochRewardSummaries: {
        edges: [
          {
            node: {
              epoch: 1,
              assetId: '1',
              rewardType: AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
              amount: '123',
            },
          },
          {
            node: {
              epoch: 1,
              assetId: '1',
              rewardType: AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
              amount: '100',
            },
          },
          {
            node: {
              epoch: 2,
              assetId: '1',
              rewardType: AccountType.ACCOUNT_TYPE_FEES_LIQUIDITY,
              amount: '5',
            },
          },
        ],
      },
      epoch: {
        timestamps: {
          expiry: null,
        },
      },
    };

    const result = generateEpochTotalRewardsList({ data, epochId: 1 });

    expect(result).toEqual([
      {
        epoch: 1,
        assetRewards: [
          {
            assetId: '1',
            name: 'Asset 1',
            rewards: [
              {
                rewardType: AccountType.ACCOUNT_TYPE_GLOBAL_REWARD,
                amount: '0',
              },
              {
                rewardType: AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
                amount: '100',
              },
              {
                rewardType: AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
                amount: '123',
              },
              {
                rewardType: AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES,
                amount: '0',
              },
              {
                rewardType: AccountType.ACCOUNT_TYPE_FEES_LIQUIDITY,
                amount: '0',
              },
              {
                rewardType: AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS,
                amount: '0',
              },
            ],
            totalAmount: '223',
          },
        ],
      },
      {
        epoch: 2,
        assetRewards: [
          {
            assetId: '1',
            name: 'Asset 1',
            rewards: [
              {
                rewardType: AccountType.ACCOUNT_TYPE_GLOBAL_REWARD,
                amount: '0',
              },
              {
                rewardType: AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
                amount: '0',
              },
              {
                rewardType: AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
                amount: '0',
              },
              {
                rewardType: AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES,
                amount: '0',
              },
              {
                rewardType: AccountType.ACCOUNT_TYPE_FEES_LIQUIDITY,
                amount: '5',
              },
              {
                rewardType: AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS,
                amount: '0',
              },
            ],
            totalAmount: '5',
          },
        ],
      },
    ]);
  });
});
