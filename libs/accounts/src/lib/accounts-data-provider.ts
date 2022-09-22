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
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import { AccountType } from '@vegaprotocol/types';

export interface AccountFields extends AccountFieldsFragment {
  available: string;
  used: string;
  deposited: string;
  balance: string;
  breakdown?: AccountFields[];
}

function isAccount(
  account:
    | AccountFieldsFragment
    | IterableElement<AccountEventsSubscription['accounts']>
): account is AccountFieldsFragment {
  return (account as AccountFieldsFragment).__typename === 'Account';
}

export const getId = (
  account:
    | AccountFieldsFragment
    | IterableElement<AccountEventsSubscription['accounts']>
) =>
  isAccount(account)
    ? `${account.type}-${account.asset.id}-${account.market?.id ?? 'null'}`
    : `${account.type}-${account.assetId}-${account.marketId}`;

const IN_ACCOUNT_TYPES = [
  AccountType.ACCOUNT_TYPE_GENERAL,
  AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES,
  AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES,
  AccountType.ACCOUNT_TYPE_REWARD_MAKER_PAID_FEES,
  AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS,
];

const OUT_ACCOUNT_TYPES = [
  AccountType.ACCOUNT_TYPE_MARGIN,
  AccountType.ACCOUNT_TYPE_BOND,
  AccountType.ACCOUNT_TYPE_FEES_INFRASTRUCTURE,
  AccountType.ACCOUNT_TYPE_FEES_LIQUIDITY,
  AccountType.ACCOUNT_TYPE_FEES_MAKER,
  AccountType.ACCOUNT_TYPE_PENDING_TRANSFERS,
];

const getData = (
  responseData: AccountsQuery
): AccountFieldsFragment[] | null => {
  return responseData.party?.accounts ?? null;
};

const getDelta = (
  subscriptionData: AccountEventsSubscription
): AccountEventsSubscription['accounts'] => subscriptionData.accounts;

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
        // draft.push(delta);
      }
    });
  });
};

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

const getSymbols = (data: AccountFieldsFragment[]) =>
  Array.from(new Set(data.map((a) => a.asset.symbol))).sort();

// TODO add test for this
export const getAccountData = (
  data: AccountFieldsFragment[]
): AccountFields[] => {
  const collateralData = getSymbols(data).map((assetSymbol) => {
    const assetData = data.filter((a) => a.asset.symbol === assetSymbol);

    const deposited = assetData
      .filter((a) => [AccountType.ACCOUNT_TYPE_GENERAL].includes(a.type))
      .reduce((acc, a) => acc + BigInt(a.balance), BigInt(0));

    const incoming = assetData
      .filter((a) => IN_ACCOUNT_TYPES.includes(a.type))
      .reduce((acc, a) => acc + BigInt(a.balance), BigInt(0));

    const used = assetData
      .filter((a) => OUT_ACCOUNT_TYPES.includes(a.type))
      .reduce((acc, a) => acc + BigInt(a.balance), BigInt(0));

    const depositRow: AccountFields = {
      ...assetData[0],
      available: (incoming - used).toString(),
      deposited: deposited.toString(),
      used: used.toString(),
    };

    const accountRows = assetData
      .filter((a) => !IN_ACCOUNT_TYPES.includes(a.type))
      .map((a) => ({
        ...a,
        available: (incoming - BigInt(a.balance)).toString(),
        deposited: deposited.toString(),
        used: a.balance.toString(),
      }));

    return { ...depositRow, breakdown: accountRows };
  });

  return collateralData;
};
