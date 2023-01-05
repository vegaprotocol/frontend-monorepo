import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { MarketListTable } from './market-list-table';
import type { RowClickedEvent } from 'ag-grid-community';
import type { MarketWithData } from '../../markets-provider';
import { useMarkets } from '../../use-markets';
import { useEffect, useRef, useState } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import type { MarketX } from '../../use-market';
interface MarketsContainerProps {
  onSelect: (marketId: string) => void;
}

export const MarketsContainer = ({ onSelect }: MarketsContainerProps) => {
  const { markets, loading, error } = useMarkets();

  return (
    <AsyncRenderer loading={loading} error={error} data={markets}>
      <MarketListTable
        rowData={markets}
        onRowClicked={(rowEvent: RowClickedEvent) => {
          const { data, event } = rowEvent;
          // filters out clicks on the symbol column because it should display asset details
          if (
            (event?.target as HTMLElement).tagName.toUpperCase() === 'BUTTON'
          ) {
            return;
          }
          onSelect((data as MarketWithData).id);
        }}
      />
    </AsyncRenderer>
  );
};
