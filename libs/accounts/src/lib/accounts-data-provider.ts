import produce from 'immer';
import {
  AccountsDocument,
  AccountEventsDocument,
} from './__generated___/Accounts';
import type {
  AccountFieldsFragment,
  AccountsQuery,
  AccountEventsSubscription,
} from './__generated___/Accounts';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import { AccountType } from '@vegaprotocol/types';

export interface AccountFields extends AccountFieldsFragment {
  available: string;
  used: string;
  deposited: string;
  balance: string;
  breakdown?: AccountFields[];
}

export const getId = (account: AccountFields) =>
  `${account.asset.id}-${account.type}${
    account.market ? `-${account.market.id}` : ''
  }`;

const USE_ACCOUNT_TYPES = [
  AccountType.ACCOUNT_TYPE_MARGIN,
  AccountType.ACCOUNT_TYPE_BOND,
  AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
  AccountType.ACCOUNT_TYPE_FEES_LIQUIDITY,
  AccountType.ACCOUNT_TYPE_FEES_MAKER,
  AccountType.ACCOUNT_TYPE_PENDING_TRANSFERS,
];

const getData = (responseData: AccountsQuery): AccountFields[] | null => {
  return (
    (responseData.party?.accounts &&
      getAccountData(responseData.party.accounts)) ??
    null
  );
};

const getDelta = (
  subscriptionData: AccountEventsSubscription
): AccountEventsSubscription['accounts'] => subscriptionData.accounts;

const update = (
  data: AccountFields[],
  deltas: AccountEventsSubscription['accounts']
): AccountFields[] => {
  return produce(data, (draft) => {
    deltas.forEach((delta) => {
      const index = draft.findIndex(
        (account) => account.asset.id === delta.assetId
      );
      if (index === -1) return;
      const accountBreakdown = draft[index].breakdown?.map((account) => {
        const delta = deltas.find(
          (delta) =>
            (delta.marketId === account.market?.id &&
              delta.type === account.type) ||
            delta.type === account.type
        );
        if (!delta) return account;
        return { ...account, balance: delta.balance };
      });
      if (accountBreakdown && accountBreakdown.length > 0) {
        draft[index] = getAssetAccountAggregation(accountBreakdown);
      }
    });
  });
};

export const accountsDataProvider = makeDataProvider<
  AccountsQuery,
  AccountFields[],
  AccountEventsSubscription,
  AccountEventsSubscription['accounts']
>({
  query: AccountsDocument,
  subscriptionQuery: AccountEventsDocument,
  update,
  getData,
  getDelta,
});

const getAssetIds = (data: AccountFieldsFragment[]) =>
  Array.from(new Set(data.map((a) => a.asset.id))).sort();

const getTotalBalance = (accounts: AccountFieldsFragment[]) =>
  accounts.reduce((acc, a) => acc + BigInt(a.balance), BigInt(0));

const getAccountData = (data: AccountFieldsFragment[]): AccountFields[] => {
  return getAssetIds(data).map((assetId) => {
    const accounts = data.filter((a) => a.asset.id === assetId);
    return accounts && getAssetAccountAggregation(accounts);
  });
};

/** getAssetAccountAggregation should receive all the accounts filtered by asset id */
const getAssetAccountAggregation = (
  accounts: AccountFieldsFragment[]
): AccountFields => {
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
    .filter((a) => AccountType.ACCOUNT_TYPE_GENERAL !== a.type)
    .map((a) => ({
      ...a,
      deposited: balanceAccount.deposited,
      available:
        AccountType.ACCOUNT_TYPE_GENERAL === a.type
          ? a.balance
          : balanceAccount.available,
      used: USE_ACCOUNT_TYPES.includes(a.type)
        ? a.balance
        : balanceAccount.used,
    }));
  return { ...balanceAccount, breakdown };
};
