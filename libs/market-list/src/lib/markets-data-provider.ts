import {
  makeDataProvider,
  marketDataErrorPolicyGuard,
} from '@vegaprotocol/utils';
import type { MarketsDataQuery } from './__generated__/markets-data';
import { MarketsDataDocument } from './__generated__/markets-data';
import type { MarketData } from './market-data-provider';

const getData = (responseData: MarketsDataQuery | null): MarketData[] | null =>
  responseData?.marketsConnection?.edges
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
  errorPolicyGuard: marketDataErrorPolicyGuard,
});
