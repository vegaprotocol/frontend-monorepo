import type { AgGridReact } from 'ag-grid-react';
import { useCallback, useRef, useState } from 'react';
import { t } from '@vegaprotocol/i18n';
import { FillsTable } from './fills-table';
import type { useDataGridEvents } from '@vegaprotocol/datagrid';
import { useDataProvider } from '@vegaprotocol/data-provider';
import type * as Schema from '@vegaprotocol/types';
import { fillsWithMarketProvider } from './fills-data-provider';
import { TradingButton as Button } from '@vegaprotocol/ui-toolkit';

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
  const [displayedRowCount, setDisplayedRowCount] = useState<
    number | undefined
  >(undefined);
  const { onFilterChanged, ...props } = gridProps || {};
  const onRowDataUpdated = useCallback(
    ({ api }: { api: AgGridReact['api'] }) => {
      setDisplayedRowCount(api.getDisplayedRowCount());
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

      <div className="flex justify-between border-t border-default p-1 items-center">
        <div className="text-xs">
          {t(
            'Depending on data node retention you may not be able see the "full" history'
          )}
        </div>
        <div className="flex text-xs items-center">
          {data?.length && !pageInfo?.hasNextPage
            ? t('all %s items loaded', [data.length.toString()])
            : t('%s items loaded', [
                data?.length ? data.length.toString() : ' ',
              ])}
          {pageInfo?.hasNextPage ? (
            <Button size="extra-small" className="ml-1" onClick={() => load()}>
              {t('Load more')}
            </Button>
          ) : null}
        </div>
        {data?.length && displayedRowCount === 0 ? (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs">
            {t('No fills matching selected filters')}
          </div>
        ) : null}
      </div>
    </div>
  );
};
