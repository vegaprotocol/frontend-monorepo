import merge from 'lodash/merge';
import type { Accounts } from '@vegaprotocol/accounts';
import { AccountType } from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';

export const generateAccounts = (
  override?: PartialDeep<Accounts>
): Accounts => {
  const defaultAccounts: Accounts = {
    party: {
      __typename: 'Party',
      id: Cypress.env('VEGA_PUBLIC_KEY'),
      accounts: [
        {
          __typename: 'Account',
          type: AccountType.General,
          balance: '100000000',
          market: null,
          asset: {
            __typename: 'Asset',
            id: 'asset-id',
            symbol: 'tEURO',
            decimals: 5,
          },
        },
        {
          __typename: 'Account',
          type: AccountType.General,
          balance: '100000000',
          market: null,
          asset: {
            __typename: 'Asset',
            id: 'asset-id-2',
            symbol: 'tDAI',
            decimals: 5,
          },
        },
        {
          __typename: 'Account',
          type: AccountType.Margin,
          balance: '1000',
          market: {
            __typename: 'Market',
            name: '',
            id: '5a4b0b9e9c0629f0315ec56fcb7bd444b0c6e4da5ec7677719d502626658a376',
          },
          asset: {
            __typename: 'Asset',
            id: 'asset-id',
            symbol: 'tEURO',
            decimals: 5,
          },
        },
        {
          __typename: 'Account',
          type: AccountType.Margin,
          balance: '1000',
          market: {
            __typename: 'Market',
            name: '',
            id: 'c9f5acd348796011c075077e4d58d9b7f1689b7c1c8e030a5e886b83aa96923d',
          },
          asset: {
            __typename: 'Asset',
            id: 'asset-id-2',
            symbol: 'tDAI',
            decimals: 5,
          },
        },
      ],
    },
  };
  return merge(defaultAccounts, override);
};
