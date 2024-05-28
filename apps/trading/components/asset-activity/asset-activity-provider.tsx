import flatten from 'lodash/flatten';
import sortBy from 'lodash/sortBy';
import {
  type TransferFieldsFragment,
  transfersProvider,
} from '@vegaprotocol/accounts';
import { AssetFieldsFragment } from '@vegaprotocol/assets';
import { makeDerivedDataProvider } from '@vegaprotocol/data-provider';
import {
  DepositFieldsFragment,
  depositsProvider,
} from '@vegaprotocol/deposits';
import {
  WithdrawalFieldsFragment,
  withdrawalProvider,
} from '@vegaprotocol/withdraws';
import BigNumber from 'bignumber.js';
import { toBigNum } from '@vegaprotocol/utils';

export interface RowBase {
  asset: AssetFieldsFragment | undefined;
  amount: string;
  bAmount: BigNumber;
  createdTimestamp: Date;
}

export interface RowDeposit extends RowBase {
  type: 'Deposit';
  detail: DepositFieldsFragment;
}

export interface RowWithdrawal extends RowBase {
  type: 'Withdrawal';
  detail: WithdrawalFieldsFragment;
}

export interface RowTransfer extends RowBase {
  type: 'Transfer';
  detail: TransferFieldsFragment;
}

export type Row = RowDeposit | RowWithdrawal | RowTransfer;

export const assetActivityProvider = makeDerivedDataProvider<any, any, any>(
  [depositsProvider, withdrawalProvider, transfersProvider],
  (partsData) => {
    const data = flatten(partsData).map(normalizeItem);
    return sortBy(data, 'createdTimestamp');
  }
);

// USAGE

// const { data, load } = useDataProvider({
//   dataProvider: assetActivityProvider,
//   variables: { partyId: pubKey || '' },
//   skip: !pubKey,
// });

const normalizeItem = (
  item:
    | DepositFieldsFragment
    | WithdrawalFieldsFragment
    | TransferFieldsFragment
): Row | null => {
  if (!item.asset) return null;

  const bAmount = toBigNum(item.amount, item.asset.decimals);

  if (item.__typename === 'Withdrawal') {
    return {
      asset: item.asset,
      type: 'Withdrawal',
      amount: item.amount,
      bAmount,
      createdTimestamp: new Date(item.createdTimestamp),
      detail: item,
    };
  }

  if (item.__typename === 'Deposit') {
    return {
      asset: item.asset,
      type: 'Deposit',
      amount: item.amount,
      bAmount,
      createdTimestamp: new Date(item.createdTimestamp),
      detail: item,
    };
  }

  if (item.__typename === 'Transfer') {
    return {
      asset: item.asset,
      type: 'Transfer',
      amount: item.amount,
      bAmount,
      createdTimestamp: new Date(item.timestamp),
      detail: item,
    };
  }

  return null;
};
