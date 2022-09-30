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
            symbol: 'tEURO',
            decimals: 5,
          },
        },
        {
          __typename: 'Account',
          type: AccountType.ACCOUNT_TYPE_GENERAL,
          balance: '100000000',
          market: {
            id: 'market-1',
            tradableInstrument: {
              __typename: 'TradableInstrument',
              instrument: {
                __typename: 'Instrument',
                name: 'AAVEDAI Monthly (30 Jun 2022)',
              },
            },
            __typename: 'Market',
          },
          asset: {
            __typename: 'Asset',
            id: 'asset-id-2',
            symbol: 'tDAI',
            decimals: 5,
          },
        },
        {
          __typename: 'Account',
          type: AccountType.ACCOUNT_TYPE_MARGIN,
          balance: '1000',
          market: {
            __typename: 'Market',
            tradableInstrument: {
              __typename: 'TradableInstrument',
              instrument: {
                __typename: 'Instrument',
                name: '',
              },
            },
            id: 'market-2',
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
          type: AccountType.ACCOUNT_TYPE_MARGIN,
          balance: '1000',
          market: {
            __typename: 'Market',
            tradableInstrument: {
              __typename: 'TradableInstrument',
              instrument: {
                __typename: 'Instrument',
                name: '',
              },
            },
            id: 'market-0',
          },
          asset: {
            __typename: 'Asset',
            id: 'asset-id-2',
            symbol: 'tDAI',
            decimals: 5,
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
            symbol: 'AST0',
            decimals: 5,
          },
        },
      ],
    },
  };
  return merge(defaultAccounts, override);
};
