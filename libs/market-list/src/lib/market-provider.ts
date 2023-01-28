import {
  makeDataProvider,
  makeDerivedDataProvider,
} from '@vegaprotocol/react-helpers';
import { MarketDocument } from './__generated__/market';
import type {
  MarketQuery,
  SingleMarketFieldsFragment,
} from './__generated__/market';
import type { MarketData } from './market-data-provider';
import { marketDataProvider } from './market-data-provider';

const getData = (
  responseData: MarketQuery | null
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
};
export type MarketDealTicketAsset =
  MarketDealTicket['tradableInstrument']['instrument']['product']['settlementAsset'];

export const marketDealTicketProvider = makeDerivedDataProvider<
  MarketDealTicket,
  never
>([marketProvider, marketDataProvider], ([market, marketData]) => {
  return {
    ...market,
    data: marketData,
  };
});
