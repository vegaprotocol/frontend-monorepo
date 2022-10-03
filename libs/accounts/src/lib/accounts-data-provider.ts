import produce from 'immer';
import type { IterableElement } from 'type-fest';
import {
  AccountsDocument,
  AccountEventsDocument,
} from './__generated__/Accounts';
import type {
  AccountFieldsFragment,
  AccountsQuery,
  AccountEventsSubscription,
} from './__generated__/Accounts';
import {
  makeDataProvider,
  makeDerivedDataProvider,
} from '@vegaprotocol/react-helpers';
import { Schema } from '@vegaprotocol/types';

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
    : `${account.type}-${account.assetId}-${account.marketId}`;

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
        // #TODO handle new account
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

export const accountsDataProvider = makeDataProvider<
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

export interface AccountFields extends AccountFieldsFragment {
  available: string;
  used: string;
  deposited: string;
  balance: string;
  breakdown?: AccountFields[];
}

const USE_ACCOUNT_TYPES = [
  Schema.AccountType.ACCOUNT_TYPE_MARGIN,
  Schema.AccountType.ACCOUNT_TYPE_BOND,
  Schema.AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
  Schema.AccountType.ACCOUNT_TYPE_FEES_LIQUIDITY,
  Schema.AccountType.ACCOUNT_TYPE_FEES_MAKER,
  Schema.AccountType.ACCOUNT_TYPE_PENDING_TRANSFERS,
];

const getAssetIds = (data: AccountFieldsFragment[]) =>
  Array.from(new Set(data.map((a) => a.asset.id))).sort();

const getTotalBalance = (accounts: AccountFieldsFragment[]) =>
  accounts.reduce((acc, a) => acc + BigInt(a.balance), BigInt(0));

export const getAccountData = (
  data: AccountFieldsFragment[]
): AccountFields[] => {
  return getAssetIds(data).map((assetId) => {
    const accounts = data.filter((a) => a.asset.id === assetId);
    return accounts && getAssetAccountAggregation(accounts, assetId);
  });
};

const getAssetAccountAggregation = (
  accountList: AccountFieldsFragment[],
  assetId: string
): AccountFields => {
  const accounts = accountList.filter((a) => a.asset.id === assetId);
  const available = getTotalBalance(
    accounts.filter((a) => a.type === Schema.AccountType.ACCOUNT_TYPE_GENERAL)
  );

  const used = getTotalBalance(
    accounts.filter((a) => USE_ACCOUNT_TYPES.includes(a.type))
  );

  const balanceAccount: AccountFields = {
    asset: accounts[0].asset,
    balance: available.toString(),
    type: Schema.AccountType.ACCOUNT_TYPE_GENERAL,
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
    }));
  return { ...balanceAccount, breakdown };
};

export const aggregatedAccountsDataProvider = makeDerivedDataProvider<
  AccountFields[],
  never
>(
  [accountsDataProvider],
  (parts) => parts[0] && getAccountData(parts[0] as AccountFieldsFragment[])
);
