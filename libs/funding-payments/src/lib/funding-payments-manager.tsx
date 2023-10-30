import type { AgGridReact } from 'ag-grid-react';
import { useCallback, useRef, useState } from 'react';
import { t } from '@vegaprotocol/i18n';
import { FundingPaymentsTable } from './funding-payments-table';
import type { useDataGridEvents } from '@vegaprotocol/datagrid';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { fundingPaymentsWithMarketProvider } from './funding-payments-data-provider';
import { TradingButton as Button } from '@vegaprotocol/ui-toolkit';

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
    <div className="flex flex-col h-full">
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
        {data?.length && hasDisplayedRow === false ? (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs">
            {t('No funding payments matching selected filters')}
          </div>
        ) : null}
      </div>
    </div>
  );
};
