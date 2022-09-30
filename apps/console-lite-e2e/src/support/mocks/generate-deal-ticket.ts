export const generateDealTicket = () => {
  return {
    market: {
      id: 'ca7768f6de84bf86a21bbb6b0109d9659c81917b0e0339b2c262566c9b581a15',
      decimalPlaces: 5,
      positionDecimalPlaces: 0,
      state: 'STATE_ACTIVE',
      tradingMode: 'Continuous',
      tradableInstrument: {
        instrument: {
          name: 'AAVEDAI Monthly (30 Jun 2022)',
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
