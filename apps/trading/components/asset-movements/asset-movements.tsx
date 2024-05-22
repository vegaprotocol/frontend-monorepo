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

interface Row {
  asset: AssetFieldsFragment;
  type: 'Deposit' | 'Withdrawal';
  amount: string;
  createdTimestamp: Date;
}

export const AssetMovements = () => {
  const { pubKey } = useVegaWallet();
  const { data: deposits } = useDeposits({ pubKey });
  const { data: withdrawals } = useWithdrawals({ pubKey });

  const rowData = compact(
    [...(deposits || []), ...(withdrawals || [])].map(normalizeItem)
  );

  return <AssetMovementsDatagrid rowData={rowData} />;
};

export const AssetMovementsDatagrid = ({ rowData }: { rowData: Row[] }) => {
  const columnDefs = useMemo<ColDef[]>(
    () => [
      { headerName: 'Asset', field: 'asset.symbol' },
      { headerName: 'Type', field: 'type' },
      {
        headerName: 'Amount',
        field: 'amount',
      },
      {
        headerName: 'Created at',
        field: 'createdTimestamp',
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
  item: DepositFieldsFragment | WithdrawalFieldsFragment
): Row | null => {
  if (item.__typename === 'Withdrawal') {
    return {
      asset: item.asset,
      type: 'Withdrawal',
      amount: item.amount,
      createdTimestamp: new Date(item.createdTimestamp),
    };
  }

  if (item.__typename === 'Deposit') {
    return {
      asset: item.asset,
      type: 'Deposit',
      amount: item.amount,
      createdTimestamp: new Date(item.createdTimestamp),
    };
  }

  return null;
};
