import { makeDataProvider } from '@vegaprotocol/react-helpers';
import type { MarketInfoQuery } from './__generated__/MarketInfo';
import { MarketInfoDocument } from './__generated__/MarketInfo';

export const marketInfoDataProvider = makeDataProvider<
  MarketInfoQuery,
  MarketInfoQuery,
  never,
  never
>({
  query: MarketInfoDocument,
  getData: (responseData: MarketInfoQuery | null) => responseData,
});
