import type { AgGridReact } from 'ag-grid-react';
import { useRef } from 'react';
import { t } from '@vegaprotocol/i18n';
import { FundingPaymentsTable } from './funding-payments-table';
import type { useDataGridEvents } from '@vegaprotocol/datagrid';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { fundingPaymentsWithMarketProvider } from './funding-payments-data-provider';

interface FundingPaymentsManagerProps {
  partyId: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  gridProps: ReturnType<typeof useDataGridEvents>;
}

export const FundingPaymentsManager = ({
  partyId,
  onMarketClick,
  gridProps,
}: FundingPaymentsManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const { data, error } = useDataProvider({
    dataProvider: fundingPaymentsWithMarketProvider,
    update: ({ data }) => {
      if (data?.length && gridRef.current?.api) {
        gridRef.current?.api.setRowData(data);
        return true;
      }
      return false;
    },
    variables: { partyId },
  });

  return (
    <FundingPaymentsTable
      ref={gridRef}
      rowData={data}
      onMarketClick={onMarketClick}
      overlayNoRowsTemplate={error ? error.message : t('No funding payments')}
      {...gridProps}
    />
  );
};
