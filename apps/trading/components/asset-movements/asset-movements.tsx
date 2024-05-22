import type { ColDef } from 'ag-grid-community';
import { useMemo } from 'react';
import compact from 'lodash/compact';

import { AgGrid, COL_DEFS } from '@vegaprotocol/datagrid';
import {
  type DepositFieldsFragment,
  useDeposits,
} from '@vegaprotocol/deposits';
import {
  type WithdrawalFieldsFragment,
  useWithdrawals,
} from '@vegaprotocol/withdraws';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import type { AssetFieldsFragment } from '@vegaprotocol/assets';
import { useTransfers } from '@vegaprotocol/accounts';
import { TransferFieldsFragment } from 'libs/accounts/src/lib/__generated__/Transfers';
import { getDateTimeFormat } from '@vegaprotocol/utils';
import { TransferStatusMapping } from '@vegaprotocol/types';

interface RowBase {
  asset: AssetFieldsFragment | undefined;
  amount: string;
  createdTimestamp: Date;
}

interface RowDeposit extends RowBase {
  type: 'Deposit';
  detail: DepositFieldsFragment;
}

interface RowWithdrawal extends RowBase {
  type: 'Withdrawal';
  detail: WithdrawalFieldsFragment;
}

interface RowTransfer extends RowBase {
  type: 'Transfer';
  detail: TransferFieldsFragment;
}

type Row = RowDeposit | RowWithdrawal | RowTransfer;

export const AssetMovements = () => {
  const { pubKey } = useVegaWallet();
  const { data: deposits } = useDeposits({ pubKey });
  const { data: withdrawals } = useWithdrawals({ pubKey });
  const { data: transfers } = useTransfers({ pubKey });

  const rowData = compact(
    [...(deposits || []), ...(withdrawals || []), ...(transfers || [])].map(
      normalizeItem
    )
  );

  console.log(deposits);
  console.log(transfers);
  console.log(rowData);

  return <AssetMovementsDatagrid partyId={pubKey} rowData={rowData} />;
};

export const AssetMovementsDatagrid = ({
  partyId,
  rowData,
}: {
  partyId?: string;
  rowData: Row[];
}) => {
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: 'Type',
        field: 'type',
        valueFormatter: ({ value, data }: { value: string; data: Row }) => {
          let postfix = '';

          // show direction of transfer
          if (data.type === 'Transfer') {
            if (data.detail.to === partyId) {
              postfix = ' in';
            } else if (data.detail.from === partyId) {
              postfix = ' out';
            }
          }

          return `${value}${postfix}`;
        },
      },
      { headerName: 'Asset', field: 'asset.symbol' },

      {
        headerName: 'Created at',
        field: 'createdTimestamp',
        valueFormatter: ({ value }) => getDateTimeFormat().format(value),
        sort: 'desc',
      },
      {
        headerName: 'Amount',
        field: 'amount',
      },
      {
        headerName: 'To/From',
        field: 'type',
        valueFormatter: ({ data }: { data: Row }) => {
          // TODO: provide link to Etherscan
          if (data.type === 'Deposit') {
            return `Tx: ${data.detail.txHash}`;
          }

          if (data.type === 'Withdrawal') {
            return `To: ${data.detail.details?.receiverAddress}`;
          }

          if (data.type === 'Transfer') {
            if (data.detail.to === partyId) {
              return `Sender: ${data.detail.from}`;
            } else if (data.detail.from === partyId) {
              return `Receiver ${data.detail.to}`;
            }
          }

          return '-';
        },
      },
      {
        headerName: 'Status',
        field: 'type',
        valueFormatter: ({ data }: { data: Row }) => {
          if (data.type === 'Deposit') {
            // TODO: show confirmations/complete
            return '-';
          }

          if (data.type === 'Withdrawal') {
            // TODO: show pending approve/pending network/complete
            return '-';
          }

          if (data.type === 'Transfer') {
            return TransferStatusMapping[data.detail.status];
          }

          return '-';
        },
      },
    ],
    []
  );

  return (
    <AgGrid
      columnDefs={columnDefs}
      defaultColDef={COL_DEFS.default}
      rowData={rowData}
    />
  );
};

const normalizeItem = (
  item:
    | DepositFieldsFragment
    | WithdrawalFieldsFragment
    | TransferFieldsFragment
): Row | null => {
  if (item.__typename === 'Withdrawal') {
    return {
      asset: item.asset,
      type: 'Withdrawal',
      amount: item.amount,
      createdTimestamp: new Date(item.createdTimestamp),
      detail: item,
    };
  }

  if (item.__typename === 'Deposit') {
    return {
      asset: item.asset,
      type: 'Deposit',
      amount: item.amount,
      createdTimestamp: new Date(item.createdTimestamp),
      detail: item,
    };
  }

  if (item.__typename === 'Transfer') {
    console.log(item);
    return {
      // @ts-ignore TODO: fix me
      asset: item.asset,
      type: 'Transfer',
      amount: item.amount,
      createdTimestamp: new Date(item.timestamp),
      detail: item,
    };
  }

  return null;
};
