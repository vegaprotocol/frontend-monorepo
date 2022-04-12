import { forwardRef } from 'react';
import type { ValueFormatterParams } from 'ag-grid-community';
import {
  PriceCell,
  VolCell,
  CummulativeVolCell,
  formatNumber,
  t,
} from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import type { AgGridReact } from 'ag-grid-react';
import type { OrderbookData } from './orderbook-data';
interface OrderbookValueFormatterParams extends ValueFormatterParams {
  data: OrderbookData;
}

interface OrderbookProps {
  data: OrderbookData[] | null;
  decimalPlaces: number;
}

export const getRowNodeId = (data: OrderbookData) => data.price.toString();

export const Orderbook = forwardRef<AgGridReact, OrderbookProps>(
  ({ data, decimalPlaces }, ref) => {
    return (
      <AgGrid
        style={{ width: '100%', height: '100%' }}
        overlayNoRowsTemplate={t('No orders')}
        rowData={data}
        getRowNodeId={getRowNodeId}
        ref={ref}
        defaultColDef={{
          flex: 1,
          resizable: true,
        }}
        components={{ PriceCell, VolCell, CummulativeVolCell }}
      >
        <AgGridColumn
          headerName={t('Bid Vol')}
          field="bidVol"
          type="rightAligned"
          cellRenderer="VolCell"
          valueFormatter={({ value, data }: OrderbookValueFormatterParams) => ({
            vol: value,
            relativeVol: data.relativeBidVol,
            type: 'bid',
          })}
        />
        <AgGridColumn
          headerName={t('Price')}
          field="price"
          cellRenderer="PriceCell"
          type="rightAligned"
          valueFormatter={({ value }: OrderbookValueFormatterParams) =>
            formatNumber(value, decimalPlaces)
          }
          sortable
          sortingOrder={['desc']}
        />
        <AgGridColumn
          headerName={t('Ask Vol')}
          field="askVol"
          cellRenderer="VolCell"
          type="rightAligned"
          valueFormatter={({ value, data }: OrderbookValueFormatterParams) => ({
            vol: value,
            relativeVol: data.relativeAskVol,
            type: 'ask',
          })}
        />
        <AgGridColumn
          headerName={t('Cumulative Vol')}
          type="rightAligned"
          field="cummulativeVol"
          cellRenderer="CummulativeVolCell"
        />
      </AgGrid>
    );
  }
);

export default Orderbook;
