import type { ColDef } from 'ag-grid-community';
import type BigNumber from 'bignumber.js';
import { useMemo, useState } from 'react';
import compact from 'lodash/compact';

import { AgGrid, COL_DEFS, SetFilter } from '@vegaprotocol/datagrid';
import {
  type DepositFieldsFragment,
  useDeposits,
} from '@vegaprotocol/deposits';
import {
  type WithdrawalFieldsFragment,
  useWithdrawals,
} from '@vegaprotocol/withdraws';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import {
  useAssetDetailsDialogStore,
  type AssetFieldsFragment,
} from '@vegaprotocol/assets';
import {
  type TransferFieldsFragment,
  useTransfers,
} from '@vegaprotocol/accounts';
import {
  addDecimalsFormatNumber,
  getDateTimeFormat,
  toBigNum,
} from '@vegaprotocol/utils';
import {
  DepositStatus,
  TransferStatus,
  TransferStatusMapping,
  WithdrawalStatus,
} from '@vegaprotocol/types';

import { useT } from '../../lib/use-t';
import { DepositStatusCell } from './deposit-status-cell';
import { WithdrawalStatusCell } from './withdrawal-status-cell';
import { DepositToFromCell } from './deposit-to-from-cell';
import { WithdrawalToFromCell } from './withdrawal-to-form-cell';
import { TransferToFromCell } from './transfer-to-from-cell';
import { Pagination } from '@vegaprotocol/datagrid';

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

const PAGE_SIZE = 1000;

/** Used for making all status between deposits/withdraws/transfers consistent */
export const StatusSet = {
  Pending: 'Pending',
  Failed: 'Failed',
  Complete: 'Complete',
  Cancelled: 'Cancelled',
  Stopped: 'Stopped',
} as const;

export const AssetActivity = () => {
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

  const rowData = useMemo(() => {
    return compact(
      [...(deposits || []), ...(withdrawals || []), ...(transfers || [])].map(
        normalizeItem
      )
    );
  }, [deposits, withdrawals, transfers]);

  return (
    <AssetActivityDatagrid
      partyId={pubKey}
      rowData={rowData}
      pageInfo={{ hasNextPage }}
      load={() => {
        setFirst((curr) => curr + PAGE_SIZE);
      }}
    />
  );
};

export const AssetActivityDatagrid = ({
  partyId,
  rowData,
  pageInfo,
  load,
}: {
  partyId?: string;
  rowData: Row[];
  pageInfo: { hasNextPage?: boolean };
  load: () => void;
}) => {
  const t = useT();
  const open = useAssetDetailsDialogStore((store) => store.open);
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: t('Type'),
        field: 'type',
        filter: SetFilter,
        filterParams: {
          set: {
            Deposit: t('Deposit'),
            Withdrawal: t('Withdrawal'),
            Transfer: t('Transfer'),
          },
        },
        valueFormatter: ({ value, data }: { value: string; data: Row }) => {
          let postfix = '';

          // show direction of transfer
          if (data.type === 'Transfer') {
            if (data.detail.to === partyId) {
              postfix = ' from';
            } else if (data.detail.from === partyId) {
              postfix = ' to';
            }
          }

          return `${value}${postfix}`;
        },
      },
      {
        headerName: t('Asset'),
        field: 'asset.symbol',
        cellClass: 'underline underline-offset-4',
        filter: 'agTextColumnFilter',
        onCellClicked: ({ data }: { data: Row }) => {
          if (!data.asset) return;
          open(data.asset.id);
        },
      },

      {
        headerName: t('Created at'),
        field: 'createdTimestamp',
        filter: 'agDateColumnFilter',
        valueFormatter: ({ value }) => getDateTimeFormat().format(value),
        sort: 'desc',
      },
      {
        headerName: t('Amount'),
        field: 'amount',
        filter: 'agNumberColumnFilter',
        valueGetter: ({ data }: { data: Row }) => {
          return data.bAmount.toNumber();
        },
        valueFormatter: ({ data }: { data: Row }) => {
          if (!data.amount || !data.asset) return '-';
          return addDecimalsFormatNumber(data.amount, data.asset.decimals);
        },
      },
      {
        headerName: t('To/From'),
        field: 'type',
        cellRenderer: ({ data }: { data: Row }) => {
          if (data.type === 'Deposit') {
            return <DepositToFromCell data={data} />;
          }

          if (data.type === 'Withdrawal') {
            return <WithdrawalToFromCell data={data} />;
          }

          if (data.type === 'Transfer') {
            return <TransferToFromCell data={data} partyId={partyId} />;
          }

          return '-';
        },
      },
      {
        headerName: 'Status',
        field: 'type',
        filter: SetFilter,
        filterParams: {
          set: StatusSet,
        },
        // Make all status values consistent between different row types
        valueGetter: ({ data }: { data: Row }) => {
          if (data.type === 'Deposit') {
            if (data.detail.status === DepositStatus.STATUS_FINALIZED) {
              return StatusSet.Complete;
            }

            if (data.detail.status === DepositStatus.STATUS_OPEN) {
              return StatusSet.Pending;
            }

            if (data.detail.status === DepositStatus.STATUS_CANCELLED) {
              return StatusSet.Cancelled;
            }

            return StatusSet.Failed;
          }

          if (data.type === 'Withdrawal') {
            if (data.detail.txHash) {
              return StatusSet.Complete;
            }

            // Finalized but no txHash, withdrawal is awaiting Ethereum transaction for completion
            if (
              data.detail.status === WithdrawalStatus.STATUS_FINALIZED ||
              data.detail.status === WithdrawalStatus.STATUS_OPEN
            ) {
              return StatusSet.Pending;
            }

            return StatusSet.Failed;
          }

          if (data.type === 'Transfer') {
            if (data.detail.status === TransferStatus.STATUS_DONE) {
              return StatusSet.Complete;
            }

            if (data.detail.status === TransferStatus.STATUS_PENDING) {
              return StatusSet.Pending;
            }

            if (data.detail.status === TransferStatus.STATUS_CANCELLED) {
              return StatusSet.Cancelled;
            }

            if (data.detail.status === TransferStatus.STATUS_STOPPED) {
              return StatusSet.Cancelled;
            }

            return StatusSet.Failed;
          }
        },
        cellRenderer: ({ data }: { data: Row }) => {
          if (data.type === 'Deposit') {
            return <DepositStatusCell data={data} />;
          }

          if (data.type === 'Withdrawal') {
            return <WithdrawalStatusCell data={data} />;
          }

          if (data.type === 'Transfer') {
            return TransferStatusMapping[data.detail.status];
          }

          return '-';
        },
      },
    ],
    [partyId, t, open]
  );

  return (
    <div className="h-full flex flex-col">
      <AgGrid
        columnDefs={columnDefs}
        defaultColDef={COL_DEFS.default}
        rowData={rowData}
      />
      <Pagination
        count={rowData.length}
        pageInfo={pageInfo}
        onLoad={load}
        hasDisplayedRows={true}
        showRetentionMessage={true}
      />
    </div>
  );
};

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
