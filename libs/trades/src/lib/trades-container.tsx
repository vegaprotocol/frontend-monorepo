import { useDataProvider } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import type { AgGridReact } from 'ag-grid-react';
import { useCallback, useMemo, useRef } from 'react';
import {
  prepareIncomingTrades,
  tradesDataProvider,
} from './trades-data-provider';
import { TradesTable } from './trades-table';
import type { TradeFields } from './__generated__/TradeFields';

interface TradesContainerProps {
  marketId: string;
}

export const TradesContainer = ({ marketId }: TradesContainerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const variables = useMemo(() => ({ marketId }), [marketId]);
  const update = useCallback((delta: TradeFields[]) => {
    if (!gridRef.current) {
      return false;
    }

    const incoming = prepareIncomingTrades(delta);

    if (incoming.length) {
      gridRef.current.api.applyTransactionAsync({
        add: incoming,
        addIndex: 0,
      });
    }

    return true;
  }, []);
  const { data, error, loading } = useDataProvider(
    tradesDataProvider,
    update,
    variables
  );

  const trades = useMemo(() => {
    if (!data) {
      return null;
    }
    return prepareIncomingTrades(data);
  }, [data]);

  return (
    <AsyncRenderer loading={loading} error={error} data={trades}>
      {(data) => <TradesTable ref={gridRef} data={trades} />}
    </AsyncRenderer>
  );
};
