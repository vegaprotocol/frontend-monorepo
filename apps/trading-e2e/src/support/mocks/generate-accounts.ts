import merge from 'lodash/merge';
import type { AccountsQuery, AssetsQuery } from '@vegaprotocol/accounts';
import { AccountType, Schema as Types } from '@vegaprotocol/types';
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
            id: 'market-1',
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
            id: 'market-2',
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
            id: 'market-0',
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

export const generateAssets = (override?: PartialDeep<AssetsQuery>) => {
  const defaultAssets: AssetsQuery = {
    assetsConnection: {
      edges: [
        {
          node: {
            id: 'asset-id',
            symbol: 'tEURO',
            decimals: 5,
            name: 'Euro',
            quantum: '',
            status: Types.AssetStatus.STATUS_ENABLED,
          },
        },
        {
          node: {
            id: 'asset-id-2',
            symbol: 'tDAI',
            decimals: 5,
            name: 'DAI',
            quantum: '',
            status: Types.AssetStatus.STATUS_ENABLED,
          },
        },
        {
          node: {
            id: 'asset-0',
            symbol: 'AST0',
            decimals: 5,
            name: 'Asto',
            quantum: '',
            status: Types.AssetStatus.STATUS_ENABLED,
          },
        },
      ],
    },
  };
  return merge(defaultAssets, override);
};
