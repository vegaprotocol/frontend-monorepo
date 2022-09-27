import { makeDataProvider } from '@vegaprotocol/react-helpers';
import { MarketsDataDocument } from './__generated__/MarketData';
import type {
  MarketsDataQuery,
  MarketDataFieldsFragment,
} from './__generated__/MarketData';

const getData = (
  responseData: MarketsDataQuery
): MarketDataFieldsFragment[] | null =>
  responseData.marketsConnection?.edges
    .filter((edge) => edge.node.data)
    .map((edge) => edge.node.data as MarketDataFieldsFragment) || null;

export const marketsDataProvider = makeDataProvider<
  MarketsDataQuery,
  MarketDataFieldsFragment[],
  never,
  never
>({
  query: MarketsDataDocument,
  getData,
});
