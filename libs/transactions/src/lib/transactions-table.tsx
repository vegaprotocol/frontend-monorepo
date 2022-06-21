import { forwardRef } from 'react';
import { format } from 'date-fns';
import { AgGridColumn } from 'ag-grid-react';
import type { AgGridReact } from 'ag-grid-react';
import type { ValueFormatterParams } from 'ag-grid-community';
import { t, addDecimalsFormatNumber, PriceCell } from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid, Link } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/network-switcher';
import type { TransactionsData } from './transactions-manager';

interface TransactionsTableProps {
  data: TransactionsData[] | null;
}

interface TransactionsTableValueFormatterParams extends ValueFormatterParams {
  data: TransactionsData;
}

type EthLinkProps = {
  href: string;
  value: string;
}

const EthLink = ({ valueFormatted: { href, value } }: { valueFormatted: EthLinkProps }) => {
  return <Link href={href} target="_blank">{value}</Link>
}

export const TransactionsTable = forwardRef<
  AgGridReact,
  TransactionsTableProps
>(({ data }, ref) => {
  const { ETHERSCAN_URL } = useEnvironment();

  return (
    <div style={{ height: '500px' }}>
      <AgGrid
        ref={ref}
        style={{ width: '100%', height: '100%' }}
        overlayNoRowsTemplate={t('No transactions')}
        rowData={data}
        getRowId={({ data }) => data.id}
        components={{ PriceCell, EthLink }}
      >

        <AgGridColumn headerName={t('Asset')} field="asset.symbol" />
        <AgGridColumn
          headerName={t('Amount')}
          field="amount"
          cellRenderer="PriceCell"
          valueFormatter={({
            value,
            data,
          }: TransactionsTableValueFormatterParams) =>
            addDecimalsFormatNumber(value, data.asset.decimals)
          }
        />
        <AgGridColumn headerName={t('Type')} field="__typename" />
        <AgGridColumn headerName={t('Status')} field="status" />
        <AgGridColumn
          headerName={t('Created at')}
          field="createdTimestamp"
          valueFormatter={({
            value,
          }: TransactionsTableValueFormatterParams) =>
            format(new Date(value), 'pp P')
          }
        />
        <AgGridColumn
          headerName={t('View on Etherscan')}
          field="txHash"
          cellRenderer="EthLink"
          valueFormatter={({
            value,
            data,
          }: TransactionsTableValueFormatterParams): EthLinkProps => ({
            href: `${ETHERSCAN_URL}/tx/${value}`,
            value: value,
          })}
        />
      </AgGrid>
    </div>
  );
});

export default TransactionsTable;
