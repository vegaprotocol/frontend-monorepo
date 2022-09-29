export const generateMarketPositions = () => {
  return {
    party: {
      id: '2e1ef32e5804e14232406aebaad719087d326afa5c648b7824d0823d8a46c8d1',
      accounts: [
        {
          type: 'General',
          asset: {
            decimals: 5,
          },
          balance: '400000000000000000000',
          market: {
            id: '2751c508f9759761f912890f37fb3f97a00300bf7685c02a56a86e05facfe221',
            __typename: 'Market',
          },
        },
        {
          type: 'Margin',
          asset: {
            decimals: 5,
          },
          balance: '265329',
          market: {
            id: 'ca7768f6de84bf86a21bbb6b0109d9659c81917b0e0339b2c262566c9b581a15',
            __typename: 'Market',
          },
        },
      ],
      positionsConnection: {
        edges: [
          {
            node: {
              openVolume: '3',
              market: {
                id: '2751c508f9759761f912890f37fb3f97a00300bf7685c02a56a86e05facfe221',
                __typename: 'Market',
              },
              __typename: 'Position',
            },
            __typename: 'PositionEdge',
          },
          {
            node: {
              openVolume: '12',
              market: {
                id: 'ca7768f6de84bf86a21bbb6b0109d9659c81917b0e0339b2c262566c9b581a15',
                __typename: 'Market',
              },
              __typename: 'Position',
            },
            __typename: 'PositionEdge',
          },
        ],
        __typename: 'PositionConnection',
      },
      __typename: 'Party',
    },
  };
};
