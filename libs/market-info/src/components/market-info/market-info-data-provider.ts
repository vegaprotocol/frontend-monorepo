import { makeDataProvider } from '@vegaprotocol/react-helpers';
import type { MarketInfoQuery } from './__generated___/MarketInfo';
import { MarketInfoDocument } from './__generated___/MarketInfo';

export const marketInfoDataProvider = makeDataProvider<
  MarketInfoQuery,
  MarketInfoQuery,
  never,
  never
>({
  query: MarketInfoDocument,
  getData: (responseData: MarketInfoQuery) => responseData,
});
