import merge from 'lodash/merge';
import type { PartialDeep } from 'type-fest';
import type { MarketList, MarketList_markets } from '@vegaprotocol/market-list';

export const generateMarketList = (
  override?: PartialDeep<MarketList>
): MarketList => {
  const markets: MarketList_markets[] = [
    {
      id: 'market-id',
      decimalPlaces: 5,
      data: {
        market: {
          id: '10cd0a793ad2887b340940337fa6d97a212e0e517fe8e9eab2b5ef3a38633f35',
          __typename: 'Market',
        },
        markPrice: '4612690058',
        __typename: 'MarketData',
      },
      tradableInstrument: {
        instrument: {
          name: 'BTC/USD Monthly',
          code: 'BTCUSD.MF21',
          metadata: {
            __typename: 'InstrumentMetadata',
            tags: ['tag1'],
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        open: '',
        close: '',
      },
      candles: [{ __typename: 'Candle', open: '100', close: '100' }],
      __typename: 'Market',
    },
    {
      id: 'test-market-suspended',
      decimalPlaces: 2,
      data: {
        market: {
          id: '34d95e10faa00c21d19d382d6d7e6fc9722a96985369f0caec041b0f44b775ed',
          __typename: 'Market',
        },
        markPrice: '8441',
        __typename: 'MarketData',
      },
      tradableInstrument: {
        instrument: {
          name: 'SOL/USD',
          code: 'SOLUSD',
          metadata: {
            __typename: 'InstrumentMetadata',
            tags: ['tag1'],
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        open: '',
        close: '',
      },
      candles: [{ __typename: 'Candle', open: '100', close: '100' }],
      __typename: 'Market',
    },
  ];
  const defaultResult = {
    markets,
  };

  return merge(defaultResult, override);
};
