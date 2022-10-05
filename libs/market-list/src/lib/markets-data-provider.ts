import { makeDataProvider } from '@vegaprotocol/react-helpers';
import type { MarketsDataQuery } from './__generated___/markets-data';
import { MarketsDataDocument } from './__generated___/markets-data';
import type { MarketData } from './market-data-provider';

const getData = (responseData: MarketsDataQuery): MarketData[] | null =>
  responseData.marketsConnection?.edges
    .filter((edge) => edge.node.data)
    .map((edge) => edge.node.data as MarketData) || null;

export const marketsDataProvider = makeDataProvider<
  MarketsDataQuery,
  MarketData[],
  never,
  never
>({
  query: MarketsDataDocument,
  getData,
});
