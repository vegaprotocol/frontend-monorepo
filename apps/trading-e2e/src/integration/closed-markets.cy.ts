import { aliasGQLQuery } from '@vegaprotocol/cypress';
import { MarketState, MarketStateMapping } from '@vegaprotocol/types';
import { addDays, subDays } from 'date-fns';
import {
  assetsQuery,
  chainIdQuery,
  statisticsQuery,
  closedMarketsQuery,
  createClosedMarket,
  createDataConnection,
  oracleSpecDataConnectionQuery,
} from '@vegaprotocol/mock';
import { networkParamsQuery } from '@vegaprotocol/mock';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';

describe('Closed markets', { tags: '@smoke' }, () => {
  const rowSelector =
    '[data-testid="tab-closed-markets"] .ag-center-cols-container .ag-row';

  const assetsResult = assetsQuery();
  // @ts-ignore asset definitely exists
  const settlementAsset = assetsResult.assetsConnection.edges[0].node;

  const settledMarket = createClosedMarket({
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

  const terminatedMarket = createClosedMarket({
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

  const delayedSettledMarket = createClosedMarket({
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

  const unknownMarket = createClosedMarket({ id: '3' });

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
    { node: createClosedMarket({ id: '4', state: MarketState.STATE_PENDING }) },
    { node: createClosedMarket({ id: '5', state: MarketState.STATE_ACTIVE }) },
  ];

  const specDataConnection = createDataConnection();

  before(() => {
    cy.mockGQL((req) => {
      aliasGQLQuery(req, 'ChainId', chainIdQuery());
      aliasGQLQuery(req, 'Statistics', statisticsQuery());
      aliasGQLQuery(req, 'NetworkParams', networkParamsQuery());
      aliasGQLQuery(req, 'Assets', assetsResult);
      aliasGQLQuery(
        req,
        'ClosedMarkets',
        closedMarketsQuery({
          marketsConnection: {
            edges: closedMarketsResult,
          },
        })
      );
      aliasGQLQuery(
        req,
        'OracleSpecDataConnection',
        oracleSpecDataConnectionQuery()
      );
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
          // @ts-ignore cannot deep un-partial
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
