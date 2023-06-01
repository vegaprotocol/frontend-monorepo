import { useMarketNamesMap } from '../../hooks/use-market-names-map';
import { useMarketsMap } from '../../hooks/use-markets-map';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { marketsProvider } from '../../markets-provider';

export const MarketsData = () => {
  const updateMarketNames = useMarketNamesMap((state) => state.update);
  const updateMarkets = useMarketsMap((state) => state.update);
  useDataProvider({
    dataProvider: marketsProvider,
    variables: undefined,
    update: ({ data }) => {
      if (data) {
        updateMarketNames(data);
        updateMarkets(data);
      }
      return true;
    },
  });
  return null;
};
