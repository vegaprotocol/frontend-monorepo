import { useDataProvider } from '@vegaprotocol/data-provider';
import { tradesWithMarketProvider } from './trades-data-provider';
import { TradesTable } from './trades-table';
import { useDealTicketFormValues } from '@vegaprotocol/deal-ticket';
import { t } from '@vegaprotocol/i18n';
import { Pagination } from '@vegaprotocol/datagrid';
import type { useDataGridEvents } from '@vegaprotocol/datagrid';
import { useCallback, useState } from 'react';
import type { AgGridReact } from 'ag-grid-react';

interface TradesContainerProps {
  marketId: string;
  gridProps: ReturnType<typeof useDataGridEvents>;
}

export const TradesManager = ({
  marketId,
  gridProps,
}: TradesContainerProps) => {
  const update = useDealTicketFormValues((state) => state.updateAll);

  const { data, error, load, pageInfo } = useDataProvider({
    dataProvider: tradesWithMarketProvider,
    variables: { marketId },
  });
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

  return (
    <div className="flex flex-col h-full">
      <TradesTable
        rowData={data}
        onClick={(price?: string) => {
          update(marketId, { price });
        }}
        onFilterChanged={(event) => {
          onRowDataUpdated(event);
          onFilterChanged(event);
        }}
        onRowDataUpdated={onRowDataUpdated}
        overlayNoRowsTemplate={error ? error.message : t('No trades')}
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
