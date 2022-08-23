export const generateMarketTags = () => {
  return {
    market: {
      tradableInstrument: {
        instrument: {
          metadata: {
            tags: [
              'formerly:2839D9B2329C9E70',
              'base:AAVE',
              'quote:DAI',
              'class:fx/crypto',
              'monthly',
              'sector:defi',
              'settlement:2022-08-01',
            ],
            __typename: 'InstrumentMetadata',
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      __typename: 'Market',
    },
  };
};
