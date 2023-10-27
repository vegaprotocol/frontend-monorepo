import type { Market, StaticMarketData } from '@vegaprotocol/markets';
import * as Schema from '@vegaprotocol/types';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

export function generateMarket(override?: PartialDeep<Market>): Market {
  const defaultMarket: Market = {
    __typename: 'Market',
    id: 'market-id',
    decimalPlaces: 2,
    positionDecimalPlaces: 1,
    tradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
    state: Schema.MarketState.STATE_ACTIVE,
    liquidityMonitoringParameters: {
      triggeringRatio: '1',
    },
    marketTimestamps: {
      __typename: 'MarketTimestamps',
      close: '',
      open: '',
    },
    tradableInstrument: {
      __typename: 'TradableInstrument',
      instrument: {
        id: '',
        code: 'BTCUSD.MF21',
        name: 'ACTIVE MARKET',
        metadata: {
          __typename: 'InstrumentMetadata',
          tags: [],
        },
        product: {
          __typename: 'Future',
          settlementAsset: {
            id: 'asset-0',
            symbol: 'tDAI',
            name: 'tDAI',
            decimals: 5,
            quantum: '1',
            __typename: 'Asset',
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
          quoteName: 'BTC',
        },
        __typename: 'Instrument',
      },
    },

    fees: {
      factors: {
        makerFee: '0.001',
        infrastructureFee: '0.002',
        liquidityFee: '0.003',
      },
    },
  };
  return merge(defaultMarket, override);
}

export function generateMarketData(
  override?: PartialDeep<StaticMarketData>
): StaticMarketData {
  const defaultMarketData: StaticMarketData = {
    auctionEnd: '2022-06-21T17:18:43.484055236Z',
    auctionStart: '2022-06-21T17:18:43.484055236Z',
    indicativePrice: '100',
    indicativeVolume: '10',
    marketState: Schema.MarketState.STATE_ACTIVE,
    marketTradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
    suppliedStake: '1000',
    targetStake: '1000000',
    trigger: Schema.AuctionTrigger.AUCTION_TRIGGER_BATCH,
  };
  return merge(defaultMarketData, override);
}
