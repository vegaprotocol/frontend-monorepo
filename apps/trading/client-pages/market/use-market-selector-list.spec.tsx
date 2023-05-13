import { renderHook, waitFor } from '@testing-library/react';
import { useMarketSelectorList } from './use-market-selector-list';
import { Product } from './product-selector';
import { Sort } from './sort-dropdown';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type { ReactNode } from 'react';
import type {
  MarketMaybeWithCandles,
  MarketsCandlesQuery,
  MarketsDataQuery,
  MarketsQuery,
} from '@vegaprotocol/market-list';
import {
  MarketsDataDocument,
  MarketsDocument,
} from '@vegaprotocol/market-list';
import { MarketsCandlesDocument } from '@vegaprotocol/market-list';
import {
  marketsCandlesQuery,
  marketsDataQuery,
  marketsQuery,
} from '@vegaprotocol/mock';
import { Interval } from '@vegaprotocol/types';
import { subDays } from 'date-fns';
import { now } from '@vegaprotocol/react-helpers';

jest.mock('./market-selector-item', () => ({
  MarketSelectorItem: ({ market }: { market: MarketMaybeWithCandles }) => (
    <div data-testid={market.id} />
  ),
}));

describe('useMarketSelectorList', () => {
  let originalNow: typeof Date.now;
  const mockNowTimestamp = 1672531200000;

  beforeAll(() => {
    originalNow = Date.now;
    Date.now = jest.fn().mockReturnValue(mockNowTimestamp);
  });

  afterAll(() => {
    Date.now = originalNow;
  });

  const setup = (mocks: MockedResponse[]) => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MockedProvider mocks={mocks}>{children}</MockedProvider>
    );
    return renderHook(
      () =>
        useMarketSelectorList({
          searchTerm: '',
          product: Product.Future,
          sort: Sort.None,
          assets: [],
        }),
      { wrapper }
    );
  };

  it('filters', async () => {
    const marketsCandlesResult = marketsCandlesQuery();
    const since = new Date(now(5 * 60 * 1000));
    console.log('in test', since.toISOString());
    const mockCandles: MockedResponse<MarketsCandlesQuery> = {
      request: {
        query: MarketsCandlesDocument,
        variables: {
          since: subDays(since, 1).toISOString(),
          interval: Interval.INTERVAL_I1H,
        },
      },
      result: {
        data: marketsCandlesResult,
      },
    };

    const mockMarketsResult = marketsQuery();
    const mockMarkets: MockedResponse<MarketsQuery> = {
      request: {
        query: MarketsDocument,
      },
      result: {
        data: mockMarketsResult,
      },
    };

    const marketsDataResult = marketsDataQuery();
    const mockMarketsData: MockedResponse<MarketsDataQuery> = {
      request: {
        query: MarketsDataDocument,
      },
      result: {
        data: marketsDataResult,
      },
    };
    const { result } = setup([mockMarkets, mockMarketsData, mockCandles]);
    expect(result.current).toEqual({
      markets: [],
      data: null,
      loading: true,
      error: undefined,
    });

    await waitFor(() => {
      expect(result.current.data).toHaveLength(
        mockMarketsResult.marketsConnection?.edges.length || 0
      );
    });
  });
});
