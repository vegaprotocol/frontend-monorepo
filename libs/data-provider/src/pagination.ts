import type { IGetRowsParams } from 'ag-grid-community';
import {
  type Edge,
  type Load,
  type DerivedPart,
  type Node,
} from './generic-data-provider';
import type { MutableRefObject } from 'react';

const getLastRow = (
  startRow: number,
  endRow: number,
  blockLength: number,
  totalCount?: number
) => {
  let lastRow = undefined;
  if (totalCount !== undefined) {
    if (!totalCount) {
      lastRow = 0;
    } else if (totalCount <= endRow) {
      lastRow = totalCount;
    }
  } else if (blockLength < endRow - startRow) {
    lastRow = blockLength + startRow;
  }
  return lastRow;
};

export const makeInfiniteScrollGetRows =
  <T extends { node: any }>( // eslint-disable-line @typescript-eslint/no-explicit-any
    data: MutableRefObject<(T | null)[] | null>,
    totalCount: MutableRefObject<number | undefined>,
    load: Load<(T | null)[]>,
    newRows?: MutableRefObject<number>
  ) =>
  async ({
    successCallback,
    failCallback,
    startRow,
    endRow,
  }: IGetRowsParams) => {
    startRow += newRows?.current ?? 0;
    endRow += newRows?.current ?? 0;
    try {
      if (data.current) {
        const firstMissingRowIndex = data.current.indexOf(null);
        if (
          endRow > data.current.length ||
          (firstMissingRowIndex !== -1 && firstMissingRowIndex < endRow)
        ) {
          await load();
        }
      }
      const rowsThisBlock = data.current
        ? data.current.slice(startRow, endRow).map((edge) => edge?.node)
        : [];
      const currentLastNumber = getLastRow(
        startRow,
        endRow,
        rowsThisBlock.length,
        totalCount.current
      );
      const lastRow = currentLastNumber
        ? currentLastNumber - (newRows?.current ?? 0)
        : currentLastNumber;
      successCallback(rowsThisBlock, lastRow);
    } catch (e) {
      failCallback();
    }
  };

export const paginatedCombineDelta = <
  DataNode extends Node,
  DeltaNode extends Node
>(
  data: (Edge<DataNode> | null)[],
  parts: DerivedPart[]
): DataNode[] | undefined => {
  if (!parts[0].isUpdate) {
    return;
  }
  const updatedIds = (parts[0].delta as DeltaNode[]).map((node) => node.id);
  return data
    .filter<Edge<DataNode>>(
      (edge): edge is Edge<DataNode> =>
        edge !== null && updatedIds.includes(edge.node.id)
    )
    .map((edge) => edge.node);
};

export const paginatedCombineInsertionData = <DataNode extends Node>(
  data: (Edge<DataNode> | null)[],
  parts: DerivedPart[]
): Edge<DataNode>[] | undefined => {
  if (!parts[0].isInsert) {
    return;
  }
  const insertedIds = (parts[0].insertionData as DataNode[]).map(
    (node) => node.id
  );
  // get updated orders
  return data.filter<Edge<DataNode>>(
    (edge): edge is Edge<DataNode> =>
      edge !== null && insertedIds.includes(edge.node.id)
  );
};
