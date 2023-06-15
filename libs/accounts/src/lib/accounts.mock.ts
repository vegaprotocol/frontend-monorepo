import merge from 'lodash/merge';
import type {
  AccountEventsSubscription,
  AccountFieldsFragment,
  AccountsQuery,
} from './__generated__/Accounts';
import * as Schema from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';

export const accountsQuery = (
  override?: PartialDeep<AccountsQuery>
): AccountsQuery => {
  const defaultAccounts: AccountsQuery = {
    party: {
      __typename: 'Party',
      id: 'vega-0', //VEGA PUBLIC KEY
      accountsConnection: {
        __typename: 'AccountsConnection',
        edges: accountFields.map((node) => {
          return {
            __typename: 'AccountEdge',
            node,
          };
        }),
      },
    },
  };
  return merge(defaultAccounts, override);
};

export const accountFields: AccountFieldsFragment[] = [
  {
    __typename: 'AccountBalance',
    type: Schema.AccountType.ACCOUNT_TYPE_GENERAL,
    balance: '100000000',
    market: null,
    asset: {
      // tEURO
      __typename: 'Asset',
      id: 'asset-id',
    },
  },
  {
    __typename: 'AccountBalance',
    type: Schema.AccountType.ACCOUNT_TYPE_GENERAL,
    balance: '100000000',
    asset: {
      // tDAI
      __typename: 'Asset',
      id: 'asset-id-2',
    },
  },
  {
    __typename: 'AccountBalance',
    type: Schema.AccountType.ACCOUNT_TYPE_MARGIN,
    balance: '1000',
    market: {
      __typename: 'Market',
      id: 'market-2',
    },
    asset: {
      // tEURO
      __typename: 'Asset',
      id: 'asset-id',
    },
  },
  {
    __typename: 'AccountBalance',
    type: Schema.AccountType.ACCOUNT_TYPE_MARGIN,
    balance: '1000',
    market: {
      __typename: 'Market',
      id: 'market-0',
    },
    asset: {
      // AST0
      __typename: 'Asset',
      id: 'asset-0',
    },
  },
  {
    __typename: 'AccountBalance',
    type: Schema.AccountType.ACCOUNT_TYPE_MARGIN,
    balance: '100000',
    market: {
      __typename: 'Market',
      id: 'market-3',
    },
    asset: {
      // AST0
      __typename: 'Asset',
      id: 'asset-0',
    },
  },
  {
    __typename: 'AccountBalance',
    type: Schema.AccountType.ACCOUNT_TYPE_GENERAL,
    balance: '10000000',
    market: null,
    asset: {
      // AST0
      __typename: 'Asset',
      id: 'asset-0',
    },
  },
  // account to withdraw Sepolia tBTC
  {
    __typename: 'AccountBalance',
    type: Schema.AccountType.ACCOUNT_TYPE_GENERAL,
    balance: '100000001',
    market: null,
    asset: {
      // tBTC (sepolia)
      __typename: 'Asset',
      id: 'cee709223217281d7893b650850ae8ee8a18b7539b5658f9b4cc24de95dd18ad',
    },
  },
  {
    __typename: 'AccountBalance',
    type: Schema.AccountType.ACCOUNT_TYPE_GENERAL,
    balance: '100000002',
    market: null,
    asset: {
      // tBTC (test)
      __typename: 'Asset',
      id: '5cfa87844724df6069b94e4c8a6f03af21907d7bc251593d08e4251043ee9f7c',
    },
  },
];

export const accountEventsSubscription = (
  override?: PartialDeep<AccountEventsSubscription>
): AccountEventsSubscription => {
  const defaultResult = {
    __typename: 'Subscription',
    accounts: [
      {
        type: Schema.AccountType.ACCOUNT_TYPE_GENERAL,
        balance: '100000000',
        assetId: 'asset-id',
        marketId: null,
        partyId: 'vega-0',
      },
    ],
  };
  return merge(defaultResult, override);
};

export const amendGeneralAccountBalance = (
  accounts: AccountsQuery,
  marketId: string,
  balance: string
) => {
  if (accounts.party?.accountsConnection?.edges) {
    const marginAccount = accounts.party.accountsConnection.edges.find(
      (edge) => edge?.node.market?.id === marketId
    );
    if (marginAccount) {
      const generalAccount = accounts.party.accountsConnection.edges.find(
        (edge) =>
          edge?.node.asset.id === marginAccount.node.asset.id &&
          !edge?.node.market
      );
      if (generalAccount) {
        generalAccount.node.balance = balance;
      }
    }
  }
};
