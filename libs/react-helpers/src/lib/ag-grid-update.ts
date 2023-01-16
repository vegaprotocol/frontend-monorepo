import type { MutableRefObject, RefObject } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import type { IGetRowsParams } from 'ag-grid-community';
type AnyArray = Array<any> | null; // eslint-disable-line @typescript-eslint/no-explicit-any
export const isXOrWasEmpty = (prev?: AnyArray, curr?: AnyArray) =>
  Boolean(Number(!!prev?.length) ^ Number(!!curr?.length));

export const updateGridData = (
  dataRef: MutableRefObject<AnyArray>,
  data: AnyArray,
  gridRef: RefObject<AgGridReact>
) => {
  const rerender = isXOrWasEmpty(dataRef.current, data);
  dataRef.current = data;
  gridRef.current?.api?.refreshInfiniteCache();
  return !rerender;
};

export const makeGetRows =
  (dataRef: MutableRefObject<AnyArray>) =>
  () =>
  async ({ successCallback, startRow, endRow }: IGetRowsParams) => {
    const rowsThisBlock = dataRef.current
      ? dataRef.current.slice(startRow, endRow)
      : [];
    const lastRow = dataRef.current ? dataRef.current.length : 0;
    successCallback(rowsThisBlock, lastRow);
  };
