import { forwardRef } from 'react';
import type { ValueFormatterParams } from 'ag-grid-community';
import {
  PriceFlashCell,
  addDecimalsFormatNumber,
  t,
} from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import type {
  Markets_markets,
  Markets_markets_data_market,
} from './__generated__/Markets';
import { AgGridColumn } from 'ag-grid-react';
import type { AgGridReact } from 'ag-grid-react';

interface MarketListTableProps {
  data: Markets_markets[] | null;
  onRowClicked: (marketId: string) => void;
}

export const getRowId = ({
  data,
}: {
  data: Markets_markets | Markets_markets_data_market;
}) => data.id;

export const MarketListTable = forwardRef<AgGridReact, MarketListTableProps>(
  ({ data, onRowClicked }, ref) => {
    return (
      <AgGrid
        style={{ width: '100%', height: '100%' }}
        overlayNoRowsTemplate={t('No markets')}
        rowData={data}
        getRowId={getRowId}
        ref={ref}
        defaultColDef={{
          flex: 1,
          resizable: true,
        }}
        suppressCellFocus={true}
        onRowClicked={({ data }: { data: Markets_markets }) =>
          onRowClicked(data.id)
        }
        components={{ PriceFlashCell }}
      >
        <AgGridColumn
          headerName={t('Market')}
          field="tradableInstrument.instrument.code"
        />
        <AgGridColumn
          headerName={t('Settlement asset')}
          field="tradableInstrument.instrument.product.settlementAsset.symbol"
        />
        <AgGridColumn
          headerName={t('State')}
          field="data"
          valueFormatter={({ value }: ValueFormatterParams) =>
            `${value.market.state} (${value.market.tradingMode})`
          }
        />
        <AgGridColumn
          headerName={t('Best bid')}
          field="data.bestBidPrice"
          type="rightAligned"
          cellRenderer="PriceFlashCell"
          valueFormatter={({ value, data }: ValueFormatterParams) =>
            addDecimalsFormatNumber(value, data.decimalPlaces)
          }
        />
        <AgGridColumn
          headerName={t('Best offer')}
          field="data.bestOfferPrice"
          type="rightAligned"
          valueFormatter={({ value, data }: ValueFormatterParams) =>
            addDecimalsFormatNumber(value, data.decimalPlaces)
          }
          cellRenderer="PriceFlashCell"
        />
        <AgGridColumn
          headerName={t('Mark price')}
          field="data.markPrice"
          type="rightAligned"
          cellRenderer="PriceFlashCell"
          valueFormatter={({ value, data }: ValueFormatterParams) =>
            addDecimalsFormatNumber(value, data.decimalPlaces)
          }
        />
        <AgGridColumn headerName={t('Description')} field="name" />
      </AgGrid>
    );
  }
);

export default MarketListTable;
