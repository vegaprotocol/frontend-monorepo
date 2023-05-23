import { useCallback, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import type { Position } from './positions-data-providers';
import { positionsMetricsProvider } from './positions-data-providers';
import type { PositionsQueryVariables } from './__generated__/Positions';
import { updateGridData } from '@vegaprotocol/datagrid';
import { useDataProvider } from '@vegaprotocol/data-provider';
import type { GetRowsParams } from '@vegaprotocol/datagrid';
import isEqual from 'lodash/isEqual';

export const getRowId = ({
  data,
}: {
  data: Position & { isLastPlaceholder?: boolean; id?: string };
}) =>
  data.isLastPlaceholder && data.id
    ? data.id
    : `${data.partyId}-${data.marketId}`;

export const usePositionsData = (
  partyIds: string[],
  gridRef: RefObject<AgGridReact>
) => {
  const variables = useMemo<PositionsQueryVariables>(
    () => ({ partyIds }),
    [partyIds]
  );
  const dataRef = useRef<Position[] | null>(null);
  const update = useCallback(
    ({ data }: { data: Position[] | null }) => {
      if (gridRef.current?.api?.getModel().getType() === 'infinite') {
        return updateGridData(dataRef, data, gridRef);
      }

      const update: Position[] = [];
      const add: Position[] = [];
      data?.forEach((row) => {
        const rowNode = gridRef.current?.api?.getRowNode(
          getRowId({ data: row })
        );
        if (rowNode) {
          if (!isEqual(rowNode.data, row)) {
            update.push(row);
          }
        } else {
          add.push(row);
        }
      });
      gridRef.current?.api?.applyTransaction({
        update,
        add,
        addIndex: 0,
      });
      return true;
    },
    [gridRef]
  );
  const { data, error, loading, reload } = useDataProvider({
    dataProvider: positionsMetricsProvider,
    update,
    variables,
  });
  const getRows = useCallback(
    async ({ successCallback, startRow, endRow }: GetRowsParams<Position>) => {
      const rowsThisBlock = dataRef.current
        ? dataRef.current.slice(startRow, endRow)
        : [];
      const lastRow = dataRef.current ? dataRef.current.length : 0;
      successCallback(rowsThisBlock, lastRow);
    },
    []
  );
  return {
    data,
    error,
    loading,
    getRows,
    reload,
  };
};
