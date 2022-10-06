import merge from 'lodash/merge';
import type { AccountsQuery } from '@vegaprotocol/accounts';
import { AccountType } from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';

export const generateAccounts = (
  override?: PartialDeep<AccountsQuery>
): AccountsQuery => {
  const defaultAccounts: AccountsQuery = {
    party: {
      __typename: 'Party',
      id: Cypress.env('VEGA_PUBLIC_KEY'),
      accounts: [
        {
          __typename: 'Account',
          type: AccountType.ACCOUNT_TYPE_GENERAL,
          balance: '100000000',
          market: null,
          asset: {
            __typename: 'Asset',
            id: 'asset-id',
          },
        },
        {
          __typename: 'Account',
          type: AccountType.ACCOUNT_TYPE_GENERAL,
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
        {
          __typename: 'Account',
          type: AccountType.ACCOUNT_TYPE_MARGIN,
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
        {
          __typename: 'Account',
          type: AccountType.ACCOUNT_TYPE_MARGIN,
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
        {
          __typename: 'Account',
          type: AccountType.ACCOUNT_TYPE_GENERAL,
          balance: '100000000',
          market: null,
          asset: {
            __typename: 'Asset',
            id: 'asset-0',
          },
        },
      ],
    },
  };
  return merge(defaultAccounts, override);
};
