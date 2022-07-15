import type { AgGridReact } from 'ag-grid-react';
import { AgGridColumn } from 'ag-grid-react';
import { forwardRef } from 'react';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/ui-toolkit';
import {
  addDecimal,
  addDecimalsFormatNumber,
  getDateTimeFormat,
  t,
} from '@vegaprotocol/react-helpers';
import type { CellClassParams, ValueFormatterParams } from 'ag-grid-community';
import type { AgGridReactProps, AgReactUiProps } from 'ag-grid-react';
import type { Trades_market_tradesConnection_edges_node } from './__generated__/Trades';
import BigNumber from 'bignumber.js';

export const UP_CLASS = 'text-vega-green';
export const DOWN_CLASS = 'text-vega-red';

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

type Props = AgGridReactProps | AgReactUiProps;
interface TradesTableValueFormatterParams extends ValueFormatterParams {
  data: Trades_market_tradesConnection_edges_node | null;
}

export const TradesTable = forwardRef<AgGridReact, Props>((props, ref) => {
  return (
    <AgGrid
      style={{ width: '100%', height: '100%' }}
      overlayNoRowsTemplate={t('No trades')}
      getRowId={({ data }) => data.id}
      ref={ref}
      defaultColDef={{
        resizable: true,
      }}
      {...props}
    >
      <AgGridColumn
        headerName={t('Price')}
        field="price"
        width={130}
        cellClass={changeCellClass('price')}
        valueFormatter={({ value, data }: TradesTableValueFormatterParams) => {
          if (!data?.market) {
            return null;
          }
          return addDecimalsFormatNumber(value, data.market.decimalPlaces);
        }}
      />
      <AgGridColumn
        headerName={t('Size')}
        field="size"
        width={125}
        valueFormatter={({ value, data }: TradesTableValueFormatterParams) => {
          if (!data?.market) {
            return null;
          }
          return addDecimal(value, data.market.positionDecimalPlaces);
        }}
        cellClass={changeCellClass('size')}
      />
      <AgGridColumn
        headerName={t('Created at')}
        field="createdAt"
        width={170}
        valueFormatter={({ value }: TradesTableValueFormatterParams) => {
          return value && getDateTimeFormat().format(new Date(value));
        }}
      />
    </AgGrid>
  );
});
