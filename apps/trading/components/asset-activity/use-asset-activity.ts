import compact from 'lodash/compact';
import orderBy from 'lodash/orderBy';
import { useMemo, useState } from 'react';
import type BigNumber from 'bignumber.js';

import { useVegaWallet } from '@vegaprotocol/wallet-react';
import {
  type TransferFieldsFragment,
  useTransfers,
} from '@vegaprotocol/accounts';
import { type AssetFieldsFragment } from '@vegaprotocol/assets';
import {
  type DepositFieldsFragment,
  useDeposits,
} from '@vegaprotocol/deposits';
import {
  type WithdrawalFieldsFragment,
  useWithdrawals,
} from '@vegaprotocol/withdraws';
import { toBigNum } from '@vegaprotocol/utils';
import { WithdrawalStatus } from '@vegaprotocol/types';

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

export const PAGE_SIZE = 1000;

/**
 * Fetches deposits, withdrawals and transfers and combines them into a normalized list
 */
export const useAssetActivity = () => {
  const { pubKey } = useVegaWallet();
  const [first, setFirst] = useState(PAGE_SIZE);

  const { data: deposits, pageInfo: depositsPageInfo } = useDeposits({
    pubKey,
    pagination: { first },
  });
  const { data: withdrawals, pageInfo: withdrawalsPageInfo } = useWithdrawals({
    pubKey,
    pagination: { first },
  });
  const { data: transfers, pageInfo: transfersPageInfo } = useTransfers({
    pubKey,
    pagination: { first },
  });

  const hasNextPage = [
    depositsPageInfo?.hasNextPage,
    withdrawalsPageInfo?.hasNextPage,
    transfersPageInfo?.hasNextPage,
  ].some((hasNextPage) => hasNextPage);

  const rows = useMemo(() => {
    const pinnedTopRows: RowWithdrawal[] = [];

    const allRows = compact(
      [...(deposits || []), ...(withdrawals || []), ...(transfers || [])].map(
        normalizeItem
      )
    );
    const orderedRows = orderBy(allRows, (d) => d.createdTimestamp, 'desc');

    // Filter out any incomplete withdrawals so they can be added as
    // pinned rows to the top
    const rows = orderedRows.filter((r) => {
      if (
        r.type === 'Withdrawal' &&
        r.detail.status !== WithdrawalStatus.STATUS_REJECTED &&
        !r.detail.txHash
      ) {
        pinnedTopRows.push(r);
        return false;
      }

      return true;
    });

    return {
      rowData: rows,
      pinnedTopRows,
    };
  }, [deposits, withdrawals, transfers]);

  return {
    rowData: rows.rowData,
    pinnedTopRows: rows.pinnedTopRows,
    setFirst,
    hasNextPage,
  };
};

/**
 * Converts a deposit, withdrawal or transfer object into a Row object
 * to be used in the asset activity table
 */
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
