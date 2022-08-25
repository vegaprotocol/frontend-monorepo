import type {
  ICellRendererParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import { AgGridColumn } from 'ag-grid-react';
import {
  t,
  addDecimalsFormatNumber,
  getDateTimeFormat,
  truncateByChars,
} from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid, Link } from '@vegaprotocol/ui-toolkit';
import type { DepositFields } from './__generated__/DepositFields';
import { useEnvironment } from '@vegaprotocol/environment';
import type { DepositStatus } from '@vegaprotocol/types';
import { DepositStatusMapping } from '@vegaprotocol/types';

export interface DepositsTableProps {
  deposits: DepositFields[];
}

export const DepositsTable = ({ deposits }: DepositsTableProps) => {
  const { ETHERSCAN_URL } = useEnvironment();
  return (
    <AgGrid
      rowData={deposits}
      overlayNoRowsTemplate={t('No deposits')}
      defaultColDef={{ flex: 1, resizable: true }}
      style={{ width: '100%', height: '100%' }}
      suppressCellFocus={true}
    >
      <AgGridColumn headerName="Asset" field="asset.symbol" />
      <AgGridColumn
        headerName="Amount"
        field="amount"
        valueFormatter={({ value, data }: ValueFormatterParams) => {
          return addDecimalsFormatNumber(value, data.asset.decimals);
        }}
      />
      <AgGridColumn
        headerName="Created at"
        field="createdTimestamp"
        valueFormatter={({ value }: ValueFormatterParams) => {
          return getDateTimeFormat().format(new Date(value));
        }}
      />
      <AgGridColumn
        headerName="Status"
        field="status"
        valueFormatter={({ value }: { value: DepositStatus }) => {
          return DepositStatusMapping[value];
        }}
      />
      <AgGridColumn
        headerName="Tx hash"
        field="txHash"
        cellRenderer={({ value }: ICellRendererParams) => (
          <Link
            title={t('View transaction on Etherscan')}
            href={`${ETHERSCAN_URL}/tx/${value}`}
            data-testid="etherscan-link"
            target="_blank"
          >
            {truncateByChars(value)}
          </Link>
        )}
      />
    </AgGrid>
  );
};

export interface StatusCellProps extends ICellRendererParams {
  ethUrl: string;
  complete: (withdrawalId: string) => void;
}
