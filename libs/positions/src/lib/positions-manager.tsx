import { useRef, useCallback, useMemo } from 'react';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import type { AgGridReact } from 'ag-grid-react';
import PositionsTable from './positions-table';
import type { GetRowsParams } from './positions-table';
import { positionsMetricsDataProvider as dataProvider } from './data-providers';
import type { Position } from './data-providers';

interface PositionsManagerProps {
  partyId: string;
}

export const PositionsManager = ({ partyId }: PositionsManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const variables = useMemo(() => ({ partyId }), [partyId]);
  const dataRef = useRef<Position[] | null>(null);
  const update = useCallback(({ data }: { data: Position[] | null }) => {
    if (!gridRef.current?.api) {
      return false;
    }
    dataRef.current = data;
    gridRef.current.api.refreshInfiniteCache();
    return true;
  }, []);
  const { data, error, loading } = useDataProvider<Position[], never>({
    dataProvider,
    update,
    variables,
  });
  dataRef.current = data;
  const getRows = async ({
    successCallback,
    startRow,
    endRow,
  }: GetRowsParams) => {
    const rowsThisBlock = dataRef.current
      ? dataRef.current.slice(startRow, endRow)
      : [];
    const lastRow = dataRef.current?.length ?? -1;
    successCallback(rowsThisBlock, lastRow);
  };

  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      <PositionsTable
        rowModelType={data?.length ? 'infinite' : 'clientSide'}
        rowData={data?.length ? undefined : []}
        datasource={{ getRows }}
      />
    </AsyncRenderer>
  );
};
