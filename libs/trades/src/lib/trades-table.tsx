import { useMemo } from 'react';
import type { ColDef } from 'ag-grid-community';
import type {
  VegaICellRendererParams,
  VegaValueFormatterParams,
} from '@vegaprotocol/datagrid';
import { AgGridLazy as AgGrid, NumericCell } from '@vegaprotocol/datagrid';
import {
  addDecimal,
  addDecimalsFormatNumber,
  getTimeFormat,
} from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import type { IDatasource, IGetRowsParams } from 'ag-grid-community';
import type { CellClassParams } from 'ag-grid-community';
import type { AgGridReactProps } from 'ag-grid-react';
import type { Trade } from './trades-data-provider';
import { Side } from '@vegaprotocol/types';

export const BUY_CLASS = 'text-market-green-600 dark:text-market-green';
export const SELL_CLASS = 'text-market-red dark:text-market-red';

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

export const TradesTable = ({ onClick, ...props }: Props) => {
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: t('Price'),
        field: 'price',
        type: 'rightAligned',
        cellClass: changeCellClass,
        valueFormatter: ({
          value,
          data,
        }: VegaValueFormatterParams<Trade, 'price'>) => {
          if (!value || !data?.market) {
            return '';
          }
          return addDecimalsFormatNumber(value, data.market.decimalPlaces);
        },
        cellRenderer: ({
          value,
          data,
        }: VegaICellRendererParams<Trade, 'price'>) => {
          if (!data?.market || !value) {
            return '';
          }
          return (
            <button
              onClick={() =>
                onClick &&
                onClick(addDecimal(value, data.market?.decimalPlaces || 0))
              }
              className="hover:dark:bg-vega-cdark-800 hover:bg-vega-clight-800"
            >
              {addDecimalsFormatNumber(value, data.market.decimalPlaces)}
            </button>
          );
        },
      },
      {
        headerName: t('Size'),
        field: 'size',
        type: 'rightAligned',
        valueFormatter: ({
          value,
          data,
        }: VegaValueFormatterParams<Trade, 'size'>) => {
          if (!value || !data?.market) {
            return '';
          }
          return addDecimalsFormatNumber(
            value,
            data.market.positionDecimalPlaces
          );
        },
        cellRenderer: NumericCell,
      },
      {
        headerName: t('Created at'),
        field: 'createdAt',
        type: 'rightAligned',
        cellClass: 'text-right',
        flex: 1, // make created at always fill remaining space
        valueFormatter: ({
          value,
        }: VegaValueFormatterParams<Trade, 'createdAt'>) => {
          return value && getTimeFormat().format(new Date(value));
        },
      },
    ],
    [onClick]
  );
  return (
    <AgGrid
      getRowId={({ data }) => data.id}
      columnDefs={columnDefs}
      rowHeight={22}
      {...props}
    />
  );
};
