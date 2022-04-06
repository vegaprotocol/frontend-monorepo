import { forwardRef } from 'react';
import type { ValueFormatterParams } from 'ag-grid-community';
import {
  PriceCell,
  VolCell,
  CummulativeVolCell,
  formatNumber,
  addDecimal,
  t,
} from '@vegaprotocol/react-helpers';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import { AgGridColumn } from 'ag-grid-react';
import type { AgGridReact } from 'ag-grid-react';

export interface OrderbookData {
  bidVol: string;
  relativeBidVol: string;
  askVol: string;
  relativeAskVol: string;
  price: string;
  cummulativeVol: {
    bid: number;
    ask: number;
  };
}
interface OrderbookValueFormatterParams extends ValueFormatterParams {
  data: OrderbookData;
}

interface OrderbookProps {
  data: OrderbookData[] | null;
  decimalPlaces: number;
}

export const getRowNodeId = (data: OrderbookData) => data.price;

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
          cellRenderer="VolCell"
          valueFormatter={({ value, data }: OrderbookValueFormatterParams) => ({
            vol: formatNumber(value, decimalPlaces),
            relativeVol: data.relativeBidVol,
            type: 'bid',
          })}
        />
        <AgGridColumn
          headerName={t('Price')}
          cellRenderer="PriceCell"
          valueFormatter={({ value }: OrderbookValueFormatterParams) =>
            formatNumber(value, decimalPlaces)
          }
        />
        <AgGridColumn
          headerName={t('Ask Vol')}
          field="askVol"
          cellRenderer="VolCell"
          valueFormatter={({ value, data }: OrderbookValueFormatterParams) => ({
            vol: formatNumber(value, decimalPlaces),
            relativeVol: data.relativeAskVol,
            type: 'ask',
          })}
        />
        <AgGridColumn
          headerName={t('Cumulative Vol')}
          field="cummulativeVol"
          cellRenderer="CummulativeVolCell"
        />
      </AgGrid>
    );
  }
);

export default Orderbook;
