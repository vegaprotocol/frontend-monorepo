import type { OrderSubmissionBody } from '@vegaprotocol/wallet';
import {
  mapFormValuesToOrderSubmission,
  mapFormValuesToTakeProfitAndStopLoss,
} from './map-form-values-to-submission';
import * as Schema from '@vegaprotocol/types';
import { OrderTimeInForce, OrderType } from '@vegaprotocol/types';
import type { OrderFormValues } from '../hooks';
import { type MarketFieldsFragment } from '@vegaprotocol/markets';

describe('mapFormValuesToOrderSubmission', () => {
  it('sets and formats price only for limit orders', () => {
    expect(
      mapFormValuesToOrderSubmission(
        { price: '100' } as unknown as OrderSubmissionBody['orderSubmission'],
        'marketId',
        2,
        1
      ).price
    ).toBeUndefined();
    expect(
      mapFormValuesToOrderSubmission(
        {
          price: '100',
          type: Schema.OrderType.TYPE_LIMIT,
        } as unknown as OrderSubmissionBody['orderSubmission'],
        'marketId',
        2,
        1
      ).price
    ).toEqual('10000');
  });

  it('sets and formats expiresAt only for GTT orders', () => {
    expect(
      mapFormValuesToOrderSubmission(
        {
          expiresAt: '2022-01-01T00:00:00.000Z',
        } as OrderSubmissionBody['orderSubmission'],
        'marketId',
        2,
        1
      ).expiresAt
    ).toBeUndefined();
    expect(
      mapFormValuesToOrderSubmission(
        {
          expiresAt: '2022-01-01T00:00:00.000Z',
          timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTT,
        } as OrderSubmissionBody['orderSubmission'],
        'marketId',
        2,
        1
      ).expiresAt
    ).toEqual('1640995200000000000');
  });

  it('sets and formats icebergOpts only for persisted orders', () => {
    expect(
      mapFormValuesToOrderSubmission(
        {
          type: OrderType.TYPE_LIMIT,
          timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK,
          iceberg: true,
          peakSize: '10.00',
          minimumVisibleSize: '10.00',
        } as OrderFormValues,
        'marketId',
        2,
        2
      ).icebergOpts
    ).toEqual(undefined);

    expect(
      mapFormValuesToOrderSubmission(
        {
          type: OrderType.TYPE_LIMIT,
          timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
          iceberg: true,
          peakSize: '10.00',
          minimumVisibleSize: '10.00',
        } as OrderFormValues,
        'marketId',
        2,
        2
      ).icebergOpts
    ).toEqual({
      peakSize: '1000',
      minimumVisibleSize: '1000',
    });
  });

  it('formats size', () => {
    expect(
      mapFormValuesToOrderSubmission(
        {
          size: '100',
        } as OrderSubmissionBody['orderSubmission'],
        'marketId',
        2,
        1
      ).size
    ).toEqual('1000');
  });

  it.each([
    { timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK, postOnly: false },
    { timeInForce: OrderTimeInForce.TIME_IN_FORCE_GFA, postOnly: true },
    { timeInForce: OrderTimeInForce.TIME_IN_FORCE_GFN, postOnly: true },
    { timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC, postOnly: true },
    { timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTT, postOnly: true },
    { timeInForce: OrderTimeInForce.TIME_IN_FORCE_IOC, postOnly: false },
  ])(
    'sets postOnly correctly when TIF is $timeInForce',
    ({
      timeInForce,
      postOnly,
    }: {
      timeInForce: OrderTimeInForce;
      postOnly: boolean;
    }) => {
      expect(
        mapFormValuesToOrderSubmission(
          {
            type: OrderType.TYPE_LIMIT,
            timeInForce,
            postOnly: true,
          } as OrderFormValues,
          'marketId',
          2,
          2
        ).postOnly
      ).toEqual(postOnly);
      // sets always false if type is market
      expect(
        mapFormValuesToOrderSubmission(
          {
            type: OrderType.TYPE_MARKET,
            timeInForce,
            postOnly: true,
          } as OrderFormValues,
          'marketId',
          2,
          2
        ).postOnly
      ).toEqual(false);
    }
  );

  it.each([
    { timeInForce: OrderTimeInForce.TIME_IN_FORCE_FOK, reduceOnly: true },
    { timeInForce: OrderTimeInForce.TIME_IN_FORCE_GFA, reduceOnly: false },
    { timeInForce: OrderTimeInForce.TIME_IN_FORCE_GFN, reduceOnly: false },
    { timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC, reduceOnly: false },
    { timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTT, reduceOnly: false },
    { timeInForce: OrderTimeInForce.TIME_IN_FORCE_IOC, reduceOnly: true },
  ])(
    'sets reduceOnly correctly when TIF is $timeInForce',
    ({
      timeInForce,
      reduceOnly,
    }: {
      timeInForce: OrderTimeInForce;
      reduceOnly: boolean;
    }) => {
      expect(
        mapFormValuesToOrderSubmission(
          {
            type: OrderType.TYPE_MARKET,
            timeInForce,
            reduceOnly: true,
          } as OrderFormValues,
          'marketId',
          2,
          2
        ).reduceOnly
      ).toEqual(reduceOnly);
      expect(
        mapFormValuesToOrderSubmission(
          {
            type: OrderType.TYPE_LIMIT,
            timeInForce,
            reduceOnly: true,
          } as OrderFormValues,
          'marketId',
          2,
          2
        ).reduceOnly
      ).toEqual(reduceOnly);
    }
  );
});

const market: MarketFieldsFragment = {
  __typename: 'Market',
  id: 'marketId',
  decimalPlaces: 1,
  positionDecimalPlaces: 4,
  state: Schema.MarketState.STATE_ACTIVE,
  tradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
  fees: {
    __typename: 'Fees',
    factors: {
      __typename: 'FeeFactors',
      makerFee: '0.0002',
      infrastructureFee: '0.0005',
      liquidityFee: '0.0001',
    },
    liquidityFeeSettings: {
      __typename: 'LiquidityFeeSettings',
      feeConstant: null,
      method: Schema.LiquidityFeeMethod.METHOD_MARGINAL_COST,
    },
  },
  tradableInstrument: {
    __typename: 'TradableInstrument',
    instrument: {
      __typename: 'Instrument',
      id: '',
      name: 'Bitcoin / Tether USD (Perpetual)',
      code: 'BTC/USDT',
      metadata: {
        __typename: 'InstrumentMetadata',
        tags: [
          'base:BTC',
          'quote:USDT',
          'oracle:pyth',
          'oracleChain:gnosis',
          'class:fx/crypto',
          'perpetual',
          'sector:defi',
          'enactment:2023-12-01T18:00:00Z',
        ],
      },
      product: {
        __typename: 'Perpetual',
        quoteName: 'USDT',
        fundingRateScalingFactor: '1',
        fundingRateLowerBound: '-0.001',
        fundingRateUpperBound: '0.001',
        settlementAsset: {
          __typename: 'Asset',
          id: '8ba0b10971f0c4747746cd01ff05a53ae75ca91eba1d4d050b527910c983e27e',
          symbol: 'USDT',
          name: 'Tether USD',
          decimals: 6,
          quantum: '1000000',
        },
        dataSourceSpecForSettlementData: {
          __typename: 'DataSourceSpec',
          id: '6c3df6eb28ff3e7db9e6b2b27c62f43b30673df4837ba5e54814063527228939',
          data: {
            __typename: 'DataSourceDefinition',
            sourceType: {
              __typename: 'DataSourceDefinitionExternal',
              sourceType: {
                __typename: 'EthCallSpec',
                abi: [
                  '[{"inputs": [{"internalType": "bytes32", "name": "id", "type": "bytes32"}], "name": "getPrice", "outputs": [{"internalType": "int256", "name": "", "type": "int256" }], "stateMutability": "view", "type": "function"}]',
                ],
                address: '0x719abd606155442c21b7d561426d42bd0e40a776',
                args: ['"5i32yLSoX+GmfbRNwS3l2zMPesZrctxliv7fD0pBW0M="'],
                method: 'getPrice',
                requiredConfirmations: 3,
                normalisers: [
                  {
                    __typename: 'Normaliser',
                    name: 'btc.price',
                    expression: '$[0]',
                  },
                ],
                trigger: {
                  __typename: 'EthCallTrigger',
                  trigger: {
                    __typename: 'EthTimeTrigger',
                    initial: '2024-02-23T21:44:12Z',
                    every: 60,
                    until: null,
                  },
                },
                filters: [
                  {
                    __typename: 'Filter',
                    key: {
                      __typename: 'PropertyKey',
                      name: 'btc.price',
                      type: Schema.PropertyKeyType.TYPE_INTEGER,
                      numberDecimalPlaces: 18,
                    },
                    conditions: [
                      {
                        __typename: 'Condition',
                        value: '0',
                        operator:
                          Schema.ConditionOperator.OPERATOR_GREATER_THAN,
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
        dataSourceSpecForSettlementSchedule: {
          __typename: 'DataSourceSpec',
          id: '5c45c686b8cf0b5bd85a5c39608cbec3d0e6e49a318264eaaf8c3f45d37255dc',
          data: {
            __typename: 'DataSourceDefinition',
            sourceType: {
              __typename: 'DataSourceDefinitionInternal',
              sourceType: {
                __typename: 'DataSourceSpecConfigurationTimeTrigger',
                triggers: [
                  {
                    __typename: 'InternalTimeTrigger',
                    initial: 1708724652,
                    every: 28800,
                  },
                ],
                conditions: [
                  {
                    __typename: 'Condition',
                    operator: Schema.ConditionOperator.OPERATOR_GREATER_THAN,
                    value: '0',
                  },
                ],
              },
            },
          },
        },
        dataSourceSpecBinding: {
          __typename: 'DataSourceSpecPerpetualBinding',
          settlementDataProperty: 'btc.price',
          settlementScheduleProperty: 'vegaprotocol.builtin.timetrigger',
        },
      },
    },
  },
  marketTimestamps: {
    __typename: 'MarketTimestamps',
    open: '2024-02-16T20:25:45.340803198Z',
    close: null,
  },
};

const orderFormValues: OrderFormValues = {
  type: OrderType.TYPE_LIMIT,
  side: Schema.Side.SIDE_BUY,
  timeInForce: OrderTimeInForce.TIME_IN_FORCE_GTC,
  size: '1',
  price: '66300',
  postOnly: false,
  reduceOnly: false,
  iceberg: false,
  tpSl: true,
  takeProfit: '70000',
  stopLoss: '60000',
};

describe('mapFormValuesToTakeProfitAndStopLoss', () => {
  it('creates batch market instructions for a normal order created with TP and SL', () => {
    const result = mapFormValuesToTakeProfitAndStopLoss(
      orderFormValues,
      market,
      'reference'
    );

    const expected = {
      stopOrdersSubmission: [
        {
          fallsBelow: undefined,
          risesAbove: {
            orderSubmission: {
              expiresAt: undefined,
              icebergOpts: undefined,
              marketId: 'marketId',
              postOnly: false,
              price: undefined,
              reduceOnly: true,
              reference: 'reference',
              side: 'SIDE_SELL',
              size: '10000',
              timeInForce: 'TIME_IN_FORCE_FOK',
              type: 'TYPE_MARKET',
            },
            price: '700000',
          },
        },
        {
          fallsBelow: {
            orderSubmission: {
              expiresAt: undefined,
              icebergOpts: undefined,
              marketId: 'marketId',
              postOnly: false,
              price: undefined,
              reduceOnly: false,
              reference: 'reference',
              side: 'SIDE_SELL',
              size: '10000',
              timeInForce: 'TIME_IN_FORCE_GTC',
              type: 'TYPE_MARKET',
            },
            price: '600000',
          },
          risesAbove: undefined,
        },
      ],
      submissions: [
        {
          expiresAt: undefined,
          icebergOpts: undefined,
          marketId: 'marketId',
          postOnly: false,
          price: '663000',
          reduceOnly: false,
          reference: 'reference',
          side: 'SIDE_BUY',
          size: '10000',
          timeInForce: 'TIME_IN_FORCE_GTC',
          type: 'TYPE_LIMIT',
        },
      ],
    };

    expect(result).toStrictEqual(expected);
  });
});
