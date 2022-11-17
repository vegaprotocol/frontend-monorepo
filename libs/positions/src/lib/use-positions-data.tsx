import { useCallback, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import type { Position } from './positions-data-providers';
import { positionsMetricsProvider } from './positions-data-providers';
import type { PositionsMetricsProviderVariables } from './positions-data-providers';
import { useDataProvider } from '@vegaprotocol/react-helpers';

export const getRowId = ({ data }: { data: Position }) => data.marketId;

export const usePositionsData = (
  partyId: string,
  gridRef: RefObject<AgGridReact>
) => {
  const variables = useMemo<PositionsMetricsProviderVariables>(
    () => ({ partyId }),
    [partyId]
  );
  const dataRef = useRef<Position[] | null>(null);
  const update = useCallback(
    ({
      data,
      delta,
    }: {
      data: Position[] | null;
      delta?: Position[] | null;
    }) => {
      dataRef.current = data;

      const update: Position[] = [];
      const add: Position[] = [];
      if (!gridRef.current?.api) {
        return false;
      }
      (delta || []).forEach((position) => {
        const rowNode = gridRef.current?.api.getRowNode(
          getRowId({ data: position })
        );
        if (rowNode) {
          update.push(position);
        } else {
          add.push(position);
        }
      });
      if (update.length || add.length) {
        gridRef.current.api.applyTransactionAsync({
          update,
          add,
          addIndex: 0,
        });
      }
      return true;
    },
    [gridRef]
  );
  const { data, error, loading } = useDataProvider({
    dataProvider: positionsMetricsProvider,
    update,
    variables,
  });
  return {
    data,
    error,
    loading,
  };
};
