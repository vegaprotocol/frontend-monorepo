import type { ColDef } from 'ag-grid-community';
import { useMemo } from 'react';
import { AgGrid, COL_DEFS, SetFilter } from '@vegaprotocol/datagrid';
import {
  useAssetDetailsDialogStore,
  getAssetSymbol,
} from '@vegaprotocol/assets';
import {
  addDecimalsFormatNumber,
  getDateTimeFormat,
} from '@vegaprotocol/utils';
import {
  DepositStatus,
  TransferStatus,
  TransferStatusMapping,
  WithdrawalStatus,
} from '@vegaprotocol/types';

import { Pagination } from '@vegaprotocol/datagrid';
import { useVegaWallet } from '@vegaprotocol/wallet-react';

import { useT } from '../../lib/use-t';
import { PAGE_SIZE, type Row, useAssetActivity } from './use-asset-activity';

import { DepositStatusCell } from './deposit-status-cell';
import { WithdrawalStatusCell } from './withdrawal-status-cell';
import { DepositToFromCell } from './deposit-to-from-cell';
import { WithdrawalToFromCell } from './withdrawal-to-from-cell';
import { TransferToFromCell } from './transfer-to-from-cell';
import { useWithdrawalApprovalDialog } from '@vegaprotocol/web3';

/** Used for making all status between deposits/withdraws/transfers consistent */
export const StatusSet = {
  Pending: 'Pending',
  Failed: 'Failed',
  Finalized: 'Finalized',
  Cancelled: 'Cancelled',
  Stopped: 'Stopped',
} as const;

export const AssetActivity = () => {
  const { pubKey } = useVegaWallet();
  const { rowData, pinnedTopRows, setFirst, hasNextPage } = useAssetActivity();

  return (
    <AssetActivityDatagrid
      partyId={pubKey}
      rowData={rowData}
      pinnedTopRowData={pinnedTopRows}
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
  pinnedTopRowData,
  pageInfo,
  load,
}: {
  partyId?: string;
  rowData: Row[];
  pinnedTopRowData: Row[];
  pageInfo: { hasNextPage?: boolean };
  load: () => void;
}) => {
  const t = useT();
  const openAssetDialog = useAssetDetailsDialogStore((store) => store.open);
  const openWithdrawalDialog = useWithdrawalApprovalDialog(
    (state) => state.open
  );
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
        valueFormatter: ({ data }) => {
          return getAssetSymbol(data.asset);
        },
        onCellClicked: ({ data }: { data: Row }) => {
          if (!data.asset) return;
          openAssetDialog(data.asset.id);
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
              return StatusSet.Finalized;
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
              return StatusSet.Finalized;
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
              return StatusSet.Finalized;
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
            return (
              <WithdrawalStatusCell
                data={data}
                openDialog={openWithdrawalDialog}
              />
            );
          }

          if (data.type === 'Transfer') {
            return TransferStatusMapping[data.detail.status];
          }

          return '-';
        },
      },
    ],
    [partyId, t, openAssetDialog, openWithdrawalDialog]
  );

  return (
    <div className="h-full flex flex-col">
      <AgGrid
        columnDefs={columnDefs}
        defaultColDef={COL_DEFS.default}
        rowData={rowData}
        pinnedTopRowData={pinnedTopRowData}
        overlayNoRowsTemplate={t('No data')}
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
