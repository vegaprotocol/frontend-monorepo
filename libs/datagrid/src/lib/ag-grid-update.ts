import type { MutableRefObject, RefObject } from 'react';
import type { AgGridReact } from 'ag-grid-react';

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
  if (gridRef.current?.api?.getModel().getType() === 'infinite') {
    gridRef.current?.api?.refreshInfiniteCache();
  }
  return !rerender;
};
