import { useDataProvider } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { GridApi } from 'ag-grid-community';
import type { AgGridReact } from 'ag-grid-react';
import { useCallback, useMemo, useRef } from 'react';
import {
  MAX_TRADES,
  sortTrades,
  tradesDataProvider as dataProvider,
} from './trades-data-provider';
import { TradesTable } from './trades-table';
import type { TradeFields } from './__generated__/TradeFields';
import type { TradesVariables } from './__generated__/Trades';

interface TradesContainerProps {
  marketId: string;
}

export const TradesContainer = ({ marketId }: TradesContainerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const variables = useMemo<TradesVariables>(
    () => ({ marketId, maxTrades: MAX_TRADES }),
    [marketId]
  );
  const update = useCallback(({ delta }: { delta: TradeFields[] }) => {
    if (!gridRef.current?.api) {
      return false;
    }

    const incoming = sortTrades(delta);
    const currentRows = getAllRows(gridRef.current.api);
    // Create array of trades whose index is now greater than the max so we
    // can remove them from the grid
    const outgoing = [...incoming, ...currentRows].filter(
      (r, i) => i > MAX_TRADES - 1
    );

    gridRef.current.api.applyTransactionAsync({
      add: incoming,
      remove: outgoing,
      addIndex: 0,
    });

    return true;
  }, []);
  const { data, error, loading } = useDataProvider({
    dataProvider,
    update,
    variables,
  });

  return (
    <AsyncRenderer
      loading={loading}
      error={error}
      data={data}
      render={(data) => <TradesTable ref={gridRef} data={data} />}
    />
  );
};

const getAllRows = (api: GridApi) => {
  const rows: TradeFields[] = [];
  api.forEachNode((node) => {
    rows.push(node.data);
  });
  return rows;
};
