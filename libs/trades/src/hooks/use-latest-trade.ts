import { useDataProvider } from '@vegaprotocol/data-provider';
import { lastTradeProvider } from '../lib/trades-data-provider';

export const useLatestTrade = (
  marketId?: string,
  partyId?: string,
  skip = false
) =>
  useDataProvider({
    dataProvider: lastTradeProvider,
    variables: {
      marketIds: [marketId || ''],
      partyIds: [partyId || ''],
    },
    skip: skip || !marketId || !partyId,
  });
