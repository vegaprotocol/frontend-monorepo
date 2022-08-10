export const generatePartyMarketData = () => {
  return {
    party: {
      id: '2e1ef32e5804e14232406aebaad719087d326afa5c648b7824d0823d8a46c8d1',
      accounts: [
        {
          type: 'General',
          balance: '1200000',
          asset: { id: 'fBTC', decimals: 5, __typename: 'Asset' },
          market: null,
          __typename: 'Account',
        },
      ],
      marginsConnection: { edges: null, __typename: 'MarginConnection' },
      positionsConnection: { edges: null, __typename: 'PositionConnection' },
      __typename: 'Party',
    },
  };
};
