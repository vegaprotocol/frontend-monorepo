import { protoMarket } from './commons';

export const generateMarketNames = () => {
  return {
    markets: [
      { ...protoMarket },
      {
        id: '1d7ddf67dac4924db03f5bf58571a7bcb1908d70c66580467717aabc5345b68a',
        name: 'Apple Monthly (30 Jun 2022)',
        state: 'Suspended',
        tradableInstrument: {
          instrument: {
            code: 'AAPL.MF21',
            metadata: {
              tags: [
                'formerly:4899E01009F1A721',
                'quote:USD',
                'ticker:AAPL',
                'class:equities/single-stock-futures',
                'sector:tech',
                'listing_venue:NASDAQ',
                'country:US',
              ],
              __typename: 'InstrumentMetadata',
            },
            product: { quoteName: 'USD', __typename: 'Future' },
            __typename: 'Instrument',
          },
          __typename: 'TradableInstrument',
        },
        __typename: 'Market',
      },
      {
        id: '87ae87cd3244fc1fab4b0e2dad2437879864192bb969f3109b69293421644c8b',
        name: 'Tesla Quarterly (30 Jun 2022)',
        state: 'Suspended',
        tradableInstrument: {
          instrument: {
            code: 'TSLA.QM21',
            metadata: {
              tags: [
                'formerly:5A86B190C384997F',
                'quote:EURO',
                'ticker:TSLA',
                'class:equities/single-stock-futures',
                'sector:tech',
                'listing_venue:NASDAQ',
                'country:US',
              ],
              __typename: 'InstrumentMetadata',
            },
            product: { quoteName: 'EURO', __typename: 'Future' },
            __typename: 'Instrument',
          },
          __typename: 'TradableInstrument',
        },
        __typename: 'Market',
      },
      {
        id: '69205712a854f1bbfb69fa3d11b60e01a1e249bafb5ece88115e7451e8ef07b3',
        name: 'BTCUSD Monthly (30 Jun 2022)',
        state: 'Suspended',
        tradableInstrument: {
          instrument: {
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
            product: { quoteName: 'USD', __typename: 'Future' },
            __typename: 'Instrument',
          },
          __typename: 'TradableInstrument',
        },
        __typename: 'Market',
      },
      {
        id: 'a46bd7e5277087723b7ab835844dec3cef8b4445738101269624bf5537d5d423',
        name: 'ETHBTC Quarterly (30 Jun 2022)',
        state: 'Active',
        tradableInstrument: {
          instrument: {
            code: 'ETHBTC.QM21',
            metadata: {
              tags: [
                'formerly:1F0BB6EB5703B099',
                'base:ETH',
                'quote:BTC',
                'class:fx/crypto',
                'quarterly',
                'sector:crypto',
              ],
              __typename: 'InstrumentMetadata',
            },
            product: { quoteName: 'BTC', __typename: 'Future' },
            __typename: 'Instrument',
          },
          __typename: 'TradableInstrument',
        },
        __typename: 'Market',
      },
      {
        id: '3c62b2714c4332d1a689a5352bff090e6aabccfd6bd87ce018936b38372530c9',
        name: 'UNIDAI Monthly (30 Jun 2022)',
        state: 'Active',
        tradableInstrument: {
          instrument: {
            code: 'UNIDAI.MF21',
            metadata: {
              tags: [
                'formerly:3C58ED2A4A6C5D7E',
                'base:UNI',
                'quote:DAI',
                'class:fx/crypto',
                'monthly',
                'sector:defi',
              ],
              __typename: 'InstrumentMetadata',
            },
            product: { quoteName: 'DAI', __typename: 'Future' },
            __typename: 'Instrument',
          },
          __typename: 'TradableInstrument',
        },
        __typename: 'Market',
      },
    ],
  };
};
