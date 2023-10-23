import { act, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Closed } from './closed';
import { MarketStateMapping, PropertyKeyType } from '@vegaprotocol/types';
import { MarketState } from '@vegaprotocol/types';
import { subDays } from 'date-fns';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type {
  OracleSpecDataConnectionQuery,
  MarketsDataQuery,
  MarketsQuery,
} from '@vegaprotocol/markets';
import {
  OracleSpecDataConnectionDocument,
  MarketsDataDocument,
  MarketsDocument,
  getAsset,
} from '@vegaprotocol/markets';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import {
  createMarketFragment,
  marketsQuery,
  marketsDataQuery,
  createMarketsDataFragment,
} from '@vegaprotocol/mock';

describe('Closed', () => {
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
    state: MarketState.STATE_SETTLED,
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

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('renders correctly formatted and filtered rows', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <MockedProvider
            mocks={[marketsMock, marketsDataMock, oracleDataMock]}
          >
            <VegaWalletContext.Provider
              value={{ pubKey } as VegaWalletContextShape}
            >
              <Closed />
            </VegaWalletContext.Provider>
          </MockedProvider>
        </MemoryRouter>
      );
    });

    const headers = screen.getAllByRole('columnheader');
    const expectedHeaders = [
      'Market',
      'Status',
      'Settlement date',
      'Best bid',
      'Best offer',
      'Mark price',
      'Settlement price',
      'Settlement asset',
      '', // actions row
    ];
    expect(headers).toHaveLength(expectedHeaders.length);
    expect(headers.map((h) => h.textContent?.trim())).toEqual(expectedHeaders);

    const assetSymbol = getAsset(market).symbol;

    const cells = screen.getAllByRole('gridcell');
    const expectedValues = [
      market.tradableInstrument.instrument.code,
      MarketStateMapping[market.state],
      '3 days ago',
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      addDecimalsFormatNumber(marketsData.bestBidPrice, market.decimalPlaces),
      addDecimalsFormatNumber(
        marketsData!.bestOfferPrice,
        market.decimalPlaces
      ),
      addDecimalsFormatNumber(marketsData!.markPrice, market.decimalPlaces),
      /* eslint-enable @typescript-eslint/no-non-null-assertion */
      addDecimalsFormatNumber(property.value, market.decimalPlaces),
      assetSymbol,
      '', // actions row
    ];
    cells.forEach((cell, i) => {
      expect(cell).toHaveTextContent(expectedValues[i]);
    });
  });

  it('only renders settled and terminated markets', async () => {
    const mixedMarkets = [
      {
        // include as settled
        __typename: 'MarketEdge' as const,
        node: createMarketFragment({
          id: 'include-0',
          state: MarketState.STATE_SETTLED,
        }),
      },
      {
        // omit this market
        __typename: 'MarketEdge' as const,
        node: createMarketFragment({
          id: 'discard-0',
          state: MarketState.STATE_SUSPENDED,
        }),
      },
      {
        // include as terminated
        __typename: 'MarketEdge' as const,
        node: createMarketFragment({
          id: 'include-1',
          state: MarketState.STATE_TRADING_TERMINATED,
        }),
      },
      {
        // omit this market
        __typename: 'MarketEdge' as const,
        node: createMarketFragment({
          id: 'discard-1',
          state: MarketState.STATE_ACTIVE,
        }),
      },
    ];
    const mixedMarketsMock: MockedResponse<MarketsQuery> = {
      request: {
        query: MarketsDocument,
      },
      result: {
        data: {
          marketsConnection: {
            __typename: 'MarketConnection',
            edges: mixedMarkets,
          },
        },
      },
    };
    await act(async () => {
      render(
        <MemoryRouter>
          <MockedProvider
            mocks={[mixedMarketsMock, marketsDataMock, oracleDataMock]}
          >
            <VegaWalletContext.Provider
              value={{ pubKey } as VegaWalletContextShape}
            >
              <Closed />
            </VegaWalletContext.Provider>
          </MockedProvider>
        </MemoryRouter>
      );
    });

    // check that the number of rows in datagrid is 2
    const container = within(
      document.querySelector('.ag-center-cols-container') as HTMLElement
    );
    const expectedRows = mixedMarkets.filter((m) => {
      return [
        MarketState.STATE_SETTLED,
        MarketState.STATE_TRADING_TERMINATED,
      ].includes(m.node.state);
    });

    await waitFor(() => {
      // check rows length is correct
      const rows = container.getAllByRole('row');
      expect(rows).toHaveLength(expectedRows.length);
    });

    // check that only included ids are shown
    const cells = screen
      .getAllByRole('gridcell')
      .filter((cell) => cell.getAttribute('col-id') === 'code')
      .map((cell) => {
        const marketCode = within(cell).getByTestId('stack-cell-primary');
        return marketCode.textContent;
      });
    expect(cells).toEqual(
      expectedRows.map((m) => m.node.tradableInstrument.instrument.code)
    );
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('successor marked should be visible', async () => {
    const marketsWithSuccessorID = [
      {
        __typename: 'MarketEdge' as const,
        node: createMarketFragment({
          id: 'include-0',
          state: MarketState.STATE_SETTLED,
          successorMarketID: 'successor',
        }),
      },
    ];
    const mockWithSuccessors: MockedResponse<MarketsQuery> = {
      request: {
        query: MarketsDocument,
      },
      result: {
        data: {
          marketsConnection: {
            __typename: 'MarketConnection',
            edges: marketsWithSuccessorID,
          },
        },
      },
    };

    await act(async () => {
      render(
        <MemoryRouter>
          <MockedProvider
            mocks={[mockWithSuccessors, marketsDataMock, oracleDataMock]}
          >
            <VegaWalletContext.Provider
              value={{ pubKey } as VegaWalletContextShape}
            >
              <Closed />
            </VegaWalletContext.Provider>
          </MockedProvider>
        </MemoryRouter>
      );
    });

    const container = within(
      document.querySelector('.ag-center-cols-container') as HTMLElement
    );

    const cells = await container.findAllByRole('gridcell');
    const cell = cells.find((el) => el.getAttribute('col-id') === 'code');

    expect(
      within(cell as HTMLElement).getByTestId('stack-cell-secondary')
    ).toHaveTextContent('PRNT');
  });
});
