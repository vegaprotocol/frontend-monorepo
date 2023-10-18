import type { AgGridReact } from 'ag-grid-react';
import { useRef, useState } from 'react';
import { t } from '@vegaprotocol/i18n';
import { FillsTable } from './fills-table';
import type { useDataGridEvents } from '@vegaprotocol/datagrid';
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
  const [dateRange, setDateRange] = useState<Schema.DateRange | null>(null);
  const { data, error } = useDataProvider({
    dataProvider: fillsWithMarketProvider,
    update: ({ data }) => {
      if (data?.length && gridRef.current?.api) {
        gridRef.current?.api.setRowData(data);
        return true;
      }
      return false;
    },
    variables: { filter, dateRange },
  });
  const { onFilterChanged, ...props } = gridProps;
  const overlayNoRowsTemplate = dateRange
    ? t('No fills matching selected date range')
    : t('No fills');
  return (
    <FillsTable
      ref={gridRef}
      rowData={data}
      onFilterChanged={(event) => {
        const { api } = event;
        const filterModel = api.getFilterModel();
        if (filterModel['createdAt']?.value) {
          if (
            filterModel['createdAt'].value.start !== dateRange?.start ||
            filterModel['createdAt'].value.end !== dateRange?.end
          ) {
            setDateRange(filterModel['createdAt'].value);
          }
        } else {
          setDateRange(null);
        }
        onFilterChanged(event);
      }}
      partyId={partyId}
      onMarketClick={onMarketClick}
      overlayNoRowsTemplate={error ? error.message : overlayNoRowsTemplate}
      {...props}
    />
  );
};
