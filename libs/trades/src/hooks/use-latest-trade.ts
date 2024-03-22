import { useDataProvider } from '@vegaprotocol/data-provider';
import { tradesProvider } from '../lib/trades-data-provider';
import first from 'lodash/first';

export const useLatestTrade = (marketId?: string, partyId?: string) => {
  const { data, loading, error } = useDataProvider({
    dataProvider: tradesProvider,
    variables: {
      marketIds: [marketId || ''],
      partyIds: [partyId || ''],
    },
    skip: !marketId || !partyId,
  });

  const latest = first(data);
  return { data: latest, loading, error };
};
