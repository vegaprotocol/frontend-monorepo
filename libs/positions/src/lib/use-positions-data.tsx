import { useCallback, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import type { Position } from './positions-data-providers';
import { positionsMetricsProvider } from './positions-data-providers';
import type { PositionsQueryVariables } from './__generated__/Positions';
import { useDataProvider, updateGridData } from '@vegaprotocol/react-helpers';
import type { GetRowsParams } from '@vegaprotocol/datagrid';

export const getRowId = ({ data }: { data: Position }) => data.marketId;

export const usePositionsData = (
  partyId: string,
  gridRef: RefObject<AgGridReact>
) => {
  const variables = useMemo<PositionsQueryVariables>(
    () => ({ partyId }),
    [partyId]
  );
  const dataRef = useRef<Position[] | null>(null);
  const update = useCallback(
    ({ data }: { data: Position[] | null }) => {
      if (gridRef.current?.api?.getModel().getType() === 'infinite') {
        return updateGridData(dataRef, data, gridRef);
      }
      gridRef.current?.api?.applyTransaction({ update: data });
      return true;
    },
    [gridRef]
  );
  const insert = useCallback(
    ({ data }: { data: Position[] | null }) => {
      if (gridRef.current?.api?.getModel().getType() === 'infinite') {
        return updateGridData(dataRef, data, gridRef);
      }
      gridRef.current?.api?.applyTransaction({ add: data });
      return true;
    },
    [gridRef]
  );
  const { data, error, loading, reload } = useDataProvider({
    dataProvider: positionsMetricsProvider,
    update,
    insert,
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
