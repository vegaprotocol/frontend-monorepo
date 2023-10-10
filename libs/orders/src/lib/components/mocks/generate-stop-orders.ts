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
      liquidityMonitoringParameters: {
        triggeringRatio: '0.7',
      },
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
          name: 'XYZ instrument',
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
