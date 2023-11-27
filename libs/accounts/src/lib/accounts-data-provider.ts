import { assetsMapProvider } from '@vegaprotocol/assets';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import { marketsMapProvider } from '@vegaprotocol/markets';
import {
  makeDataProvider,
  makeDerivedDataProvider,
  useDataProvider,
} from '@vegaprotocol/data-provider';
import * as Schema from '@vegaprotocol/types';
import { type Market } from '@vegaprotocol/markets';
import produce from 'immer';
import { type IterableElement } from 'type-fest';
import {
  AccountEventsDocument,
  AccountsDocument,
  AccountFieldsFragment,
  AccountsQuery,
  AccountEventsSubscription,
  AccountsQueryVariables,
} from './__generated__/Accounts';
import { type Asset } from '@vegaprotocol/assets';

const AccountType = Schema.AccountType;

function isAccount(
  account:
    | AccountFieldsFragment
    | IterableElement<AccountEventsSubscription['accounts']>
): account is AccountFieldsFragment {
  return (
    (account as AccountFieldsFragment).__typename === 'AccountBalance' ||
    Boolean((account as AccountFieldsFragment).asset?.id)
  );
}

export const getId = (
  account:
    | AccountFieldsFragment
    | IterableElement<AccountEventsSubscription['accounts']>
) =>
  isAccount(account)
    ? `${account.type}-${account.asset.id}-${account.market?.id || 'null'}`
    : `${account.type}-${account.assetId}-${account.marketId || 'null'}`;

export type Account = Omit<AccountFieldsFragment, 'asset' | 'market'> & {
  asset: Asset;
  market?: Market | null;
};

const update = (
  data: AccountFieldsFragment[] | null,
  deltas: AccountEventsSubscription['accounts']
) => {
  return produce(data || [], (draft) => {
    deltas.forEach((delta) => {
      const id = getId(delta);
      const index = draft.findIndex((a) => getId(a) === id);
      if (index !== -1) {
        draft[index].balance = delta.balance;
      } else {
        draft.unshift({
          __typename: 'AccountBalance',
          type: delta.type,
          balance: delta.balance,
          market: delta.marketId ? { id: delta.marketId } : null,
          asset: { id: delta.assetId },
          party: { id: delta.partyId },
        });
      }
    });
  });
};

const getData = (responseData: AccountsQuery | null): AccountFieldsFragment[] =>
  removePaginationWrapper(responseData?.party?.accountsConnection?.edges) || [];
const getDelta = (
  subscriptionData: AccountEventsSubscription
): AccountEventsSubscription['accounts'] => {
  return subscriptionData.accounts;
};

export const accountsOnlyDataProvider = makeDataProvider<
  AccountsQuery,
  AccountFieldsFragment[],
  AccountEventsSubscription,
  AccountEventsSubscription['accounts'],
  AccountsQueryVariables
>({
  query: AccountsDocument,
  subscriptionQuery: AccountEventsDocument,
  update,
  getData,
  getDelta,
  fetchPolicy: 'no-cache',
});

export interface AccountFields extends Account {
  available: string;
  used: string;
  total: string;
  balance: string;
  breakdown?: AccountFields[];
}

// The total balance of these accounts will be used for the 'used' column in the
// collateral table
const USE_ACCOUNT_TYPES = [
  AccountType.ACCOUNT_TYPE_MARGIN,
  AccountType.ACCOUNT_TYPE_BOND,
  AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
  AccountType.ACCOUNT_TYPE_FEES_LIQUIDITY,
  AccountType.ACCOUNT_TYPE_FEES_MAKER,
  AccountType.ACCOUNT_TYPE_PENDING_TRANSFERS,
];

const getAssetIds = (data: Account[]) =>
  Array.from(new Set(data.map((a) => a.asset.id))).sort();

const getTotalBalance = (accounts: AccountFieldsFragment[]) =>
  accounts.reduce((acc, a) => acc + BigInt(a.balance), BigInt(0));

export const getAccountData = (data: Account[]): AccountFields[] => {
  return getAssetIds(data).map((assetId) => {
    const accounts = data.filter((a) => a.asset.id === assetId);
    return accounts && getAssetAccountAggregation(accounts, assetId);
  });
};

const getAssetAccountAggregation = (
  accountList: Account[],
  assetId: string
): AccountFields => {
  const accounts = accountList.filter((a) => a.asset.id === assetId);
  const available = getTotalBalance(
    accounts.filter((a) => a.type === AccountType.ACCOUNT_TYPE_GENERAL)
  );

  const used = getTotalBalance(
    accounts.filter((a) => USE_ACCOUNT_TYPES.includes(a.type))
  );

  const balanceAccount: AccountFields = {
    asset: accounts[0].asset,
    balance: available.toString(),
    type: AccountType.ACCOUNT_TYPE_GENERAL,
    available: available.toString(),
    used: used.toString(),
    total: (available + used).toString(),
  };

  const breakdown = accounts
    .map((a) => ({
      ...a,
      asset: accounts[0].asset,
      total: balanceAccount.total,
      available: balanceAccount.available,
      used: a.balance,
    }))
    .filter((a) => a.used !== '0');
  return { ...balanceAccount, breakdown };
};

export const accountsDataProvider = makeDerivedDataProvider<
  Account[],
  never,
  AccountsQueryVariables
>(
  [
    accountsOnlyDataProvider,
    (callback, client) => marketsMapProvider(callback, client, undefined),
    (callback, client) => assetsMapProvider(callback, client, undefined),
  ],
  ([accounts, markets, assets]): Account[] | null => {
    return accounts
      ? accounts
          .map((account: AccountFieldsFragment) => {
            const asset = (assets as Record<string, Asset>)[account.asset.id];
            const market =
              account.market?.id &&
              (markets as Record<string, Asset>)[account.market?.id];
            if (asset) {
              return {
                ...account,
                asset,
                market,
              };
            }
            return null;
          })
          .filter((account: Account | null) => Boolean(account))
      : null;
  }
);

export const aggregatedAccountsDataProvider = makeDerivedDataProvider<
  AccountFields[],
  never,
  AccountsQueryVariables
>(
  [accountsDataProvider],
  (parts) => parts[0] && getAccountData(parts[0] as Account[])
);

export const aggregatedAccountDataProvider = makeDerivedDataProvider<
  AccountFields,
  never,
  AccountsQueryVariables & { assetId: string }
>(
  [
    (callback, client, { partyId }) =>
      aggregatedAccountsDataProvider(callback, client, { partyId }),
  ],
  (parts, { assetId }) =>
    (parts[0] as AccountFields[]).find(
      (account) => account.asset.id === assetId
    ) || null
);

export const useAccounts = (partyId: string | null) => {
  return useDataProvider({
    dataProvider: accountsDataProvider,
    variables: {
      partyId: partyId || '',
    },
    skip: !partyId,
  });
};
