import { act, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OpenMarkets } from './open-markets';
import { Interval } from '@vegaprotocol/types';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type {
  MarketsDataQuery,
  MarketsQuery,
  MarketCandlesQuery,
  MarketFieldsFragment,
} from '@vegaprotocol/markets';
import {
  MarketsDataDocument,
  MarketsDocument,
  MarketsCandlesDocument,
} from '@vegaprotocol/markets';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import {
  marketsQuery,
  marketsDataQuery,
  marketsCandlesQuery,
} from '@vegaprotocol/mock';
import userEvent from '@testing-library/user-event';

describe('Open', () => {
  let originalNow: typeof Date.now;
  const mockNowTimestamp = 1672531200000;
  const pubKey = 'pubKey';

  const marketsQueryData = marketsQuery();
  const marketsMock: MockedResponse<MarketsQuery> = {
    request: {
      query: MarketsDocument,
    },
    result: {
      data: marketsQueryData,
    },
  };

  const marketsCandlesQueryData = marketsCandlesQuery();
  const marketsCandlesMock: MockedResponse<MarketCandlesQuery> = {
    request: {
      query: MarketsCandlesDocument,
      variables: {
        interval: Interval.INTERVAL_I1H,
        since: '2022-12-31T00:00:00.000Z',
      },
    },
    result: {
      data: marketsCandlesQueryData,
    },
  };

  const marketsDataQueryData = marketsDataQuery();

  const marketsDataMock: MockedResponse<MarketsDataQuery> = {
    request: {
      query: MarketsDataDocument,
    },
    result: {
      data: marketsDataQueryData,
    },
  };

  beforeAll(() => {
    originalNow = Date.now;
    Date.now = jest.fn().mockReturnValue(mockNowTimestamp);
  });

  afterAll(() => {
    Date.now = originalNow;
  });

  const renderComponent = async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <MockedProvider
            mocks={[marketsMock, marketsCandlesMock, marketsDataMock]}
          >
            <VegaWalletContext.Provider
              value={{ pubKey } as VegaWalletContextShape}
            >
              <OpenMarkets />
            </VegaWalletContext.Provider>
          </MockedProvider>
        </MemoryRouter>
      );
    });
  };

  it('renders correct headers', async () => {
    await renderComponent();

    const headers = screen.getAllByRole('columnheader');
    const expectedHeaders = [
      'Market',
      'Description',
      'Settlement asset',
      'Trading mode',
      'Status',
      'Mark price',
      '24h volume',
      'Open Interest',
      'Spread',
      '', // Action row
    ];
    expect(headers).toHaveLength(expectedHeaders.length);
    expect(headers.map((h) => h.textContent?.trim())).toEqual(expectedHeaders);
  });

  it('sort columns', async () => {
    await renderComponent();

    const headers = screen.getAllByRole('columnheader');
    const marketHeader = headers.find(
      (h) => h.getAttribute('col-id') === 'tradableInstrument.instrument.code'
    );
    if (!marketHeader) {
      throw new Error('No market header found');
    }
    expect(marketHeader).toHaveAttribute('aria-sort', 'none');
    await userEvent.click(within(marketHeader).getByText(/market/i));
    // 6001-MARK-064
    expect(marketHeader).toHaveAttribute('aria-sort', 'ascending');
  });

  // eslint-disable-next-line jest/no-disabled-tests, jest/expect-expect
  it('renders row', async () => {
    await renderComponent();

    const container = within(
      document.querySelector('.ag-center-cols-container') as HTMLElement
    );

    const markets = marketsQueryData.marketsConnection?.edges.map(
      (e) => e.node
    ) as MarketFieldsFragment[];

    const rows = container.getAllByRole('row');
    expect(rows).toHaveLength(markets.length);
  });
});
