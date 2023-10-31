import type { AgGridReact } from 'ag-grid-react';
import { useCallback, useRef, useState } from 'react';
import { t } from '@vegaprotocol/i18n';
import { FillsTable } from './fills-table';
import type { useDataGridEvents } from '@vegaprotocol/datagrid';
import { Pagination } from '@vegaprotocol/datagrid';
import { useDataProvider } from '@vegaprotocol/data-provider';
import type * as Schema from '@vegaprotocol/types';
import { fillsWithMarketProvider } from './fills-data-provider';

interface FillsManagerProps {
  partyId: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  gridProps: ReturnType<typeof useDataGridEvents>;
}

export const FillsManager = ({
  partyId,
  onMarketClick,
  gridProps,
}: FillsManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const filter: Schema.TradesFilter | Schema.TradesSubscriptionFilter = {
    partyIds: [partyId],
  };
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
    dataProvider: fillsWithMarketProvider,
    variables: { filter },
  });
  return (
    <div className="flex flex-col h-full">
      <FillsTable
        ref={gridRef}
        rowData={data}
        onFilterChanged={(event) => {
          onRowDataUpdated(event);
          onFilterChanged(event);
        }}
        onRowDataUpdated={onRowDataUpdated}
        partyId={partyId}
        onMarketClick={onMarketClick}
        overlayNoRowsTemplate={error ? error.message : t('No fills')}
        {...props}
      />
      <Pagination
        count={data?.length || 0}
        pageInfo={pageInfo}
        showRetentionMessage={true}
        onLoad={load}
        hasDisplayedRows={hasDisplayedRow || false}
      />
    </div>
  );
};
