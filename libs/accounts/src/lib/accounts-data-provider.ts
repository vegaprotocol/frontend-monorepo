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
import type { SummaryRow } from '@vegaprotocol/react-helpers';
import { makeDataProvider } from '@vegaprotocol/react-helpers';
import { AccountType } from '@vegaprotocol/types';
import BigNumber from 'bignumber.js';
import type { ColumnApi } from 'ag-grid-community';
import type { AccountFields } from './accounts-manager';

export const getId = (data: AccountFieldsFragment) =>
  `${data.type}-${data.asset.symbol}-${data.market?.id ?? 'null'}`;

export const getGroupId = (
  data: AccountFields & SummaryRow,
  columnApi: ColumnApi
) => {
  if (data.__summaryRow) {
    return null;
  }
  const sortColumnId = columnApi.getColumnState().find((c) => c.sort)?.colId;
  switch (sortColumnId) {
    case 'asset.symbol':
      return data.asset.id;
  }
  return undefined;
};

export const getGroupSummaryRow = (
  data: AccountFields[],
  columnApi: ColumnApi
): Partial<AccountFields & SummaryRow> | null => {
  if (!data.length) {
    return null;
  }
  const sortColumnId = columnApi.getColumnState().find((c) => c.sort)?.colId;
  switch (sortColumnId) {
    case 'asset.symbol':
      return {
        __summaryRow: true,
        balance: data
          .reduce((a, i) => a + (parseFloat(i.balance) || 0), 0)
          .toString(),
        asset: data[0].asset,
      };
  }
  return null;
};

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

const INCOMING_ACCOUNT_TYPES = [
  AccountType.ACCOUNT_TYPE_GENERAL,
  AccountType.ACCOUNT_TYPE_REWARD_LP_RECEIVED_FEES,
  AccountType.ACCOUNT_TYPE_REWARD_MAKER_RECEIVED_FEES,
  AccountType.ACCOUNT_TYPE_REWARD_TAKER_PAID_FEES,
  AccountType.ACCOUNT_TYPE_REWARD_MARKET_PROPOSERS,
  AccountType.ACCOUNT_TYPE_GLOBAL_REWARD,
];

const OUTCOMING_ACCOUNT_TYPES = [
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

  const incoming = assetData
    .filter((a) => INCOMING_ACCOUNT_TYPES.includes(a.type))
    .reduce((acc, a) => acc.plus(a.balance), new BigNumber(0));

  const used = assetData
    .filter((a) => OUTCOMING_ACCOUNT_TYPES.includes(a.type))
    .reduce((acc, a) => acc.plus(a.balance), new BigNumber(0));

  const depositRow = {
    ...assetData[0],
    available: incoming.minus(used).toString(),
    deposited: deposited.toString(),
    used: used.toString(),
  };
  const accountRows = assetData
    .filter((a) => !INCOMING_ACCOUNT_TYPES.includes(a.type))
    .map((a) => ({
      ...a,
      available: incoming.minus(a.balance).toString(),
      deposited: deposited.toString(),
      used: a.balance.toString(),
    }));

  return {
    accountRows,
    depositRow,
  };
};
