import type { Get } from 'type-fest';
import type {
  ICellRendererParams,
  ValueFormatterParams,
  ValueGetterParams,
} from 'ag-grid-community';
import type { IDatasource, IGetRowsParams, RowNode } from 'ag-grid-community';
import type { AgGridReactProps } from 'ag-grid-react';

type Field = string | readonly string[];

type RowHelper<TObj, TRow, TField extends Field> = Omit<
  TObj,
  'data' | 'value' | 'node'
> & {
  data?: TRow;
  value?: Get<TRow, TField>;
  node: Omit<RowNode, 'data'> & { data?: TRow };
};

export type VegaValueFormatterParams<TRow, TField extends Field> = RowHelper<
  ValueFormatterParams,
  TRow,
  TField
>;

export type VegaValueGetterParams<TRow, TField extends Field> = RowHelper<
  ValueGetterParams,
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
