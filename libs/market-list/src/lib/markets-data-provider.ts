import { makeDataProvider, getNodes } from '@vegaprotocol/react-helpers';
import { MarketListDocument } from './__generated__/MarketList';
import type { MarketListQuery, MarketListItemFragment } from './__generated__/MarketList';

const getData = (responseData: MarketListQuery): MarketListItemFragment[] | null =>
  getNodes<MarketListItemFragment>(responseData.marketsConnection)

export const marketsDataProvider = makeDataProvider<
  MarketListQuery,
  MarketListItemFragment[],
  never,
  never
>({
  query: MarketListDocument,
  getData,
});
