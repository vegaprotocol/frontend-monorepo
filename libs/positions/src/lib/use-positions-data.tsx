import { useCallback, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import type { Position } from './positions-data-providers';
import { positionsMetricsProvider } from './positions-data-providers';
import type { PositionsMetricsProviderVariables } from './positions-data-providers';
import { useDataProvider, updateGridData } from '@vegaprotocol/react-helpers';
import type { GetRowsParams } from '@vegaprotocol/ui-toolkit';

export const getRowId = ({ data }: { data: Position }) => data.marketId;

export const usePositionsData = (
  partyId: string,
  gridRef: RefObject<AgGridReact>,
  clientSideModel?: boolean
) => {
  const variables = useMemo<PositionsMetricsProviderVariables>(
    () => ({ partyId }),
    [partyId]
  );
  const dataRef = useRef<Position[] | null>(null);
  const update = useCallback(
    ({ data }: { data: Position[] | null }) => {
      return clientSideModel ? false : updateGridData(dataRef, data, gridRef);
    },
    [gridRef, clientSideModel]
  );
  const { data, error, loading } = useDataProvider({
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
  };
};
