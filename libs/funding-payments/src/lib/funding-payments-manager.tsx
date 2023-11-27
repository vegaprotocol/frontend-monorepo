import { type AgGridReact } from 'ag-grid-react';
import { useCallback, useRef, useState } from 'react';
import { FundingPaymentsTable } from './funding-payments-table';
import { Pagination } from '@vegaprotocol/datagrid';
import { type useDataGridEvents } from '@vegaprotocol/datagrid';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { fundingPaymentsWithMarketProvider } from './funding-payments-data-provider';
import { useT } from './use-t';

interface FundingPaymentsManagerProps {
  partyId: string;
  marketId?: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  gridProps: ReturnType<typeof useDataGridEvents>;
}

export const FundingPaymentsManager = ({
  partyId,
  marketId,
  onMarketClick,
  gridProps,
}: FundingPaymentsManagerProps) => {
  const t = useT();
  const gridRef = useRef<AgGridReact | null>(null);
  const [hasDisplayedRow, setHasDisplayedRow] = useState<boolean | undefined>(
    undefined
  );
  const { onFilterChanged, ...props } = gridProps || {};
  const onRowDataUpdated = useCallback(
    ({ api }: { api: AgGridReact['api'] }) => {
      setHasDisplayedRow(!!api.getDisplayedRowCount());
    },
    []
  );
  const { data, error, load, pageInfo } = useDataProvider({
    dataProvider: fundingPaymentsWithMarketProvider,
    update: ({ data }) => {
      if (data?.length && gridRef.current?.api) {
        gridRef.current?.api.setRowData(data);
        return true;
      }
      return false;
    },
    variables: { partyId, marketId },
  });

  return (
    <div className="flex h-full flex-col">
      <FundingPaymentsTable
        ref={gridRef}
        rowData={data}
        onMarketClick={onMarketClick}
        onFilterChanged={(event) => {
          onRowDataUpdated(event);
          onFilterChanged(event);
        }}
        onRowDataUpdated={onRowDataUpdated}
        overlayNoRowsTemplate={error ? error.message : t('No funding payments')}
        {...props}
      />
      <Pagination
        count={data?.length || 0}
        pageInfo={pageInfo}
        onLoad={load}
        hasDisplayedRows={hasDisplayedRow || false}
        showRetentionMessage={true}
      />
    </div>
  );
};
