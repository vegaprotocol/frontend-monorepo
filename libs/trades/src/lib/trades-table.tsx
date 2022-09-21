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
import type { IDatasource, IGetRowsParams } from 'ag-grid-community';
import type { CellClassParams, ValueFormatterParams } from 'ag-grid-community';
import type { AgGridReactProps } from 'ag-grid-react';
import type { TradeWithMarket } from './trades-data-provider';
import BigNumber from 'bignumber.js';

export const UP_CLASS = 'text-vega-green-dark dark:text-vega-green';
export const DOWN_CLASS = 'text-vega-red-dark dark:text-vega-red';

const changeCellClass =
  (dataKey: string) =>
  ({ api, value, node }: CellClassParams) => {
    const rowIndex = node?.rowIndex;
    let colorClass = '';

    if (typeof rowIndex === 'number') {
      const prevRowNode = api.getModel().getRow(rowIndex + 1);
      const prevValue = prevRowNode?.data && prevRowNode.data[dataKey];
      const valueNum = new BigNumber(value);

      if (valueNum.isGreaterThan(prevValue)) {
        colorClass = UP_CLASS;
      } else if (valueNum.isLessThan(prevValue)) {
        colorClass = DOWN_CLASS;
      }
    }

    return ['font-mono text-right', colorClass].join(' ');
  };

export interface GetRowsParams extends Omit<IGetRowsParams, 'successCallback'> {
  successCallback(
    rowsThisBlock: (TradeWithMarket | null)[],
    lastRow?: number
  ): void;
}

export interface Datasource extends IDatasource {
  getRows(params: GetRowsParams): void;
}

interface Props extends AgGridReactProps {
  rowData?: TradeWithMarket[] | null;
  datasource?: Datasource;
}

type TradesTableValueFormatterParams = Omit<
  ValueFormatterParams,
  'data' | 'value'
> & {
  data: TradeWithMarket | null;
};

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
        type="rightAligned"
        width={130}
        cellClass={changeCellClass('price')}
        valueFormatter={({
          value,
          data,
        }: TradesTableValueFormatterParams & {
          value: TradeWithMarket['price'];
        }) => {
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
        type="rightAligned"
        valueFormatter={({
          value,
          data,
        }: TradesTableValueFormatterParams & {
          value: TradeWithMarket['size'];
        }) => {
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
        valueFormatter={({
          value,
        }: TradesTableValueFormatterParams & {
          value: TradeWithMarket['createdAt'];
        }) => {
          return value && getDateTimeFormat().format(new Date(value));
        }}
      />
    </AgGrid>
  );
});
