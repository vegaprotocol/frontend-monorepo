import merge from 'lodash/merge';
import type { AccountsQuery } from '@vegaprotocol/accounts';
import * as Schema from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';

export const generateAccounts = (
  override?: PartialDeep<AccountsQuery>
): AccountsQuery => {
  const defaultAccounts: AccountsQuery = {
    party: {
      __typename: 'Party',
      id: Cypress.env('VEGA_PUBLIC_KEY'),
      accountsConnection: {
        __typename: 'AccountsConnection',
        edges: [
          {
            __typename: 'AccountEdge',
            node: {
              __typename: 'AccountBalance',
              type: Schema.AccountType.ACCOUNT_TYPE_GENERAL,
              balance: '100000000',
              market: null,
              asset: {
                __typename: 'Asset',
                id: 'asset-id',
              },
            },
          },
          {
            __typename: 'AccountEdge',
            node: {
              __typename: 'AccountBalance',
              type: Schema.AccountType.ACCOUNT_TYPE_GENERAL,
              balance: '100000000',
              market: {
                id: 'market-1',
                __typename: 'Market',
              },
              asset: {
                __typename: 'Asset',
                id: 'asset-id-2',
              },
            },
          },
          {
            __typename: 'AccountEdge',
            node: {
              __typename: 'AccountBalance',
              type: Schema.AccountType.ACCOUNT_TYPE_MARGIN,
              balance: '1000',
              market: {
                __typename: 'Market',
                id: 'market-2',
              },
              asset: {
                __typename: 'Asset',
                id: 'asset-id',
              },
            },
          },
          {
            __typename: 'AccountEdge',
            node: {
              __typename: 'AccountBalance',
              type: Schema.AccountType.ACCOUNT_TYPE_MARGIN,
              balance: '1000',
              market: {
                __typename: 'Market',
                id: 'market-0',
              },
              asset: {
                __typename: 'Asset',
                id: 'asset-id-2',
              },
            },
          },
          {
            __typename: 'AccountEdge',
            node: {
              __typename: 'AccountBalance',
              type: Schema.AccountType.ACCOUNT_TYPE_GENERAL,
              balance: '100000000',
              market: null,
              asset: {
                __typename: 'Asset',
                id: 'asset-0',
              },
            },
          },
          // account to withdraw Sepolia tBTC
          {
            __typename: 'AccountEdge',
            node: {
              __typename: 'AccountBalance',
              type: Schema.AccountType.ACCOUNT_TYPE_GENERAL,
              balance: '100000000',
              market: null,
              asset: {
                __typename: 'Asset',
                id: 'cee709223217281d7893b650850ae8ee8a18b7539b5658f9b4cc24de95dd18ad',
              },
            },
          },
          {
            __typename: 'AccountEdge',
            node: {
              __typename: 'AccountBalance',
              type: Schema.AccountType.ACCOUNT_TYPE_GENERAL,
              balance: '100000000',
              market: null,
              asset: {
                __typename: 'Asset',
                id: '5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c',
              },
            },
          },
        ],
      },
    },
  };
  return merge(defaultAccounts, override);
};
