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
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import {
  createMarketFragment,
  marketsQuery,
  marketsDataQuery,
  createMarketsDataFragment,
} from '@vegaprotocol/mock';

jest.mock('@vegaprotocol/wallet-react', () => ({
  useChainId: jest.fn(() => '1'),
}));

jest.mock('@vegaprotocol/emblem', () => ({
  EmblemByMarket: () => <div data-testid="emblem-by-market" />,
}));

describe('Closed', () => {
  let originalNow: typeof Date.now;
  const mockNowTimestamp = 1672531200000;
  const settlementDateMetaDate = subDays(
    new Date(mockNowTimestamp),
    3
  ).toISOString();
  const settlementDateTag = `settlement-expiry-date:${settlementDateMetaDate}`;
  const marketId = 'market-0';
  const settlementDataProperty = 'spec-binding';
  const settlementDataId = 'settlement-data-oracle-id';

  const market = createMarketFragment({
    id: marketId,
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
    marketState: MarketState.STATE_SETTLED,
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

  const renderComponent = async (mocks: MockedResponse[]) => {
    await act(async () => {
      render(
        <MemoryRouter>
          <MockedProvider mocks={mocks}>
            <Closed />
          </MockedProvider>
        </MemoryRouter>
      );
    });
  };

  it('renders correct headers', async () => {
    await renderComponent([marketsMock, marketsDataMock, oracleDataMock]);

    const headers = screen.getAllByRole('columnheader');
    const expectedHeaders = [
      'Market',
      'Status',
      'Settlement date',
      'Best bid',
      'Best offer',
      'Price',
    ];
    expect(headers).toHaveLength(expectedHeaders.length);
    expect(headers.map((h) => h.textContent?.trim())).toEqual(expectedHeaders);
  });

  it('renders correctly formatted and filtered rows', async () => {
    await renderComponent([marketsMock, marketsDataMock, oracleDataMock]);
    await waitFor(() => {
      expect(screen.getAllByRole('gridcell').length).toBeGreaterThan(0);
    });

    const assetSymbol = getAsset(market).symbol;

    const cells = screen.getAllByRole('gridcell');
    const expectedValues = [
      market.tradableInstrument.instrument.code,
      MarketStateMapping[marketsData.marketState],
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
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('successor market should be visible', async () => {
    const marketsWithSuccessorID = [
      {
        __typename: 'MarketEdge' as const,
        node: createMarketFragment({
          id: marketId,
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

    await renderComponent([
      mockWithSuccessors,
      marketsDataMock,
      oracleDataMock,
    ]);

    const container = within(
      document.querySelector('.ag-center-cols-container') as HTMLElement
    );

    const cells = await container.findAllByRole('gridcell');
    const cell = cells.find((el) => el.getAttribute('col-id') === 'code');

    expect(
      within(cell as HTMLElement).getByTestId('stack-cell-secondary')
    ).toHaveTextContent('ACTIVE MARKET');
  });
});
