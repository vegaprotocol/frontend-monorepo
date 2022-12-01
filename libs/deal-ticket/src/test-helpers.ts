import type { MarketDealTicket } from '@vegaprotocol/market-list';
import { Schema } from '@vegaprotocol/types';
import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';

export function generateMarket(
  override?: PartialDeep<MarketDealTicket>
): MarketDealTicket {
  const defaultMarket: MarketDealTicket = {
    __typename: 'Market',
    id: 'market-id',
    decimalPlaces: 2,
    positionDecimalPlaces: 1,
    tradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
    state: Schema.MarketState.STATE_ACTIVE,
    tradableInstrument: {
      __typename: 'TradableInstrument',
      instrument: {
        __typename: 'Instrument',
        id: '1',
        name: 'Instrument name',
        code: 'instrument-code',
        metadata: {
          __typename: 'InstrumentMetadata',
          tags: [],
        },
        product: {
          __typename: 'Future',
          quoteName: 'quote-name',
          dataSourceSpecForTradingTermination: {
            id: 'data-source-for-trading-termination-id',
          },
          settlementAsset: {
            __typename: 'Asset',
            id: 'asset-id',
            name: 'asset-name',
            symbol: 'asset-symbol',
            decimals: 2,
          },
        },
      },
    },
    data: {
      __typename: 'MarketData',
      market: {
        __typename: 'Market',
        id: 'market-id',
      },
      bestBidPrice: '100',
      bestOfferPrice: '100',
      markPrice: '200',
      trigger: Schema.AuctionTrigger.AUCTION_TRIGGER_BATCH,
      staticMidPrice: '100',
      marketTradingMode: Schema.MarketTradingMode.TRADING_MODE_CONTINUOUS,
      marketState: Schema.MarketState.STATE_ACTIVE,
      indicativePrice: '100',
      indicativeVolume: '10',
      bestStaticBidPrice: '100',
      bestStaticOfferPrice: '100',
    },
    marketTimestamps: {
      __typename: 'MarketTimestamps',
      open: null,
      close: null,
    },
    fees: {
      factors: {
        makerFee: '0.001',
        infrastructureFee: '0.002',
        liquidityFee: '0.003',
      },
    },
    depth: {
      __typename: 'MarketDepth',
      lastTrade: {
        __typename: 'Trade',
        price: '100',
      },
    },
  };

  return merge(defaultMarket, override);
}
