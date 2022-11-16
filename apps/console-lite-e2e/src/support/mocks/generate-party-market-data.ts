import type { PartyMarketDataQuery } from '@vegaprotocol/deal-ticket';
import { Schema as Types } from '@vegaprotocol/types';

export const generatePartyMarketData = (): PartyMarketDataQuery => {
  return {
    party: {
      id: '2e1ef32e5804e14232406aebaad719087d326afa5c648b7824d0823d8a46c8d1',
      accountsConnection: {
        __typename: 'AccountsConnection',
        edges: [
          {
            __typename: 'AccountEdge',
            node: {
              type: Types.AccountType.ACCOUNT_TYPE_GENERAL,
              balance: '1200000',
              asset: { id: 'fBTC', decimals: 5, __typename: 'Asset' },
              market: null,
              __typename: 'AccountBalance',
            },
          },
          {
            __typename: 'AccountEdge',
            node: {
              __typename: 'AccountBalance',
              type: Types.AccountType.ACCOUNT_TYPE_GENERAL,
              balance: '0.000000001',
              asset: {
                __typename: 'Asset',
                id: '5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c',
                decimals: 0,
              },
            },
          },
        ],
      },
      marginsConnection: { edges: null, __typename: 'MarginConnection' },
      __typename: 'Party',
    },
  };
};
