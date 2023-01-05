import type { LiquidityProviderFeeShare } from '@vegaprotocol/types';
import { AccountType } from '@vegaprotocol/types';
import { getLiquidityProvision } from './liquidity-data-provider';
import type {
  LiquidityProvisionFieldsFragment,
  MarketLpQuery,
} from './__generated__/MarketLiquidity';

const input = {
  liquidityProvisions: [
    {
      party: {
        id: 'dde288688af2aeb5feb349dd72d3679a7a9be34c7375f6a4a48ef2f6140e7e59',
        accountsConnection: {
          edges: [
            {
              node: {
                type: AccountType.ACCOUNT_TYPE_BOND,
                balance: '18003328918633596575000',
                __typename: 'AccountBalance',
              },
              __typename: 'AccountEdge',
            },
          ],
          __typename: 'AccountsConnection',
        },
        __typename: 'Party',
      },
      createdAt: '2022-12-16T09:28:29.071781Z',
      updatedAt: '2023-01-04T22:13:27.761985Z',
      commitmentAmount: '18003328918633596575000',
      fee: '0.001',
      status: 'STATUS_ACTIVE',
      __typename: 'LiquidityProvision',
    } as LiquidityProvisionFieldsFragment,
  ],
  marketLiquidity: {
    market: {
      id: 'ccbd651b4a1167fd73c4a0340ac759fa0a31ca487ad46a13254b741ad71947ed',
      decimalPlaces: 5,
      positionDecimalPlaces: 3,
      tradableInstrument: {
        instrument: {
          code: 'UNIDAI.MF21',
          name: 'UNIDAI Monthly (Dec 2022)',
          product: {
            settlementAsset: {
              id: '16ae5dbb1fd7aa2ddef725703bfe66b3647a4da7b844bfdd04e985756f53d9d6',
              symbol: 'tDAI',
              decimals: 18,
              __typename: 'Asset',
            },
            __typename: 'Future',
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      data: {
        market: {
          id: 'ccbd651b4a1167fd73c4a0340ac759fa0a31ca487ad46a13254b741ad71947ed',
          __typename: 'Market',
        },
        marketTradingMode: 'TRADING_MODE_CONTINUOUS',
        suppliedStake: '18003328918633596575000',
        openInterest: '89660',
        targetStake: '70159269843504000000',
        trigger: 'AUCTION_TRIGGER_UNSPECIFIED',
        marketValueProxy: '18003328918633596575000',
        __typename: 'MarketData',
      },
      __typename: 'Market',
    },
  } as MarketLpQuery,
  liquidityFeeShare: [
    {
      party: {
        id: 'dde288688af2aeb5feb349dd72d3679a7a9be34c7375f6a4a48ef2f6140e7e59',
        __typename: 'Party',
      },
      equityLikeShare: '1',
      averageEntryValuation: '12064118310408958216220.7224556301338111',
      __typename: 'LiquidityProviderFeeShare',
    } as LiquidityProviderFeeShare,
  ],
};

const result = [
  {
    __typename: 'LiquidityProvision',
    assetDecimalPlaces: 18,
    averageEntryValuation: '12064118310408958216220.7224556301338111',
    balance: '1.8003328918633596575e+22',
    commitmentAmount: '18003328918633596575000',
    createdAt: '2022-12-16T09:28:29.071781Z',
    equityLikeShare: '1',
    fee: '0.001',
    party: {
      __typename: 'Party',
      accountsConnection: {
        __typename: 'AccountsConnection',
        edges: [
          {
            __typename: 'AccountEdge',
            node: {
              __typename: 'AccountBalance',
              balance: '18003328918633596575000',
              type: 'ACCOUNT_TYPE_BOND',
            },
          },
        ],
      },
      id: 'dde288688af2aeb5feb349dd72d3679a7a9be34c7375f6a4a48ef2f6140e7e59',
    },
    status: 'STATUS_ACTIVE',
    updatedAt: '2023-01-04T22:13:27.761985Z',
  },
];

describe('getLiquidityProvision', () => {
  it('should return an empty array when no data is provided', () => {
    const data = getLiquidityProvision([], {}, []);
    expect(data).toEqual([]);
  });

  it('should return correct array when correct liquidity provision parameters are provided', () => {
    const data = getLiquidityProvision(
      input.liquidityProvisions,
      input.marketLiquidity,
      input.liquidityFeeShare
    );
    expect(data).toStrictEqual(result);
  });

  it('should return empty array when no liquidity provision parameters are provided', () => {
    const data = getLiquidityProvision(
      [],
      input.marketLiquidity,
      input.liquidityFeeShare
    );
    expect(data).toStrictEqual([]);
  });

  it('should return empty array when no market lp query parameter is provided', () => {
    const data = getLiquidityProvision(
      input.liquidityProvisions,
      {},
      input.liquidityFeeShare
    );
    const result = [
      {
        __typename: 'LiquidityProvision',
        assetDecimalPlaces: undefined,
        averageEntryValuation: '12064118310408958216220.7224556301338111',
        balance: '1.8003328918633596575e+22',
        commitmentAmount: '18003328918633596575000',
        createdAt: '2022-12-16T09:28:29.071781Z',
        equityLikeShare: '1',
        fee: '0.001',
        party: {
          __typename: 'Party',
          accountsConnection: {
            __typename: 'AccountsConnection',
            edges: [
              {
                __typename: 'AccountEdge',
                node: {
                  __typename: 'AccountBalance',
                  balance: '18003328918633596575000',
                  type: 'ACCOUNT_TYPE_BOND',
                },
              },
            ],
          },
          id: 'dde288688af2aeb5feb349dd72d3679a7a9be34c7375f6a4a48ef2f6140e7e59',
        },
        status: 'STATUS_ACTIVE',
        updatedAt: '2023-01-04T22:13:27.761985Z',
      },
    ];
    expect(data).toStrictEqual(result);
  });

  it('should return empty array when no liquidity fee share param is provided', () => {
    const data = getLiquidityProvision(
      input.liquidityProvisions,
      input.marketLiquidity,
      []
    );
    const result = [
      {
        __typename: 'LiquidityProvision',
        commitmentAmount: '18003328918633596575000',
        createdAt: '2022-12-16T09:28:29.071781Z',
        fee: '0.001',
        party: {
          __typename: 'Party',
          accountsConnection: {
            __typename: 'AccountsConnection',
            edges: [
              {
                __typename: 'AccountEdge',
                node: {
                  __typename: 'AccountBalance',
                  balance: '18003328918633596575000',
                  type: 'ACCOUNT_TYPE_BOND',
                },
              },
            ],
          },
          id: 'dde288688af2aeb5feb349dd72d3679a7a9be34c7375f6a4a48ef2f6140e7e59',
        },
        status: 'STATUS_ACTIVE',
        updatedAt: '2023-01-04T22:13:27.761985Z',
      },
    ];
    expect(data).toStrictEqual(result);
  });
});
