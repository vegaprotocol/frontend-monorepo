import {
  makeDataProvider,
  makeDerivedDataProvider,
} from '@vegaprotocol/react-helpers';
import {MarketDocument, MarketLastTradeDocument } from './__generated___/market';
import type {
  MarketQuery,
  SingleMarketFieldsFragment,
  MarketLastTradeQuery
} from './__generated___/market';
import type { MarketData } from './market-data-provider';
import { marketDataProvider } from './market-data-provider';

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

export type MarketDealTicket = SingleMarketFieldsFragment & {
  data: MarketData;
  depth: NonNullable<MarketLastTradeQuery['market']>['depth'] | null;
};

const marketLastTradeProvider = makeDataProvider<MarketLastTradeQuery, NonNullable<MarketLastTradeQuery['market']>['depth'], never, never>(
  {
    query: MarketLastTradeDocument,
    getData: (responseData: MarketLastTradeQuery) => responseData.market?.depth || null
  }
);

export const marketDealTicketProvider = makeDerivedDataProvider<
  MarketDealTicket,
  never
>([marketProvider, marketDataProvider, marketLastTradeProvider], ([market, marketData, marketDepth]) => {
  return {
    ...market,
    data: marketData,
    depth: marketDepth
  };
});
