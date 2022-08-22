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
          type: AccountType.ACCOUNT_TYPE_GENERAL,
          balance: '100000000',
          market: null,
          asset: {
            __typename: 'Asset',
            id: 'asset-id',
            symbol: 'tEURO',
            decimals: 5,
          },
        },
      ],
    },
  };
  return merge(defaultAccounts, override);
};
