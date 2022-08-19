import merge from 'lodash/merge';
import {
  AuctionTrigger,
  MarketState,
  MarketTradingMode,
} from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import type { Market } from '../../../../trading/pages/markets/__generated__/Market';

export const generateMarket = (override?: PartialDeep<Market>): Market => {
  const defaultResult: Market = {
    market: {
      id: 'market-0',
      name: 'ACTIVE MARKET',
      tradingMode: MarketTradingMode.MonitoringAuction,
      state: MarketState.Active,
      decimalPlaces: 5,
      positionDecimalPlaces: 0,
      data: {
        market: {
          id: '10cd0a793ad2887b340940337fa6d97a212e0e517fe8e9eab2b5ef3a38633f35',
          __typename: 'Market',
        },
        auctionStart: '2022-08-12T11:13:47.611014117Z',
        auctionEnd: '2022-08-16T09:08:23.611014117Z',
        markPrice: '13739109',
        indicativeVolume: '2316',
        indicativePrice: '88470230',
        suppliedStake: '79481836527',
        targetStake: '97284519014',
        bestBidVolume: '244',
        bestOfferVolume: '100',
        bestStaticBidVolume: '482',
        bestStaticOfferVolume: '2188',
        trigger: AuctionTrigger.Liquidity,
        __typename: 'MarketData',
      },
      tradableInstrument: {
        instrument: {
          name: 'BTCUSD Monthly',
          code: 'BTCUSD.MF21',
          metadata: {
            tags: [
              'formerly:076BB86A5AA41E3E',
              'base:BTC',
              'quote:USD',
              'class:fx/crypto',
              'monthly',
              'sector:crypto',
            ],
            __typename: 'InstrumentMetadata',
          },
          product: {
            quoteName: 'BTCUSD Monthly',
            settlementAsset: {
              id: '000',
              symbol: 'USD',
              name: 'United States Dollar',
              __typename: 'Asset',
            },
            __typename: 'Future',
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      marketTimestamps: {
        open: '2022-06-21T17:18:43.484055236Z',
        close: null,
        __typename: 'MarketTimestamps',
      },
      candles: [
        {
          open: '2095312844',
          close: '2090090607',
          volume: '4847',
          __typename: 'Candle',
        },
        {
          open: '2090090000',
          close: '2090090607',
          volume: '4847',
          __typename: 'Candle',
        },
      ],
      __typename: 'Market',
    },
  };

  return merge(defaultResult, override);
};
