import produce from 'immer';
import {
  AccountsDocument,
  AccountEventsDocument,
} from './__generated__/Accounts';
import type {
  AccountFieldsFragment,
  AccountsQuery,
  AccountEventsSubscription,
} from './__generated__/Accounts';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import { AccountType } from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';

export const getId = (data: AccountFieldsFragment) =>
  `${data.type}-${data.asset.symbol}-${data.market?.id ?? 'null'}`;

const update = (
  data: AccountFieldsFragment[],
  delta: AccountFieldsFragment
) => {
  return produce(data, (draft) => {
    const id = getId(delta);
    const index = draft.findIndex((a) => getId(a) === id);
    if (index !== -1) {
      draft[index] = delta;
    } else {
      draft.push(delta);
    }
  });
};

const getData = (
  responseData: AccountsQuery
): AccountFieldsFragment[] | null => {
  return responseData.party?.accounts ?? null;
};

const getDelta = (
  subscriptionData: AccountEventsSubscription
): AccountFieldsFragment => subscriptionData.accounts;

export const accountsDataProvider = makeDataProvider<
  AccountsQuery,
  AccountFieldsFragment[],
  AccountEventsSubscription,
  AccountFieldsFragment
>({
  query: AccountsDocument,
  subscriptionQuery: AccountEventsDocument,
  update,
  getData,
  getDelta,
});

export const getAccountData = (
  data: AccountFieldsFragment[],
  assetSymbol: string
) => {
  const assetData = data.filter((a) => a.asset.symbol === assetSymbol);

  const deposited = assetData
    .filter((a) => [AccountType.ACCOUNT_TYPE_GENERAL].includes(a.type))
    .reduce((acc, a) => acc.plus(a.balance), new BigNumber(0));

  const used = assetData
    .filter((a) =>
      [AccountType.ACCOUNT_TYPE_MARGIN, AccountType.ACCOUNT_TYPE_BOND].includes(
        a.type
      )
    )
    .reduce((acc, a) => acc.plus(a.balance), new BigNumber(0));

  const depositRow = {
    ...assetData[0],
    available: deposited.minus(used).toString(),
    deposited: deposited.toString(),
    used: used.toString(),
  };
  const positionRows = assetData
    .filter((a) => [AccountType.ACCOUNT_TYPE_MARGIN].includes(a.type))
    .map((a) => ({
      ...a,
      available: deposited.minus(a.balance).toString(),
      deposited: deposited.toString(),
      used: a.balance.toString(),
    }));

  return {
    positionRows,
    depositRow,
  };
};
