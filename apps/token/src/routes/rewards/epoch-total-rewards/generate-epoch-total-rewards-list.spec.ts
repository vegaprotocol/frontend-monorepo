import { generateEpochTotalRewardsList } from './generate-epoch-total-rewards-list';
import { AccountType } from '@vegaprotocol/types';

describe('generateEpochAssetRewardsList', () => {
  it('should return an empty array if data is undefined', () => {
    const result = generateEpochTotalRewardsList(undefined);

    expect(result).toEqual([]);
  });

  it('should return an empty array if empty data is provided', () => {
    const epochData = {
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

    const result = generateEpochTotalRewardsList(epochData);

    expect(result).toEqual([]);
  });

  it('should return an empty array if no epochRewardSummaries are provided', () => {
    const epochData = {
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

    const result = generateEpochTotalRewardsList(epochData);

    expect(result).toEqual([]);
  });

  it('should return an array of unnamed assets if no assets are provided (should not happen)', () => {
    const epochData = {
      assetsConnection: {
        edges: [],
      },
      epochRewardSummaries: {
        edges: [
          {
            node: {
              epoch: 1,
              assetId: '1',
              rewardType: AccountType.ACCOUNT_TYPE_INSURANCE,
              amount: '123',
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

    const result = generateEpochTotalRewardsList(epochData);

    expect(result).toEqual([
      {
        epoch: 1,
        assetRewards: [
          {
            assetId: '1',
            name: '',
            rewards: [
              {
                rewardType: AccountType.ACCOUNT_TYPE_INSURANCE,
                amount: '123',
              },
            ],
            totalAmount: '123',
          },
        ],
      },
      {
        epoch: 2,
        assetRewards: [
          {
            assetId: '1',
            name: '',
            rewards: [
              {
                rewardType: AccountType.ACCOUNT_TYPE_FEES_LIQUIDITY,
                amount: '5',
              },
            ],
            totalAmount: '5',
          },
        ],
      },
    ]);
  });

  it('should return an array of aggregated epoch summaries', () => {
    const epochData = {
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
              rewardType: AccountType.ACCOUNT_TYPE_INSURANCE,
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
              epoch: 1,
              assetId: '2',
              rewardType: AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
              amount: '17.9873',
            },
          },
          {
            node: {
              epoch: 1,
              assetId: '2',
              rewardType: AccountType.ACCOUNT_TYPE_FEES_LIQUIDITY,
              amount: '1',
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

    const result = generateEpochTotalRewardsList(epochData);

    expect(result).toEqual([
      {
        epoch: 1,
        assetRewards: [
          {
            assetId: '1',
            name: 'Asset 1',
            rewards: [
              {
                rewardType: AccountType.ACCOUNT_TYPE_INSURANCE,
                amount: '123',
              },
              {
                rewardType: AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
                amount: '100',
              },
            ],
            totalAmount: '223',
          },
          {
            assetId: '2',
            name: 'Asset 2',
            rewards: [
              {
                rewardType: AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
                amount: '17.9873',
              },
              {
                rewardType: AccountType.ACCOUNT_TYPE_FEES_LIQUIDITY,
                amount: '1',
              },
            ],
            totalAmount: '18.9873',
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
                rewardType: AccountType.ACCOUNT_TYPE_FEES_LIQUIDITY,
                amount: '5',
              },
            ],
            totalAmount: '5',
          },
        ],
      },
    ]);
  });
});
