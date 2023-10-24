import { useDataProvider } from '@vegaprotocol/data-provider';
import { tradesWithMarketProvider } from './trades-data-provider';
import { TradesTable } from './trades-table';
import { useDealTicketFormValues } from '@vegaprotocol/deal-ticket';
import { t } from '@vegaprotocol/i18n';
import type { useDataGridEvents } from '@vegaprotocol/datagrid';
import { useCallback, useState } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import { TradingButton as Button } from '@vegaprotocol/ui-toolkit';

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
            {t('No trades matching selected filters')}
          </div>
        ) : null}
      </div>
    </div>
  );
};
