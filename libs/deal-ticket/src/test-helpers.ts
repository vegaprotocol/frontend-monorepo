import type { Market, MarketData } from '@vegaprotocol/markets';
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
          __typename: 'Future',
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
  override?: PartialDeep<MarketData>
): MarketData {
  const defaultMarketData: MarketData = {
    __typename: 'MarketData',
    market: {
      id: 'market-id',
      __typename: 'Market',
    },
    auctionEnd: '2022-06-21T17:18:43.484055236Z',
    auctionStart: '2022-06-21T17:18:43.484055236Z',
    bestBidPrice: '0',
    bestBidVolume: '0',
    bestOfferPrice: '0',
    bestOfferVolume: '0',
    bestStaticBidPrice: '0',
    bestStaticBidVolume: '0',
    bestStaticOfferPrice: '0',
    bestStaticOfferVolume: '0',
    indicativePrice: '100',
    indicativeVolume: '10',
    marketState: Schema.MarketState.STATE_ACTIVE,
    marketTradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
    marketValueProxy: '',
    markPrice: '200',
    midPrice: '0',
    openInterest: '',
    staticMidPrice: '0',
    suppliedStake: '1000',
    targetStake: '1000000',
    trigger: Schema.AuctionTrigger.AUCTION_TRIGGER_BATCH,
  };
  return merge(defaultMarketData, override);
}
