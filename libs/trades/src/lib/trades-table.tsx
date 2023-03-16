import type { AgGridReact } from 'ag-grid-react';
import { AgGridColumn } from 'ag-grid-react';
import { forwardRef } from 'react';
import type {
  VegaICellRendererParams,
  VegaValueFormatterParams,
} from '@vegaprotocol/datagrid';
import { AgGridDynamic as AgGrid, NumericCell } from '@vegaprotocol/datagrid';
import {
  addDecimal,
  addDecimalsFormatNumber,
  getDateTimeFormat,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import type { IDatasource, IGetRowsParams } from 'ag-grid-community';
import type { CellClassParams } from 'ag-grid-community';
import type { AgGridReactProps } from 'ag-grid-react';
import type { Trade } from './trades-data-provider';
import { Side } from '@vegaprotocol/types';

export const BUY_CLASS = 'text-vega-green dark:text-vega-green';
export const SELL_CLASS = 'text-vega-pink dark:text-vega-pink';

const changeCellClass = ({ node }: CellClassParams) => {
  let colorClass = '';

  if (node.data?.aggressor === Side.SIDE_BUY) {
    colorClass = BUY_CLASS;
  } else if (node.data?.aggressor === Side.SIDE_SELL) {
    colorClass = SELL_CLASS;
  }

  return ['font-mono text-right', colorClass].join(' ');
};

export interface GetRowsParams extends Omit<IGetRowsParams, 'successCallback'> {
  successCallback(rowsThisBlock: (Trade | null)[], lastRow?: number): void;
}

export interface Datasource extends IDatasource {
  getRows(params: GetRowsParams): void;
}

interface Props extends AgGridReactProps {
  rowData?: Trade[] | null;
  datasource?: Datasource;
  onClick?: (price?: string) => void;
}

export const TradesTable = forwardRef<AgGridReact, Props>((props, ref) => {
  return (
    <AgGrid
      style={{ width: '100%', height: '100%' }}
      overlayNoRowsTemplate={t('No trades')}
      getRowId={({ data }) => data.id}
      ref={ref}
      defaultColDef={{
        flex: 1,
        resizable: true,
      }}
      {...props}
    >
      <AgGridColumn
        headerName={t('Price')}
        field="price"
        type="rightAligned"
        width={130}
        cellClass={changeCellClass}
        valueFormatter={({
          value,
          data,
        }: VegaValueFormatterParams<Trade, 'price'>) => {
          if (!value || !data?.market) {
            return null;
          }
          return addDecimalsFormatNumber(value, data.market.decimalPlaces);
        }}
        cellRenderer={({
          value,
          data,
        }: VegaICellRendererParams<Trade, 'price'>) => {
          if (!data?.market || !value) {
            return null;
          }
          return (
            <button
              onClick={() =>
                props.onClick &&
                props.onClick(
                  addDecimal(value, data.market?.decimalPlaces || 0)
                )
              }
              className="hover:dark:bg-neutral-800 hover:bg-neutral-200"
            >
              {addDecimalsFormatNumber(value, data.market.decimalPlaces)}
            </button>
          );
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
        }: VegaValueFormatterParams<Trade, 'size'>) => {
          if (!value || !data?.market) {
            return null;
          }
          return addDecimalsFormatNumber(
            value,
            data.market.positionDecimalPlaces
          );
        }}
        cellRenderer={NumericCell}
      />
      <AgGridColumn
        headerName={t('Created at')}
        field="createdAt"
        type="rightAligned"
        width={170}
        cellClass="text-right"
        valueFormatter={({
          value,
        }: VegaValueFormatterParams<Trade, 'createdAt'>) => {
          return value && getDateTimeFormat().format(new Date(value));
        }}
      />
    </AgGrid>
  );
});
