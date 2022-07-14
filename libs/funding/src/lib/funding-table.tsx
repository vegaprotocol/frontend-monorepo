import { forwardRef } from 'react';
import { format } from 'date-fns';
import { AgGridColumn } from 'ag-grid-react';
import type { AgGridReact } from 'ag-grid-react';
import type { ValueFormatterParams } from 'ag-grid-community';
import {
  t,
  addDecimalsFormatNumber,
  PriceCell,
} from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid, Link, Icon } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/environment';
import type { FundingData } from './funding-manager';

interface FundingTableProps {
  data: FundingData[] | null;
}

interface FundingTableValueFormatterParams extends ValueFormatterParams {
  data: FundingData;
}

type EthLinkProps = {
  href: string;
  value: string;
};

const EthLink = ({
  valueFormatted: { href, value },
}: {
  valueFormatted: EthLinkProps;
}) => {
  return (
    <Link href={href} target="_blank">
      {value}
      <Icon name="arrow-top-right"/>
    </Link>
  );
};

export const FundingTable = forwardRef<AgGridReact, FundingTableProps>(
  ({ data }, ref) => {
    const { ETHERSCAN_URL } = useEnvironment();
    console.log(data)
    return (
      <div style={{ height: '500px' }}>
        <AgGrid
          ref={ref}
          style={{ width: '100%', height: '100%' }}
          overlayNoRowsTemplate={t('No funding')}
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
            }: FundingTableValueFormatterParams) =>
              addDecimalsFormatNumber(value, data.asset.decimals)
            }
          />
          <AgGridColumn headerName={t('Type')} field="__typename" />
          <AgGridColumn headerName={t('Status')} field="status" />
          <AgGridColumn
            headerName={t('Date')}
            field="createdTimestamp"
            valueFormatter={({ value }: FundingTableValueFormatterParams) =>
              format(new Date(value), 'HH:mm dd MMM yyyy')
            }
          />
          <AgGridColumn
            headerName={t('Transaction')}
            field="txHash"
            cellRenderer="EthLink"
            valueFormatter={({
              value,
            }: FundingTableValueFormatterParams): EthLinkProps => ({
              href: `${ETHERSCAN_URL}/tx/${value}`,
              value: value,
            })}
          />
        </AgGrid>
      </div>
    );
  }
);

export default FundingTable;
