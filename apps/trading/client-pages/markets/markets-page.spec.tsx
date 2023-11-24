import { act, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OpenMarkets } from './open-markets';
import { MarketState } from '@vegaprotocol/types';
import { subDays } from 'date-fns';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { PropertyKeyType } from '@vegaprotocol/types';
import type {
  OracleSpecDataConnectionQuery,
  MarketsDataQuery,
  MarketsQuery,
} from '@vegaprotocol/markets';
import {
  OracleSpecDataConnectionDocument,
  MarketsDataDocument,
  MarketsDocument,
} from '@vegaprotocol/markets';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import {
  createMarketFragment,
  marketsQuery,
  marketsDataQuery,
  createMarketsDataFragment,
} from '@vegaprotocol/mock';
import userEvent from '@testing-library/user-event';

describe('Open', () => {
  let originalNow: typeof Date.now;
  const mockNowTimestamp = 1672531200000;
  const settlementDateMetaDate = subDays(
    new Date(mockNowTimestamp),
    3
  ).toISOString();
  const settlementDateTag = `settlement-expiry-date:${settlementDateMetaDate}`;
  const pubKey = 'pubKey';
  const marketId = 'market-0';
  const settlementDataProperty = 'spec-binding';
  const settlementDataId = 'settlement-data-oracle-id';

  const market = createMarketFragment({
    id: marketId,
    state: MarketState.STATE_ACTIVE,
    tradableInstrument: {
      instrument: {
        metadata: {
          tags: [settlementDateTag],
        },
        product: {
          __typename: 'Future',
          dataSourceSpecForSettlementData: {
            __typename: 'DataSourceSpec',
            id: settlementDataId,
            data: {
              sourceType: {
                __typename: 'DataSourceDefinitionExternal',
                sourceType: {
                  filters: [
                    {
                      __typename: 'Filter',
                      key: {
                        __typename: 'PropertyKey',
                        name: settlementDataProperty,
                        type: PropertyKeyType.TYPE_INTEGER,
                        numberDecimalPlaces: 5,
                      },
                    },
                  ],
                },
              },
            },
          },
          dataSourceSpecBinding: {
            settlementDataProperty,
          },
        },
      },
    },
  });
  const marketsMock: MockedResponse<MarketsQuery> = {
    request: {
      query: MarketsDocument,
    },
    result: {
      data: marketsQuery({
        marketsConnection: {
          edges: [
            {
              node: market,
            },
          ],
        },
      }),
    },
  };

  const marketsData = createMarketsDataFragment({
    __typename: 'MarketData',
    market: {
      __typename: 'Market',
      id: marketId,
    },
    bestBidPrice: '1000',
    bestOfferPrice: '2000',
    markPrice: '1500',
  });
  const marketsDataMock: MockedResponse<MarketsDataQuery> = {
    request: {
      query: MarketsDataDocument,
    },
    result: {
      data: marketsDataQuery({
        marketsConnection: {
          edges: [
            {
              node: {
                data: marketsData,
              },
            },
          ],
        },
      }),
    },
  };

  // Create mock oracle data
  const property = {
    __typename: 'Property' as const,
    name: settlementDataProperty,
    value: '12345',
  };
  const oracleDataMock: MockedResponse<OracleSpecDataConnectionQuery> = {
    request: {
      query: OracleSpecDataConnectionDocument,
      variables: {
        oracleSpecId: settlementDataId,
      },
    },
    result: {
      data: {
        oracleSpec: {
          dataConnection: {
            edges: [
              {
                node: {
                  externalData: {
                    data: {
                      data: [property],
                    },
                  },
                },
              },
            ],
          },
        },
      },
    },
  };

  beforeAll(() => {
    originalNow = Date.now;
    Date.now = jest.fn().mockReturnValue(mockNowTimestamp);
  });

  afterAll(() => {
    Date.now = originalNow;
  });

  it('renders correct headers', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <MockedProvider
            mocks={[marketsMock, marketsDataMock, oracleDataMock]}
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
    await act(async () => {
      render(
        <MemoryRouter>
          <MockedProvider
            mocks={[marketsMock, marketsDataMock, oracleDataMock]}
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

    const headers = screen.getAllByRole('columnheader');
    // eslint-disable-next-line no-console
    console.log(headers);
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
  it.skip('renders row', async () => {
    // TODO finish test to replace test_markets_content from apps/trading/e2e/tests/market/test_markets_all.py
    await act(async () => {
      render(
        <MemoryRouter>
          <MockedProvider
            mocks={[marketsMock, marketsDataMock, oracleDataMock]}
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

    const container = within(
      document.querySelector('.ag-center-cols-container') as HTMLElement
    );
    // eslint-disable-next-line no-console
    console.log(container);
    const row = container.getAllByRole('row')[0];
    // eslint-disable-next-line no-console
    console.log(row);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const marketCode = row.getAttribute('col-id') === 'code';
  });
});
