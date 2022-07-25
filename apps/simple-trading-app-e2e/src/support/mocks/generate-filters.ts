export const generateFilters = () => {
  return {
    markets: [
      {
        tradableInstrument: {
          instrument: {
            product: {
              __typename: 'Future',
              settlementAsset: { symbol: 'fDAI', __typename: 'Asset' },
            },
            __typename: 'Instrument',
          },
          __typename: 'TradableInstrument',
        },
        __typename: 'Market',
      },
      {
        tradableInstrument: {
          instrument: {
            product: {
              __typename: 'Future',
              settlementAsset: { symbol: 'fBTC', __typename: 'Asset' },
            },
            __typename: 'Instrument',
          },
          __typename: 'TradableInstrument',
        },
        __typename: 'Market',
      },
      {
        tradableInstrument: {
          instrument: {
            product: {
              __typename: 'Future',
              settlementAsset: { symbol: 'fDAI', __typename: 'Asset' },
            },
            __typename: 'Instrument',
          },
          __typename: 'TradableInstrument',
        },
        __typename: 'Market',
      },
      {
        tradableInstrument: {
          instrument: {
            product: {
              __typename: 'Future',
              settlementAsset: { symbol: 'fDAI', __typename: 'Asset' },
            },
            __typename: 'Instrument',
          },
          __typename: 'TradableInstrument',
        },
        __typename: 'Market',
      },
      {
        tradableInstrument: {
          instrument: {
            product: {
              __typename: 'Future',
              settlementAsset: { symbol: 'fUSDC', __typename: 'Asset' },
            },
            __typename: 'Instrument',
          },
          __typename: 'TradableInstrument',
        },
        __typename: 'Market',
      },
      {
        tradableInstrument: {
          instrument: {
            product: {
              __typename: 'Future',
              settlementAsset: { symbol: 'fEURO', __typename: 'Asset' },
            },
            __typename: 'Instrument',
          },
          __typename: 'TradableInstrument',
        },
        __typename: 'Market',
      },
    ],
  };
};
