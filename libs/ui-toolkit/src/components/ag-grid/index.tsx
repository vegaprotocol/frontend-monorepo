import type { Get } from 'type-fest';
import type {
  ICellRendererParams,
  ValueFormatterParams,
} from 'ag-grid-community';

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
