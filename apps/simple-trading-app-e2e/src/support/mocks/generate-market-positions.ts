export const generateMarketPositions = () => {
  return {
    party: {
      id: '2e1ef32e5804e14232406aebaad719087d326afa5c648b7824d0823d8a46c8d1',
      positionsConnection: {
        edges: [
          {
            node: {
              openVolume: '3',
              market: {
                id: '2751c508f9759761f912890f37fb3f97a00300bf7685c02a56a86e05facfe221',
                accounts: [
                  { balance: '0', __typename: 'Account' },
                  { balance: '0', __typename: 'Account' },
                ],
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
                id: 'first-btcusd-id',
                accounts: [
                  { balance: '10222', __typename: 'Account' },
                  { balance: '255107', __typename: 'Account' },
                ],
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
