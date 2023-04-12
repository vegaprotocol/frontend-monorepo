import merge from 'lodash/merge';
import { aliasGQLQuery } from '@vegaprotocol/cypress';
import {
  MarketState,
  MarketStateMapping,
  MarketTradingMode,
} from '@vegaprotocol/types';
import { addDays, subDays } from 'date-fns';
import type { PartialDeep } from 'type-fest';
import {
  assetsQuery,
  chainIdQuery,
  marketsDataQuery,
  marketsQuery,
  statisticsQuery,
} from '@vegaprotocol/mock';
import { networkParamsQuery } from '@vegaprotocol/mock';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';

describe('Closed markets', { tags: '@smoke' }, () => {
  const rowSelector =
    '[data-testid="tab-closed-markets"] .ag-center-cols-container .ag-row';

  const assetsResult = assetsQuery();
  // @ts-ignore asset definitely exists
  const settlementAsset = assetsResult.assetsConnection.edges[0].node;

  const settledMarket = createMarket({
    id: '0',
    marketTimestamps: {
      open: subDays(new Date(), 10).toISOString(),
      close: subDays(new Date(), 4).toISOString(),
    },
    tradableInstrument: {
      instrument: {
        product: {
          dataSourceSpecForTradingTermination: {
            id: 'market-1-trading-termination-oracle-id',
          },
          dataSourceSpecForSettlementData: {
            id: 'market-1-settlement-data-oracle-id',
          },
          settlementAsset,
        },
      },
    },
  });

  const terminatedMarket = createMarket({
    id: '1',
    state: MarketState.STATE_TRADING_TERMINATED,
    marketTimestamps: {
      open: subDays(new Date(), 10).toISOString(),
      close: null, // market
    },
    tradableInstrument: {
      instrument: {
        metadata: {
          tags: [
            `settlement-expiry-date:${addDays(new Date(), 4).toISOString()}`,
          ],
        },
      },
    },
  });

  const delayedSettledMarket = createMarket({
    id: '2',
    state: MarketState.STATE_TRADING_TERMINATED,
    marketTimestamps: {
      open: subDays(new Date(), 10).toISOString(),
      close: null, // market
    },
    tradableInstrument: {
      instrument: {
        metadata: {
          tags: [
            `settlement-expiry-date:${subDays(new Date(), 2).toISOString()}`,
          ],
        },
      },
    },
  });

  const unknownMarket = createMarket({ id: '3' });

  const closedMarketsResult = [
    {
      node: settledMarket,
    },
    {
      node: terminatedMarket,
    },
    {
      node: delayedSettledMarket,
    },
    { node: unknownMarket },
    { node: createMarket({ id: '4', state: MarketState.STATE_PENDING }) },
    { node: createMarket({ id: '5', state: MarketState.STATE_ACTIVE }) },
  ];

  const specDataConnection = createDataConnection();

  before(() => {
    cy.mockGQL((req) => {
      aliasGQLQuery(req, 'ChainId', chainIdQuery());
      aliasGQLQuery(req, 'Statistics', statisticsQuery());
      aliasGQLQuery(req, 'NetworkParams', networkParamsQuery());
      aliasGQLQuery(req, 'Assets', assetsResult);
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
            edges: [{ node: specDataConnection }],
          },
        },
      });
    });

    cy.mockSubscription();

    cy.visit('/#/markets/all');
    cy.get('[data-testid="Closed markets"]').click();
  });

  it('renders a settled market', () => {
    const expectedMarkets = closedMarketsResult.filter((edge) => {
      return [
        MarketState.STATE_SETTLED,
        MarketState.STATE_TRADING_TERMINATED,
      ].includes(edge.node.state);
    });
    const product = settledMarket.tradableInstrument.instrument.product;

    // rows should be filtered to only include settled/terminated markets
    cy.get(rowSelector).should('have.length', expectedMarkets.length);

    // check each column in the first row renders correctly
    cy.get(rowSelector)
      .first()
      .find('[col-id="code"]')
      .should('have.text', settledMarket.tradableInstrument.instrument.code);

    cy.get(rowSelector)
      .first()
      .find('[col-id="name"]')
      .should('have.text', settledMarket.tradableInstrument.instrument.name);

    cy.get(rowSelector)
      .first()
      .find('[col-id="state"]')
      .should('have.text', MarketStateMapping[settledMarket.state]);

    cy.get(rowSelector)
      .first()
      .find('[col-id="settlementDate"]')
      .find('[data-testid="link"]')
      .should(($el) => {
        const href = $el.attr('href');
        expect(href).to.match(
          new RegExp(
            `/oracles/${product.dataSourceSpecForTradingTermination.id}`
          )
        );
      })
      .should('have.text', '4 days ago');

    cy.get(rowSelector)
      .first()
      .find('[col-id="bestBidPrice"]')
      .should(
        'have.text',
        addDecimalsFormatNumber(
          settledMarket.data.bestBidPrice,
          settledMarket.decimalPlaces
        )
      );

    cy.get(rowSelector)
      .first()
      .find('[col-id="bestOfferPrice"]')
      .should(
        'have.text',
        addDecimalsFormatNumber(
          settledMarket.data.bestOfferPrice,
          settledMarket.decimalPlaces
        )
      );

    cy.get(rowSelector).first().find('[col-id="markPrice"]').should(
      'have.text',

      addDecimalsFormatNumber(
        settledMarket.data.markPrice,
        settledMarket.decimalPlaces
      )
    );

    cy.get(rowSelector)
      .first()
      .find('[col-id="settlementDataOracleId"]')
      .find('[data-testid="link"]')
      .should(($el) => {
        const href = $el.attr('href');
        expect(href).to.match(
          new RegExp(`/oracles/${product.dataSourceSpecForSettlementData.id}`)
        );
      })
      .should(
        'have.text',
        addDecimalsFormatNumber(
          specDataConnection.externalData.data.data[0].value,
          settledMarket.decimalPlaces
        )
      );

    cy.get(rowSelector)
      .first()
      .find('[col-id="realisedPNL"]')
      .should('have.text', '-');

    cy.get(rowSelector)
      .first()
      .find('[col-id="settlementAsset"]')
      .should('have.text', product.settlementAsset.symbol);

    cy.get(rowSelector)
      .first()
      .find('[col-id="id"]')
      .should('have.text', settledMarket.id);
  });

  // test market list for market in terminated state
  it('renders a terminated market', () => {
    cy.get(rowSelector)
      .eq(1)
      .find('[col-id="state"]')
      .should('have.text', MarketStateMapping[terminatedMarket.state]);

    cy.get(rowSelector)
      .eq(1)
      .find('[col-id="settlementDate"]')
      .find('[data-testid="link"]')
      .should('have.text', 'Expected in 4 days');
  });

  it('renders a terminated market which was expected to have settled', () => {
    cy.get(rowSelector)
      .eq(2)
      .find('[col-id="settlementDate"]')
      .should('have.class', 'text-danger')
      .find('[data-testid="link"]')
      .should('have.text', 'Expected 2 days ago');
  });

  it('renders terminated market which doesnt have settlement date metadata', () => {
    cy.get(rowSelector)
      .eq(3)
      .find('[col-id="settlementDate"]')
      .find('[data-testid="link"]')
      .should('have.text', 'Unknown');
  });

  it('can open asset detail dialog', () => {
    cy.get(rowSelector)
      .first()
      .find('[col-id="settlementAsset"]')
      .find('button')
      .click();

    cy.get('[data-testid="dialog-title"]').should(
      'have.text',
      `Asset details - ${settlementAsset.symbol}`
    );
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
      open: subDays(new Date(), 10).toISOString(),
      close: null,
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
