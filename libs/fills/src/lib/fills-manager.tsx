import type { AgGridReact } from 'ag-grid-react';
import { useRef } from 'react';
import { t } from '@vegaprotocol/i18n';
import { FillsTable } from './fills-table';
import type { useDataGridStore } from '@vegaprotocol/datagrid';
import { useDataProvider } from '@vegaprotocol/data-provider';
import type * as Schema from '@vegaprotocol/types';
import { fillsWithMarketProvider } from './fills-data-provider';

interface FillsManagerProps {
  partyId: string;
  marketId?: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  gridProps: ReturnType<typeof useDataGridStore>;
}

export const FillsManager = ({
  partyId,
  marketId,
  onMarketClick,
  gridProps,
}: FillsManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const filter: Schema.TradesFilter | Schema.TradesSubscriptionFilter = {
    partyIds: [partyId],
  };
  if (marketId) {
    filter.marketIds = [marketId];
  }
  const { data, error } = useDataProvider({
    dataProvider: fillsWithMarketProvider,
    update: ({ data }) => {
      if (data?.length && gridRef.current?.api) {
        gridRef.current?.api.setRowData(data);
        return true;
      }
      return false;
    },
    variables: { filter },
  });

  return (
    <FillsTable
      ref={gridRef}
      rowData={data}
      partyId={partyId}
      onMarketClick={onMarketClick}
      overlayNoRowsTemplate={error ? error.message : t('No fills')}
      {...gridProps}
    />
  );
};
