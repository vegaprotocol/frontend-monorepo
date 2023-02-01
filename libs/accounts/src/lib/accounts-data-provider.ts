import { assetsProvider } from '@vegaprotocol/assets';
import { marketsProvider } from '@vegaprotocol/market-list';
import {
  makeDataProvider,
  makeDerivedDataProvider,
  removePaginationWrapper,
} from '@vegaprotocol/react-helpers';
import * as Schema from '@vegaprotocol/types';
import produce from 'immer';

import {
  AccountEventsDocument,
  AccountsDocument,
} from './__generated__/Accounts';

import type { IterableElement } from 'type-fest';
import type {
  AccountFieldsFragment,
  AccountsQuery,
  AccountEventsSubscription,
} from './__generated__/Accounts';
import type { Market } from '@vegaprotocol/market-list';
import type { Asset } from '@vegaprotocol/assets';

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

export type Account = Omit<AccountFieldsFragment, 'market' | 'asset'> & {
  market?: Market | null;
  asset: Asset;
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
  AccountEventsSubscription['accounts']
>({
  query: AccountsDocument,
  subscriptionQuery: AccountEventsDocument,
  update,
  getData,
  getDelta,
});

export interface AccountFields extends Account {
  available: string;
  used: string;
  deposited: string;
  balance: string;
  breakdown?: AccountFields[];
}

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
    deposited: (available + used).toString(),
  };

  const breakdown = accounts
    .filter((a) => USE_ACCOUNT_TYPES.includes(a.type))
    .map((a) => ({
      ...a,
      asset: accounts[0].asset,
      deposited: balanceAccount.deposited,
      available: balanceAccount.available,
      used: a.balance,
    }))
    .filter((a) => a.used !== '0');
  return { ...balanceAccount, breakdown };
};

export const accountsDataProvider = makeDerivedDataProvider<Account[], never>(
  [accountsOnlyDataProvider, marketsProvider, assetsProvider],
  ([accounts, markets, assets]): Account[] | null => {
    return accounts
      ? accounts
          .map((account: AccountFieldsFragment) => {
            const market = markets.find(
              (market: Market) => market.id === account.market?.id
            );
            const asset = assets.find(
              (asset: Asset) => asset.id === account.asset?.id
            );
            if (asset) {
              return {
                ...account,
                partyId: account.party?.id,
                asset: {
                  ...asset,
                },
                market: market
                  ? {
                      ...market,
                    }
                  : null,
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
  never
>(
  [accountsDataProvider],
  (parts) => parts[0] && getAccountData(parts[0] as Account[])
);
