import { Schema as Types } from '@vegaprotocol/types';

export const generatePartyMarketData = () => {
  return {
    party: {
      id: '2e1ef32e5804e14232406aebaad719087d326afa5c648b7824d0823d8a46c8d1',
      accounts: [
        {
          type: Types.AccountType.ACCOUNT_TYPE_GENERAL,
          balance: '1200000',
          asset: { id: 'fBTC', decimals: 5, __typename: 'Asset' },
          market: null,
          __typename: 'AccountBalance',
        },
        {
          __typename: 'AccountBalance',
          type: Types.AccountType.ACCOUNT_TYPE_GENERAL,
          balance: '0.000000001',
          asset: {
            __typename: 'Asset',
            id: '5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c',
            symbol: 'tUSD',
            name: 'usd',
            decimals: 0,
          },
        },
      ],
      marginsConnection: { edges: null, __typename: 'MarginConnection' },
      positionsConnection: { edges: null, __typename: 'PositionConnection' },
      __typename: 'Party',
    },
  };
};
