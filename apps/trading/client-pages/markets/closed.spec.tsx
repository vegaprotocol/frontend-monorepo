import merge from 'lodash/merge';
import { act, render, screen, within } from '@testing-library/react';
import { Closed } from './closed';
import { MarketStateMapping } from '@vegaprotocol/types';
import { PositionStatus } from '@vegaprotocol/types';
import { MarketTradingMode } from '@vegaprotocol/types';
import { MarketState } from '@vegaprotocol/types';
import { subDays } from 'date-fns';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type { OracleSpecDataConnectionQuery } from '@vegaprotocol/oracles';
import { OracleSpecDataConnectionDocument } from '@vegaprotocol/oracles';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import type {
  PositionsQuery,
  PositionFieldsFragment,
} from '@vegaprotocol/positions';
import { PositionsDocument } from '@vegaprotocol/positions';
import type {
  ClosedMarketFragment,
  ClosedMarketsQuery,
} from './__generated__/ClosedMarkets';
import { ClosedMarketsDocument } from './__generated__/ClosedMarkets';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import type { PartialDeep } from 'type-fest';

describe('Closed', () => {
  let originalNow: typeof Date.now;
  const mockNowTimestamp = 1672531200000;
  const settlementDateMetaDate = subDays(
    new Date(mockNowTimestamp),
    3
  ).toISOString();
  const settlementDateTag = `settlement-expiry-date:${settlementDateMetaDate}`;
  const pubKey = 'pubKey';
  const marketId = 'market-id';
  const settlementDataProperty = 'spec-binding';
  const settlementDataId = 'settlement-data-oracle-id';

  // Create mock closed market
  const createMarket = (
    override?: PartialDeep<ClosedMarketFragment>
  ): ClosedMarketFragment => {
    const defaultMarket = {
      __typename: 'Market',
      id: marketId,
      decimalPlaces: 2,
      positionDecimalPlaces: 2,
      state: MarketState.STATE_SETTLED,
      tradingMode: MarketTradingMode.TRADING_MODE_NO_TRADING,
      data: {
        __typename: 'MarketData',
        market: {
          __typename: 'Market',
          id: marketId,
        },
        bestBidPrice: '1000',
        bestOfferPrice: '2000',
        markPrice: '1500',
      },
      tradableInstrument: {
        __typename: 'TradableInstrument',
        instrument: {
          __typename: 'Instrument',
          id: '',
          name: 'ETH USDC SIMS 4',
          code: 'ETH/USDC',
          metadata: {
            __typename: 'InstrumentMetadata',
            tags: [settlementDateTag],
          },
          product: {
            __typename: 'Future',
            settlementAsset: {
              __typename: 'Asset',
              id: 'c5b60dd43d99879d9881343227e788fe27a3e213cbd918e6f60d3d3973e24522',
              symbol: 'USDC',
              name: 'USDC SIM4',
              decimals: 18,
            },
            quoteName: 'USD',
            dataSourceSpecForTradingTermination: {
              __typename: 'DataSourceSpec',
              id: '5940e6c632f3b8a6640df3b3163a399d55722858c4eeb367ea41b40d270fe260',
            },
            dataSourceSpecForSettlementData: {
              __typename: 'DataSourceSpec',
              id: settlementDataId,
            },
            dataSourceSpecBinding: {
              __typename: 'DataSourceSpecToFutureBinding',
              settlementDataProperty,
              tradingTerminationProperty: 'trading.terminated.ETH2',
            },
          },
        },
      },
      marketTimestamps: {
        __typename: 'MarketTimestamps',
        open: '2023-04-03T21:18:45.826251144Z',
        close: null,
      },
    };

    return merge(defaultMarket, override);
  };
  const market = createMarket();
  const marketsMock: MockedResponse<ClosedMarketsQuery> = {
    request: {
      query: ClosedMarketsDocument,
    },
    result: {
      data: {
        marketsConnection: {
          __typename: 'MarketConnection',
          edges: [
            {
              node: market,
            },
          ],
        },
      },
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

  // Create mock position
  const createPosition = (): PositionFieldsFragment => {
    return {
      __typename: 'Position' as const,
      realisedPNL: '1000',
      unrealisedPNL: '2000',
      openVolume: '3000',
      averageEntryPrice: '100',
      updatedAt: new Date().toISOString(),
      positionStatus: PositionStatus.POSITION_STATUS_UNSPECIFIED,
      lossSocializationAmount: '1000',
      market: {
        __typename: 'Market',
        id: marketId,
      },
    };
  };
  const position = createPosition();
  const positionsMock: MockedResponse<PositionsQuery> = {
    request: {
      query: PositionsDocument,
      variables: {
        partyId: pubKey,
      },
    },
    result: {
      data: {
        party: {
          __typename: 'Party',
          id: pubKey,
          positionsConnection: {
            __typename: 'PositionConnection',
            edges: [{ __typename: 'PositionEdge', node: position }],
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

  it('renders correctly formatted and filtered rows', async () => {
    await act(async () => {
      render(
        <MockedProvider mocks={[marketsMock, positionsMock, oracleDataMock]}>
          <VegaWalletContext.Provider
            value={{ pubKey } as VegaWalletContextShape}
          >
            <Closed />
          </VegaWalletContext.Provider>
        </MockedProvider>
      );
    });

    const headers = screen.getAllByRole('columnheader');
    const expectedHeaders = [
      'Market',
      'Description',
      'Status',
      'Settlement date',
      'Best bid',
      'Best offer',
      'Mark price',
      'Settlement price',
      'Realised PNL',
      'Settlement asset',
      'Market ID',
    ];
    expect(headers).toHaveLength(expectedHeaders.length);
    expect(headers.map((h) => h.textContent?.trim())).toEqual(expectedHeaders);

    const cells = screen.getAllByRole('gridcell');
    const expectedValues = [
      market.tradableInstrument.instrument.code,
      market.tradableInstrument.instrument.name,
      MarketStateMapping[market.state],
      '3 days ago',
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      addDecimalsFormatNumber(market.data!.bestBidPrice, market.decimalPlaces),
      addDecimalsFormatNumber(
        market.data!.bestOfferPrice,
        market.decimalPlaces
      ),
      addDecimalsFormatNumber(market.data!.markPrice, market.decimalPlaces),
      /* eslint-enable @typescript-eslint/no-non-null-assertion */
      addDecimalsFormatNumber(property.value, market.decimalPlaces),
      addDecimalsFormatNumber(position.realisedPNL, market.decimalPlaces),
      market.tradableInstrument.instrument.product.settlementAsset.symbol,
      market.id,
    ];
    cells.forEach((cell, i) => {
      expect(cell).toHaveTextContent(expectedValues[i]);
    });
  });

  it('only renders settled and terminated markets', async () => {
    const mixedMarkets = [
      {
        // inlclude as settled
        __typename: 'MarketEdge' as const,
        node: createMarket({
          id: 'include-0',
          state: MarketState.STATE_SETTLED,
        }),
      },
      {
        // omit this market
        __typename: 'MarketEdge' as const,
        node: createMarket({
          id: 'discard-0',
          state: MarketState.STATE_SUSPENDED,
        }),
      },
      {
        // include as terminated
        __typename: 'MarketEdge' as const,
        node: createMarket({
          id: 'include-1',
          state: MarketState.STATE_TRADING_TERMINATED,
        }),
      },
      {
        // omit this market
        __typename: 'MarketEdge' as const,
        node: createMarket({
          id: 'discard-1',
          state: MarketState.STATE_ACTIVE,
        }),
      },
    ];
    const mixedMarketsMock: MockedResponse<ClosedMarketsQuery> = {
      request: {
        query: ClosedMarketsDocument,
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
        <MockedProvider
          mocks={[mixedMarketsMock, positionsMock, oracleDataMock]}
        >
          <VegaWalletContext.Provider
            value={{ pubKey } as VegaWalletContextShape}
          >
            <Closed />
          </VegaWalletContext.Provider>
        </MockedProvider>
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

    // check rows length is correct
    const rows = container.getAllByRole('row');
    expect(rows).toHaveLength(expectedRows.length);

    // check that only included ids are shown
    const cells = screen
      .getAllByRole('gridcell')
      .filter((cell) => cell.getAttribute('col-id') === 'id')
      .map((cell) => cell.textContent?.trim());
    expect(cells).toEqual(expectedRows.map((m) => m.node.id));
  });
});
