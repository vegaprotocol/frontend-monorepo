import type { IGetRowsParams } from 'ag-grid-community';
import type { Load } from './generic-data-provider';
import type { MutableRefObject } from 'react';

const getLastRow = (
  startRow: number,
  endRow: number,
  blockLength: number,
  totalCount?: number
) => {
  let lastRow = -1;
  if (totalCount !== undefined) {
    if (!totalCount) {
      lastRow = 0;
    } else if (totalCount <= endRow) {
      lastRow = totalCount;
    }
  } else if (blockLength < endRow - startRow) {
    lastRow = blockLength;
  }
  return lastRow;
};

export const makeInfiniteScrollGetRows =
  <T extends { node: any }>( // eslint-disable-line @typescript-eslint/no-explicit-any
    newRows: MutableRefObject<number>,
    data: MutableRefObject<(T | null)[] | null>,
    totalCount: MutableRefObject<number | undefined>,
    load: Load<(T | null)[]>
  ) =>
  async ({
    successCallback,
    failCallback,
    startRow,
    endRow,
  }: IGetRowsParams) => {
    startRow += newRows.current;
    endRow += newRows.current;
    try {
      if (data.current && data.current.indexOf(null) < endRow) {
        await load();
      }
      const rowsThisBlock = data.current
        ? data.current.slice(startRow, endRow).map((edge) => edge?.node)
        : [];
      successCallback(
        rowsThisBlock,
        getLastRow(startRow, endRow, rowsThisBlock.length, totalCount.current)
      );
    } catch (e) {
      failCallback();
    }
  };
