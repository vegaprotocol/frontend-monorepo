import type { AgGridReact } from 'ag-grid-react';
import { AgGridColumn } from 'ag-grid-react';
import { forwardRef, useMemo } from 'react';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import type { TradeFields } from './__generated__/TradeFields';
import {
  formatNumber,
  getDateTimeFormat,
  t,
} from '@vegaprotocol/react-helpers';
import type { CellClassParams, ValueFormatterParams } from 'ag-grid-community';
import BigNumber from 'bignumber.js';
import { sortTrades } from './trades-data-provider';

export const UP_CLASS = 'text-vega-green';
export const DOWN_CLASS = 'text-vega-pink';

const changeCellClass =
  (dataKey: string) =>
  ({ api, value, node }: CellClassParams) => {
    const rowIndex = node?.rowIndex;
    let colorClass = '';

    if (typeof rowIndex === 'number') {
      const prevRowNode = api.getModel().getRow(rowIndex + 1);
      const prevValue = prevRowNode?.data[dataKey];
      const valueNum = new BigNumber(value);

      if (valueNum.isGreaterThan(prevValue)) {
        colorClass = UP_CLASS;
      } else if (valueNum.isLessThan(prevValue)) {
        colorClass = DOWN_CLASS;
      }
    }

    return ['font-mono', colorClass].join(' ');
  };

interface TradesTableProps {
  data: TradeFields[] | null;
}

export const TradesTable = forwardRef<AgGridReact, TradesTableProps>(
  ({ data }, ref) => {
    // Sort intial trades
    const trades = useMemo(() => {
      if (!data) {
        return null;
      }
      return sortTrades(data);
    }, [data]);

    return (
      <AgGrid
        style={{ width: '100%', height: '100%' }}
        overlayNoRowsTemplate={t('No trades')}
        rowData={trades}
        getRowNodeId={(data) => data.id}
        ref={ref}
        defaultColDef={{
          flex: 1,
          resizable: true,
        }}
      >
        <AgGridColumn
          headerName={t('Price')}
          field="price"
          cellClass={changeCellClass('price')}
          valueFormatter={({ value, data }: ValueFormatterParams) => {
            return formatNumber(value, data.market.decimalPlaces);
          }}
        />
        <AgGridColumn
          headerName={t('Size')}
          field="size"
          cellClass={changeCellClass('size')}
        />
        <AgGridColumn
          headerName={t('Created at')}
          field="createdAt"
          valueFormatter={({ value }: ValueFormatterParams) => {
            return getDateTimeFormat().format(new Date(value));
          }}
        />
      </AgGrid>
    );
  }
);
