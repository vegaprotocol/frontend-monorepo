import merge from 'lodash/merge';
import type { AccountsQuery } from '@vegaprotocol/accounts';
import * as Types from '@vegaprotocol/types';
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
              type: Types.AccountType.ACCOUNT_TYPE_GENERAL,
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
              type: Types.AccountType.ACCOUNT_TYPE_GENERAL,
              balance: '100000000',
              market: {
                id: '0604e8c918655474525e1a95367902266ade70d318c2c908f0cca6e3d11dcb13',
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
              type: Types.AccountType.ACCOUNT_TYPE_MARGIN,
              balance: '1000',
              market: {
                __typename: 'Market',
                id: '5a4b0b9e9c0629f0315ec56fcb7bd444b0c6e4da5ec7677719d502626658a376',
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
              type: Types.AccountType.ACCOUNT_TYPE_MARGIN,
              balance: '1000',
              market: {
                __typename: 'Market',
                id: 'c9f5acd348796011c075077e4d58d9b7f1689b7c1c8e030a5e886b83aa96923d',
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
              type: Types.AccountType.ACCOUNT_TYPE_MARGIN,
              asset: {
                __typename: 'Asset',
                id: 'asset-id-2',
              },
              balance: '265329',
              market: {
                id: '57fbaa322e97cfc8bb5f1de048c37e033c41b1ac1906d3aed9960912a067ef5a',
                __typename: 'Market',
              },
            },
          },
          {
            __typename: 'AccountEdge',
            node: {
              __typename: 'AccountBalance',
              type: Types.AccountType.ACCOUNT_TYPE_GENERAL,
              balance: '100000000',
              market: null,
              asset: {
                __typename: 'Asset',
                id: 'asset-0',
              },
            },
          },
        ],
      },
    },
  };
  return merge(defaultAccounts, override);
};
