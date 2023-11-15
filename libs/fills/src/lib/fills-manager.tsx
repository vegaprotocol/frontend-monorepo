import { type AgGridReact } from 'ag-grid-react';
import { useCallback, useRef, useState } from 'react';
import { FillsTable } from './fills-table';
import { type useDataGridEvents } from '@vegaprotocol/datagrid';
import { Pagination } from '@vegaprotocol/datagrid';
import { useDataProvider } from '@vegaprotocol/data-provider';
import {
  type TradesFilter,
  type TradesSubscriptionFilter,
} from '@vegaprotocol/types';
import { fillsWithMarketProvider } from './fills-data-provider';
import { useT } from './use-t';

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
  const t = useT();
  const gridRef = useRef<AgGridReact | null>(null);
  const filter: TradesFilter | TradesSubscriptionFilter = {
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
    <div className="flex h-full flex-col">
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
