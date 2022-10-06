import produce from 'immer';
import type { IterableElement } from 'type-fest';
import {
  AccountsDocument,
  AccountEventsDocument,
} from './__generated___/Accounts';
import type {
  AccountFieldsFragment,
  AccountsQuery,
  AccountEventsSubscription,
} from './__generated___/Accounts';
import {
  makeDataProvider,
  makeDerivedDataProvider,
} from '@vegaprotocol/react-helpers';
import { AccountType } from '@vegaprotocol/types';
import type { Market } from '@vegaprotocol/market-list';
import { marketsProvider } from '@vegaprotocol/market-list';
import type { AssetsFieldsFragment } from '@vegaprotocol/assets';
import { assetsProvider } from '@vegaprotocol/assets';

function isAccount(
  account:
    | AccountFieldsFragment
    | IterableElement<AccountEventsSubscription['accounts']>
): account is AccountFieldsFragment {
  return (
    (account as AccountFieldsFragment).__typename === 'Account' ||
    Boolean((account as AccountFieldsFragment).asset?.id)
  );
}

export const getId = (
  account:
    | AccountFieldsFragment
    | IterableElement<AccountEventsSubscription['accounts']>
) =>
  isAccount(account)
    ? `${account.type}-${account.asset.id}-${account.market?.id ?? 'null'}`
    : `${account.type}-${account.assetId}-${account.marketId || 'null'}`;

export type Account = Omit<AccountFieldsFragment, 'market' | 'asset'> & {
  market?: Market | null;
  asset: AssetsFieldsFragment;
};

const update = (
  data: AccountFieldsFragment[],
  deltas: AccountEventsSubscription['accounts']
) => {
  return produce(data, (draft) => {
    deltas.forEach((delta) => {
      const id = getId(delta);
      const index = draft.findIndex((a) => getId(a) === id);
      if (index !== -1) {
        draft[index].balance = delta.balance;
      } else {
        draft.unshift({
          __typename: 'Account',
          type: delta.type,
          balance: delta.balance,
          market: delta.marketId ? { id: delta.marketId } : null,
          asset: { id: delta.assetId },
        });
      }
    });
  });
};

const getData = (
  responseData: AccountsQuery
): AccountFieldsFragment[] | null => {
  return responseData.party?.accounts ?? null;
};

const getDelta = (
  subscriptionData: AccountEventsSubscription
): AccountEventsSubscription['accounts'] => subscriptionData.accounts;

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
  return getAssetIds(data)
    .map((assetId) => {
      const accounts = data.filter((a) => a.asset.id === assetId);
      return accounts && getAssetAccountAggregation(accounts, assetId);
    })
    .filter((a) => a.deposited !== '0'); // filter empty accounts
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
              (asset: AssetsFieldsFragment) => asset.id === account.asset?.id
            );
            if (asset) {
              return {
                ...account,
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
