import type { PageInfo, Cursor } from '@vegaprotocol/data-provider';
import {
  makeDataProvider,
  makeDerivedDataProvider,
  defaultAppend as append,
} from '@vegaprotocol/data-provider';
import type { Market } from '@vegaprotocol/markets';
import { marketsMapProvider } from '@vegaprotocol/markets';
import { FundingPaymentsDocument } from './__generated__/FundingPayments';
import type {
  FundingPaymentsQuery,
  FundingPaymentsQueryVariables,
  FundingPaymentFieldsFragment,
} from './__generated__/FundingPayments';

export type FundingPayment = Omit<FundingPaymentFieldsFragment, 'market'> & {
  market?: Market;
};

const getData = (
  responseData: FundingPaymentsQuery | null
): (FundingPaymentFieldsFragment & Cursor)[] =>
  responseData?.fundingPayments?.edges.map<
    FundingPaymentFieldsFragment & Cursor
  >((edge) => ({
    ...edge.node,
    cursor: edge.cursor,
  })) || [];

const getPageInfo = (
  responseData: FundingPaymentsQuery | null
): PageInfo | null => responseData?.fundingPayments?.pageInfo || null;

export const fundingPaymentsProvider = makeDataProvider<
  Parameters<typeof getData>['0'],
  ReturnType<typeof getData>,
  never,
  never,
  FundingPaymentsQueryVariables
>({
  query: FundingPaymentsDocument,
  getData,
  pagination: {
    getPageInfo,
    append,
    first: 100,
  },
});

export const fundingPaymentsWithMarketProvider = makeDerivedDataProvider<
  FundingPayment[],
  never,
  FundingPaymentsQueryVariables
>(
  [
    fundingPaymentsProvider,
    (callback, client) => marketsMapProvider(callback, client, undefined),
  ],
  (partsData): FundingPayment[] | null => {
    return ((partsData[0] as ReturnType<typeof getData>) || []).map(
      (fundingPayment) => ({
        ...fundingPayment,
        market: (partsData[1] as Record<string, Market>)[
          fundingPayment.marketId
        ],
      })
    );
  }
);
