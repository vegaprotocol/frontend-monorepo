import { useDataProvider } from '@vegaprotocol/react-helpers';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useCallback, useMemo } from 'react';
import { tradesDataProvider } from './trades-data-provider';
import { TradesTable } from './trades-table';
import type { TradeFields } from './__generated__/TradeFields';

interface TradesContainerProps {
  marketId: string;
}

export const TradesContainer = ({ marketId }: TradesContainerProps) => {
  const variables = useMemo(() => ({ marketId }), [marketId]);
  const update = useCallback((delta: TradeFields[]) => {
    console.log(delta);
    return false;
  }, []);
  const { data, error, loading } = useDataProvider(
    tradesDataProvider,
    update,
    variables
  );
  return (
    <AsyncRenderer loading={loading} error={error} data={data}>
      {(data) => <TradesTable data={data} />}
    </AsyncRenderer>
  );
};
