import { makeDataProvider } from '@vegaprotocol/react-helpers';
import { MarketDocument } from './__generated___/market';
import type {
  MarketQuery,
  SingleMarketFieldsFragment,
} from './__generated___/market';

const getData = (
  responseData: MarketQuery
): SingleMarketFieldsFragment | null => responseData?.market || null;

export const marketProvider = makeDataProvider<
  MarketQuery,
  SingleMarketFieldsFragment,
  never,
  never
>({
  query: MarketDocument,
  getData,
});
