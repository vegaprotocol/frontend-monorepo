import merge from 'lodash/merge';
import * as Schema from '@vegaprotocol/types';
import type { StopOrder } from '../order-data-provider/stop-orders-data-provider';
import type { PartialDeep } from 'type-fest';

export const generateStopOrder = (
  partialStopOrder?: PartialDeep<StopOrder>
) => {
  const stopOrder: StopOrder = {
    __typename: 'StopOrder',
    id: 'stop-order-id',
    marketId: 'market-id',
    partyId: 'party-id',
    triggerDirection:
      Schema.StopOrderTriggerDirection.TRIGGER_DIRECTION_RISES_ABOVE,
    trigger: {
      trailingPercentOffset: '5',
    },
    ocoLinkId: undefined,
    market: {
      __typename: 'Market',
      id: 'market-id',
      decimalPlaces: 1,
      fees: {
        __typename: 'Fees',
        factors: {
          __typename: 'FeeFactors',
          infrastructureFee: '0.1',
          liquidityFee: '0.1',
          makerFee: '0.1',
        },
      },
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        close: '',
        open: '',
      },
      positionDecimalPlaces: 2,
      state: Schema.MarketState.STATE_ACTIVE,
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          code: 'XYZ',
          id: 'XYZ',
          metadata: {
            __typename: 'InstrumentMetadata',
            tags: ['xyz asset'],
          },
          name: 'XYZ intrument',
          product: {
            __typename: 'Future',
            quoteName: '',
            settlementAsset: {
              __typename: 'Asset',
              id: 'asset-id',
              decimals: 1,
              symbol: 'XYZ',
              name: 'XYZ',
              quantum: '1',
            },
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceSpec',
              id: 'oracleId',
              data: {
                __typename: 'DataSourceDefinition',
                sourceType: {
                  __typename: 'DataSourceDefinitionExternal',
                  sourceType: {
                    __typename: 'DataSourceSpecConfiguration',
                  },
                },
              },
            },
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceSpec',
              id: 'oracleId',
              data: {
                __typename: 'DataSourceDefinition',
                sourceType: {
                  __typename: 'DataSourceDefinitionExternal',
                  sourceType: {
                    __typename: 'DataSourceSpecConfiguration',
                  },
                },
              },
            },
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              tradingTerminationProperty: 'trading-termination-property',
              settlementDataProperty: 'settlement-data-property',
            },
          },
        },
      },
      tradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
    },
    submission: {
      marketId: 'market-id',
      size: '10',
      type: Schema.OrderType.TYPE_MARKET,
      side: Schema.Side.SIDE_BUY,
      price: '',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_IOC,
      expiresAt: null,
    },
    status: Schema.StopOrderStatus.STATUS_PENDING,
    createdAt: new Date().toISOString(),
    updatedAt: null,
    expiresAt: null,
  };
  return merge(stopOrder, partialStopOrder);
};

export const limitOrder = generateStopOrder({
  id: 'limit-order',
  type: Schema.OrderType.TYPE_LIMIT,
  status: Schema.OrderStatus.STATUS_ACTIVE,
  timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTT,
  createdAt: new Date(2022, 3, 3).toISOString(),
  expiresAt: new Date(2022, 3, 5).toISOString(),
});

export const marketOrder = generateStopOrder({
  id: 'market-order',
  type: Schema.OrderType.TYPE_MARKET,
  status: Schema.OrderStatus.STATUS_ACTIVE,
});

export const generateMockOrders = (): StopOrder[] => {
  return [
    generateStopOrder({
      id: '066468C06549101DAF7BC51099E1412A0067DC08C246B7D8013C9D0CBF1E8EE7',
      market: {
        __typename: 'Market',
        id: 'c9f5acd348796011c075077e4d58d9b7f1689b7c1c8e030a5e886b83aa96923d',
      },
      size: '10',
      type: Schema.OrderType.TYPE_LIMIT,
      status: Schema.OrderStatus.STATUS_FILLED,
      side: Schema.Side.SIDE_BUY,
      remaining: '0',
      price: '20000000',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
      createdAt: new Date(2020, 1, 1).toISOString(),
    }),
    generateOrder({
      id: '48DB6767E4E4E0F649C5A13ABFADE39F8451C27DA828DAF14B7A1E8E5EBDAD99',
      market: {
        __typename: 'Market',
        id: '5a4b0b9e9c0629f0315ec56fcb7bd444b0c6e4da5ec7677719d502626658a376',
      },
      size: '1',
      type: Schema.OrderType.TYPE_LIMIT,
      status: Schema.OrderStatus.STATUS_FILLED,
      side: Schema.Side.SIDE_BUY,
      remaining: '0',
      price: '100',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
      createdAt: new Date().toISOString(),
    }),
    generateOrder({
      id: '4e93702990712c41f6995fcbbd94f60bb372ad12d64dfa7d96d205c49f790336',
      market: {
        __typename: 'Market',
        id: 'c6f4337b31ed57a961969c3ba10297b369d01b9e75a4cbb96db4fc62886444e6',
      },
      size: '1',
      type: Schema.OrderType.TYPE_LIMIT,
      status: Schema.OrderStatus.STATUS_FILLED,
      side: Schema.Side.SIDE_BUY,
      remaining: '0',
      price: '20000',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
      createdAt: new Date(2022, 5, 10).toISOString(),
    }),
  ];
};

export const generateOrdersArray = (): StopOrder[] => {
  return [marketOrder, limitOrder, ...generateMockOrders()];
};
