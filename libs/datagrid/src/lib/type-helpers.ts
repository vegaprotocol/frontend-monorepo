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
  'data' | 'value'
> & {
  data?: TRow;
  value?: Get<TRow, TField>;
};

export type VegaValueFormatterParams<TRow, TField extends Field> = RowHelper<
  ValueFormatterParams,
  TRow,
  TField
>;

export type VegaValueGetterParams<TRow> = Omit<ValueGetterParams, 'data'> & {
  data?: TRow;
};

export type VegaICellRendererParams<TRow, TField extends Field = string> = Omit<
  RowHelper<ICellRendererParams, TRow, TField>,
  'node'
> & { node: NonNullable<RowHelper<ICellRendererParams, TRow, TField>['node']> };

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
