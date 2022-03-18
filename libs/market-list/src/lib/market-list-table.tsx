import type { GridApi, ValueFormatterParams } from 'ag-grid-community';
import {
  PriceCell,
  formatNumber,
  useApplyGridTransaction,
} from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { Markets_markets } from '@vegaprotocol/graphql';
import { AgGridColumn } from 'ag-grid-react';
import { useRef, useState } from 'react';

interface MarketListTableProps {
  markets: Markets_markets[];
  onRowClicked: (marketId: string) => void;
}

export const MarketListTable = ({
  markets,
  onRowClicked,
}: MarketListTableProps) => {
  const [initialMarkets] = useState(markets);
  const gridApi = useRef<GridApi | null>(null);
  useApplyGridTransaction<Markets_markets>(markets, gridApi.current);

  return (
    <AgGrid
      style={{ width: '100%', height: '100%' }}
      overlayNoRowsTemplate="No markets"
      rowData={initialMarkets}
      getRowNodeId={(data) => data.id}
      defaultColDef={{
        flex: 1,
        resizable: true,
      }}
      onGridReady={(params) => {
        gridApi.current = params.api;
      }}
      onRowClicked={({ data }) => onRowClicked(data.id)}
      components={{ PriceCell }}
    >
      <AgGridColumn
        headerName="Market"
        field="tradableInstrument.instrument.code"
      />
      <AgGridColumn
        headerName="Settlement asset"
        field="tradableInstrument.instrument.product.settlementAsset.symbol"
      />
      <AgGridColumn
        headerName="State"
        field="data"
        valueFormatter={({ value }: ValueFormatterParams) =>
          `${value.market.state} (${value.market.tradingMode})`
        }
      />
      <AgGridColumn
        headerName="Best bid"
        field="data.bestBidPrice"
        type="rightAligned"
        cellRenderer="PriceCell"
        valueFormatter={({ value, data }: ValueFormatterParams) =>
          formatNumber(value, data.decimalPlaces)
        }
      />
      <AgGridColumn
        headerName="Best offer"
        field="data.bestOfferPrice"
        type="rightAligned"
        valueFormatter={({ value, data }: ValueFormatterParams) =>
          formatNumber(value, data.decimalPlaces)
        }
        cellRenderer="PriceCell"
      />
      <AgGridColumn
        headerName="Mark price"
        field="data.markPrice"
        type="rightAligned"
        cellRenderer="PriceCell"
        valueFormatter={({ value, data }: ValueFormatterParams) =>
          formatNumber(value, data.decimalPlaces)
        }
      />
      <AgGridColumn headerName="Description" field="name" />
    </AgGrid>
  );
};

export default MarketListTable;
