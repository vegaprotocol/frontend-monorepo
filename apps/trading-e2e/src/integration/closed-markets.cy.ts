import merge from 'lodash/merge';
import { aliasGQLQuery } from '@vegaprotocol/cypress';
import { MarketState, MarketTradingMode } from '@vegaprotocol/types';
import type { PartialDeep } from 'type-fest';
import {
  assetsQuery,
  chainIdQuery,
  marketsDataQuery,
  marketsQuery,
  statisticsQuery,
} from '@vegaprotocol/mock';
import { networkParamsQuery } from '@vegaprotocol/mock';

describe('Closed markets', { tags: '@smoke' }, () => {
  const closedMarketsResult = [
    { node: createMarket({ id: '1' }) },
    { node: createMarket({ id: '2' }) },
    { node: createMarket({ id: '3' }) },
    { node: createMarket({ id: '4' }) },
  ];
  before(() => {
    cy.mockGQL((req) => {
      aliasGQLQuery(req, 'ChainId', chainIdQuery());
      aliasGQLQuery(req, 'Statistics', statisticsQuery());
      aliasGQLQuery(req, 'NetworkParams', networkParamsQuery());
      aliasGQLQuery(req, 'Assets', assetsQuery());
      aliasGQLQuery(req, 'Markets', marketsQuery());
      aliasGQLQuery(req, 'MarketsData', marketsDataQuery());
      aliasGQLQuery(req, 'ClosedMarkets', {
        marketsConnection: {
          edges: closedMarketsResult,
        },
      });
      aliasGQLQuery(req, 'OracleSpecDataConnection', {
        oracleSpec: {
          dataConnection: {
            edges: [{ node: createDataConnection() }],
          },
        },
      });
    });

    cy.mockSubscription();
  });

  it('renders the page', () => {
    cy.visit('/#/markets/all');
    cy.get('[data-testid="Closed markets"]').click();
    cy.get(
      '[data-testid="tab-closed-markets"] .ag-center-cols-container .ag-row'
    ).should('have.length', closedMarketsResult.length);
  });
});

// Create mock closed market
function createMarket(override?: PartialDeep<any>): any {
  const marketId = override.id || 'market-id';
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
          tags: [],
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
            id: 'trading-terminated-property',
          },
          dataSourceSpecForSettlementData: {
            __typename: 'DataSourceSpec',
            id: 'settlement-data-property',
          },
          dataSourceSpecBinding: {
            __typename: 'DataSourceSpecToFutureBinding',
            settlementDataProperty: 'settlement-data-property',
            tradingTerminationProperty: 'trading-terminated-property',
          },
        },
      },
    },
    marketTimestamps: {
      __typename: 'MarketTimestamps',
      open: '2023-04-03T21:18:45.826251144Z',
      close: '2023-04-03T21:18:45.826251144Z',
    },
  };

  return merge(defaultMarket, override);
}

function createDataConnection(override?: PartialDeep<any>): any {
  const defaultDataConnection = {
    externalData: {
      data: {
        data: [
          {
            name: 'settlement-data-property',
            value: '100',
          },
        ],
      },
    },
  };

  return merge(defaultDataConnection, override);
}
