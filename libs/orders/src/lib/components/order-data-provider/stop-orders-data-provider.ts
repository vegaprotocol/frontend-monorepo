import {
  makeDataProvider,
  makeDerivedDataProvider,
  useDataProvider,
} from '@vegaprotocol/data-provider';
import { type Market } from '@vegaprotocol/markets';
import { marketsMapProvider } from '@vegaprotocol/markets';
import {
  StopOrdersDocument,
  type StopOrdersQuery,
  type StopOrdersQueryVariables,
  type StopOrderFieldsFragment,
} from './__generated__/Orders';

export type StopOrder = StopOrderFieldsFragment & {
  market: Market;
};

const getData = (
  responseData: StopOrdersQuery | null
): StopOrderFieldsFragment[] =>
  responseData?.stopOrders?.edges
    ?.map((edge) => edge.node)
    .filter((node): node is StopOrderFieldsFragment => !!node) || [];

export const stopOrdersProvider = makeDataProvider<
  StopOrdersQuery,
  ReturnType<typeof getData>,
  never,
  never,
  StopOrdersQueryVariables
>({
  pollInterval: 2000,
  query: StopOrdersDocument,
  getData,
});

export const useActiveStopOrders = (
  partyId: string | undefined,
  marketId: string,
  skip = false
) =>
  useDataProvider({
    dataProvider: stopOrdersProvider,
    variables: {
      filter: {
        parties: partyId ? [partyId] : [],
        markets: [marketId],
        liveOnly: true,
      },
    },
    skip: skip || !partyId,
  });

export const stopOrdersWithMarketProvider = makeDerivedDataProvider<
  StopOrder[],
  never,
  StopOrdersQueryVariables
>(
  [
    stopOrdersProvider,
    (callback, client) => marketsMapProvider(callback, client, undefined),
  ],
  (partsData): StopOrder[] => {
    return ((partsData[0] as ReturnType<typeof getData>) || []).map(
      (stopOrder) => {
        return {
          ...stopOrder,
          market: (partsData[1] as Record<string, Market>)[
            stopOrder.submission.marketId
          ],
        };
      }
    );
  }
);
