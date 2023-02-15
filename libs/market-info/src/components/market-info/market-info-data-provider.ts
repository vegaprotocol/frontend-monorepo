import { makeDataProvider } from '@vegaprotocol/react-helpers';
import type { MarketInfoQuery } from './__generated__/MarketInfo';
import { MarketInfoDocument } from './__generated__/MarketInfo';
import type { MarketInfoNoCandlesQuery } from './__generated__/MarketInfoNoCandles';
import { MarketInfoNoCandlesDocument } from './__generated__/MarketInfoNoCandles';

export const marketInfoDataProvider = makeDataProvider<
  MarketInfoQuery,
  MarketInfoQuery,
  never,
  never
>({
  query: MarketInfoDocument,
  getData: (responseData: MarketInfoQuery | null) => responseData,
});

export const marketInfoNoCandlesDataProvider = makeDataProvider<
  MarketInfoNoCandlesQuery,
  MarketInfoNoCandlesQuery,
  never,
  never
>({
  query: MarketInfoNoCandlesDocument,
  getData: (responseData: MarketInfoNoCandlesQuery | null) => responseData,
});
