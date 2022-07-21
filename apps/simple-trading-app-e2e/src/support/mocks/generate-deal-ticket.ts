export const generateDealTicket = () => {
  return {
    market: {
      id: 'first-btcusd-id',
      name: 'AAVEDAI Monthly (30 Jun 2022)',
      decimalPlaces: 5,
      positionDecimalPlaces: 0,
      state: 'Active',
      tradingMode: 'Continuous',
      tradableInstrument: {
        instrument: {
          product: {
            quoteName: 'DAI',
            settlementAsset: {
              id: '6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61',
              symbol: 'tDAI',
              name: 'tDAI TEST',
              __typename: 'Asset',
            },
            __typename: 'Future',
          },
          __typename: 'Instrument',
        },
        __typename: 'TradableInstrument',
      },
      depth: {
        lastTrade: { price: '9893006', __typename: 'Trade' },
        __typename: 'MarketDepth',
      },
      __typename: 'Market',
    },
  };
};
