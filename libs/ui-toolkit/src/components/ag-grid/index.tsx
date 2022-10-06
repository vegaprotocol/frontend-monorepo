import type { Get } from 'type-fest';
import type {
  ICellRendererParams,
  ValueFormatterParams,
} from 'ag-grid-community';

import type { IDatasource, IGetRowsParams } from 'ag-grid-community';
import type { AgGridReactProps } from 'ag-grid-react';

export * from './ag-grid-lazy';
export * from './ag-grid-dynamic';

type Field = string | readonly string[];

type RowHelper<TObj, TRow, TField extends Field> = Omit<
  TObj,
  'data' | 'value'
> & {
  data: TRow;
  value: Get<TRow, TField>;
};

export type VegaValueFormatterParams<TRow, TField extends Field> = RowHelper<
  ValueFormatterParams,
  TRow,
  TField
>;

export type VegaICellRendererParams<
  TRow,
  TField extends Field = string
> = RowHelper<ICellRendererParams, TRow, TField>;

export interface GetRowsParams<T> extends IGetRowsParams {
  successCallback(rowsThisBlock: T[], lastRow?: number): void;
}

export interface Datasource<T> extends IDatasource {
  getRows(params: GetRowsParams<T>): void;
}

export interface TypedDataAgGrid<T> extends AgGridReactProps {
  rowData?: T[] | null;
  datasource?: Datasource<T>;
}
