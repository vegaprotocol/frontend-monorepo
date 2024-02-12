import { generateEpochTotalRewardsList } from './generate-epoch-total-rewards-list';
import { AccountType } from '@vegaprotocol/types';

describe('generateEpochAssetRewardsList', () => {
  it('should return an empty array if data is undefined', () => {
    const result = generateEpochTotalRewardsList({ epochId: 1 });

    expect(result).toEqual(
      new Map([
        [
          '1',
          {
            epoch: 1,
            assetRewards: new Map(),
          },
        ],
      ])
    );
  });

  it('should return an empty map if empty data is provided', () => {
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

    expect(result).toEqual(
      new Map([
        [
          '1',
          {
            epoch: 1,
            assetRewards: new Map(),
          },
        ],
      ])
    );
  });

  it('should return an empty map if no epochRewardSummaries are provided', () => {
    const data = {
      assetsConnection: {
        edges: [
          {
            node: {
              id: '1',
              name: 'Asset 1',
              decimals: 18,
            },
          },
          {
            node: {
              id: '2',
              name: 'Asset 2',
              decimals: 6,
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

    expect(result).toEqual(
      new Map([
        [
          '1',
          {
            epoch: 1,
            assetRewards: new Map(),
          },
        ],
      ])
    );
  });

  it('should return a map of unnamed assets if no asset names are provided (should not happen)', () => {
    const data = {
      assetsConnection: {
        edges: [],
      },
      epochRewardSummaries: {
        edges: [
          {
            node: {
              epoch: 1,
              decimals: 18,
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

    expect(result).toEqual(
      new Map([
        [
          '1',
          {
            epoch: 1,
            assetRewards: new Map([
              [
                '1',
                {
                  assetId: '1',
                  decimals: 0,
                  name: '',
                  rewards: new Map([
                    [
                      AccountType.ACCOUNT_TYPE_GLOBAL_REWARD,
                      {
                        rewardType: AccountType.ACCOUNT_TYPE_GLOBAL_REWARD,
                        amount: '123',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
                        amount: '0',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
                        amount: '0',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES,
                        amount: '0',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES,
                        amount: '0',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS,
                        amount: '0',
                      },
                    ],
                  ]),
                  totalAmount: '123',
                },
              ],
            ]),
          },
        ],
      ])
    );
  });

  it('should return the aggregated epoch summaries', () => {
    const data = {
      assetsConnection: {
        edges: [
          {
            node: {
              id: '1',
              name: 'Asset 1',
              decimals: 18,
            },
          },
          {
            node: {
              id: '2',
              name: 'Asset 2',
              decimals: 6,
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
              decimals: 18,
              rewardType: AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
              amount: '123',
            },
          },
          {
            node: {
              epoch: 1,
              assetId: '1',
              decimals: 18,
              rewardType: AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
              amount: '100',
            },
          },
          {
            node: {
              epoch: 2,
              assetId: '1',
              decimals: 18,
              rewardType: AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES,
              amount: '5',
            },
          },
          {
            // This should not be included in the result
            node: {
              epoch: 2,
              assetId: '3',
              decimals: 18,
              rewardType: AccountType.ACCOUNT_TYPE_REWARD_RETURN_VOLATILITY,
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

    const result = generateEpochTotalRewardsList({ data, epochId: 2 });

    expect(result).toEqual(
      new Map([
        [
          '1',
          {
            epoch: 1,
            assetRewards: new Map([
              [
                '1',
                {
                  assetId: '1',
                  decimals: 18,
                  name: 'Asset 1',
                  rewards: new Map([
                    [
                      AccountType.ACCOUNT_TYPE_GLOBAL_REWARD,
                      {
                        rewardType: AccountType.ACCOUNT_TYPE_GLOBAL_REWARD,
                        amount: '0',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
                        amount: '100',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
                        amount: '123',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES,
                        amount: '0',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES,
                        amount: '0',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS,
                        amount: '0',
                      },
                    ],
                  ]),
                  totalAmount: '223',
                },
              ],
            ]),
          },
        ],
        [
          '2',
          {
            epoch: 2,
            assetRewards: new Map([
              [
                '1',
                {
                  assetId: '1',
                  decimals: 18,
                  name: 'Asset 1',
                  rewards: new Map([
                    [
                      AccountType.ACCOUNT_TYPE_GLOBAL_REWARD,
                      {
                        rewardType: AccountType.ACCOUNT_TYPE_GLOBAL_REWARD,
                        amount: '0',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
                        amount: '0',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
                        amount: '0',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES,
                        amount: '0',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES,
                        amount: '5',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS,
                        amount: '0',
                      },
                    ],
                  ]),
                  totalAmount: '5',
                },
              ],
            ]),
          },
        ],
      ])
    );
  });

  it('should return the requested range for aggregated epoch summaries', () => {
    const data = {
      assetsConnection: {
        edges: [
          {
            node: {
              id: '1',
              name: 'Asset 1',
              decimals: 18,
            },
          },
          {
            node: {
              id: '2',
              name: 'Asset 2',
              decimals: 6,
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
              decimals: 18,
              rewardType: AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
              amount: '123',
            },
          },
          {
            node: {
              epoch: 1,
              assetId: '1',
              decimals: 18,
              rewardType: AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
              amount: '100',
            },
          },
          {
            node: {
              epoch: 2,
              assetId: '1',
              decimals: 18,
              rewardType: AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES,
              amount: '6',
            },
          },
          {
            node: {
              epoch: 2,
              assetId: '1',
              decimals: 18,
              rewardType: AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES,
              amount: '27',
            },
          },
          {
            node: {
              epoch: 3,
              assetId: '1',
              decimals: 18,
              rewardType: AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
              amount: '15',
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

    const resultPageOne = generateEpochTotalRewardsList({
      data,
      epochId: 3,
      page: 1,
      size: 2,
    });

    expect(resultPageOne).toEqual(
      new Map([
        [
          '2',
          {
            epoch: 2,
            assetRewards: new Map([
              [
                '1',
                {
                  assetId: '1',
                  name: 'Asset 1',
                  decimals: 18,
                  rewards: new Map([
                    [
                      AccountType.ACCOUNT_TYPE_GLOBAL_REWARD,
                      {
                        rewardType: AccountType.ACCOUNT_TYPE_GLOBAL_REWARD,
                        amount: '0',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
                        amount: '0',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
                        amount: '0',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES,
                        amount: '0',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES,
                        amount: '33',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS,
                        amount: '0',
                      },
                    ],
                  ]),
                  totalAmount: '33',
                },
              ],
            ]),
          },
        ],
        [
          '3',
          {
            epoch: 3,
            assetRewards: new Map([
              [
                '1',
                {
                  assetId: '1',
                  decimals: 18,
                  name: 'Asset 1',
                  rewards: new Map([
                    [
                      AccountType.ACCOUNT_TYPE_GLOBAL_REWARD,
                      {
                        rewardType: AccountType.ACCOUNT_TYPE_GLOBAL_REWARD,
                        amount: '0',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
                        amount: '15',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
                        amount: '0',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES,
                        amount: '0',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES,
                        amount: '0',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS,
                        amount: '0',
                      },
                    ],
                  ]),
                  totalAmount: '15',
                },
              ],
            ]),
          },
        ],
      ])
    );

    const resultPageTwo = generateEpochTotalRewardsList({
      data,
      epochId: 3,
      page: 2,
      size: 2,
    });

    expect(resultPageTwo).toEqual(
      new Map([
        [
          '1',
          {
            epoch: 1,
            assetRewards: new Map([
              [
                '1',
                {
                  assetId: '1',
                  decimals: 18,
                  name: 'Asset 1',
                  rewards: new Map([
                    [
                      AccountType.ACCOUNT_TYPE_GLOBAL_REWARD,
                      {
                        rewardType: AccountType.ACCOUNT_TYPE_GLOBAL_REWARD,
                        amount: '0',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
                        amount: '100',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
                        amount: '123',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES,
                        amount: '0',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES,
                        amount: '0',
                      },
                    ],
                    [
                      AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS,
                      {
                        rewardType:
                          AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS,
                        amount: '0',
                      },
                    ],
                  ]),
                  totalAmount: '223',
                },
              ],
            ]),
          },
        ],
      ])
    );
  });
});
