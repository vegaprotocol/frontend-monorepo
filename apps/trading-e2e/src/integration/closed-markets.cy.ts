import { aliasGQLQuery } from '@vegaprotocol/cypress';
import type { DataSourceDefinition } from '@vegaprotocol/types';
import {
  MarketState,
  MarketStateMapping,
  PropertyKeyType,
} from '@vegaprotocol/types';
import { addDays, subDays } from 'date-fns';
import {
  chainIdQuery,
  statisticsQuery,
  createDataConnection,
  oracleSpecDataConnectionQuery,
  createMarketFragment,
  marketsQuery,
  marketsDataQuery,
  createMarketsDataFragment,
  assetQuery,
  networkParamsQuery,
  nodeGuardQuery,
} from '@vegaprotocol/mock';
import {
  addDecimalsFormatNumber,
  getDateTimeFormat,
} from '@vegaprotocol/utils';

describe('Closed markets', { tags: '@smoke' }, () => {
  const settlementDataProperty = 'settlement-data-property';
  const settlementDataPropertyKey = {
    __typename: 'PropertyKey' as const,
    name: settlementDataProperty,
    type: PropertyKeyType.TYPE_INTEGER,
    numberDecimalPlaces: 2,
  };
  const settlementDataSourceData: DataSourceDefinition = {
    sourceType: {
      sourceType: {
        filters: [
          {
            __typename: 'Filter',
            key: settlementDataPropertyKey,
          },
        ],
      },
    },
  };
  const rowSelector =
    '[data-testid="tab-closed-markets"] .ag-center-cols-container .ag-row';

  const assetsResult = assetQuery();
  // @ts-ignore asset definitely exists
  const settlementAsset = assetsResult.assetsConnection.edges[0].node;

  const settledMarket = createMarketFragment({
    id: '0',
    state: MarketState.STATE_SETTLED,
    marketTimestamps: {
      open: subDays(new Date(), 10).toISOString(),
      close: subDays(new Date(), 4).toISOString(),
    },
    tradableInstrument: {
      instrument: {
        product: {
          dataSourceSpecBinding: {
            settlementDataProperty,
          },
          dataSourceSpecForTradingTermination: {
            id: 'market-1-trading-termination-oracle-id',
          },
          dataSourceSpecForSettlementData: {
            id: 'market-1-settlement-data-oracle-id',
            data: settlementDataSourceData,
          },
          settlementAsset,
        },
      },
    },
  });

  const terminatedMarket = createMarketFragment({
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
        product: {
          dataSourceSpecBinding: {
            settlementDataProperty,
          },
          dataSourceSpecForSettlementData: {
            id: 'market-1-settlement-data-oracle-id',
            data: settlementDataSourceData,
          },
        },
      },
    },
  });

  const delayedSettledMarket = createMarketFragment({
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
        product: {
          dataSourceSpecBinding: {
            settlementDataProperty,
          },
          dataSourceSpecForSettlementData: {
            id: 'market-1-settlement-data-oracle-id',
            data: settlementDataSourceData,
          },
        },
      },
    },
  });

  const unknownMarket = createMarketFragment({
    id: '3',
    state: MarketState.STATE_SETTLED,
  });

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
    {
      node: createMarketFragment({ id: '4', state: MarketState.STATE_PENDING }),
    },
    {
      node: createMarketFragment({ id: '5', state: MarketState.STATE_ACTIVE }),
    },
  ];

  const settledMarketData = createMarketsDataFragment({
    market: {
      id: settledMarket.id,
    },
    bestBidPrice: '1000',
    bestOfferPrice: '2000',
    markPrice: '1500',
  });

  const closedMarketsDataResult = [
    {
      node: {
        data: settledMarketData,
      },
    },
    {
      node: {
        data: createMarketsDataFragment({
          market: {
            id: terminatedMarket.id,
          },
        }),
      },
    },
    {
      node: {
        data: createMarketsDataFragment({
          market: {
            id: delayedSettledMarket.id,
          },
        }),
      },
    },
    {
      node: {
        data: createMarketsDataFragment({
          market: {
            id: unknownMarket.id,
          },
        }),
      },
    },
  ];

  const specDataConnection = createDataConnection();

  before(() => {
    cy.mockGQL((req) => {
      aliasGQLQuery(req, 'ChainId', chainIdQuery());
      aliasGQLQuery(req, 'Statistics', statisticsQuery());
      aliasGQLQuery(req, 'NodeGuard', nodeGuardQuery());
      aliasGQLQuery(req, 'NetworkParams', networkParamsQuery());
      aliasGQLQuery(
        req,
        'Markets',
        marketsQuery({
          marketsConnection: {
            edges: closedMarketsResult,
          },
        })
      );
      aliasGQLQuery(
        req,
        'MarketsData',
        marketsDataQuery({
          marketsConnection: {
            edges: closedMarketsDataResult,
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
    // 6001-MARK-001
    cy.get(rowSelector)
      .first()
      .find('[col-id="code"]')
      .should('have.text', settledMarket.tradableInstrument.instrument.code);

    // 6001-MARK-002
    cy.get(rowSelector)
      .first()
      .find('[col-id="name"]')
      .should('have.text', settledMarket.tradableInstrument.instrument.name);

    // 6001-MARK-003
    cy.get(rowSelector)
      .first()
      .find('[col-id="state"]')
      .should('have.text', MarketStateMapping[settledMarket.state]);

    // 6001-MARK-004
    // 6001-MARK-005
    // 6001-MARK-009
    // 6001-MARK-008
    // 6001-MARK-010
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
      .should('have.text', '4 days ago')
      .should(
        'have.attr',
        'title',
        getDateTimeFormat().format(
          new Date(settledMarket.marketTimestamps.close)
        )
      );

    // 6001-MARK-011
    cy.get(rowSelector)
      .first()
      .find('[col-id="bestBidPrice"]')
      .should(
        'have.text',
        addDecimalsFormatNumber(
          settledMarketData.bestBidPrice,
          settledMarket.decimalPlaces
        )
      );

    // 6001-MARK-012
    cy.get(rowSelector)
      .first()
      .find('[col-id="bestOfferPrice"]')
      .should(
        'have.text',
        addDecimalsFormatNumber(
          settledMarketData.bestOfferPrice,
          settledMarket.decimalPlaces
        )
      );

    // 6001-MARK-013
    cy.get(rowSelector).first().find('[col-id="markPrice"]').should(
      'have.text',

      addDecimalsFormatNumber(
        settledMarketData.markPrice,
        settledMarket.decimalPlaces
      )
    );

    // 6001-MARK-014
    // 6001-MARK-015
    // 6001-MARK-016
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
          settlementDataPropertyKey.numberDecimalPlaces
        )
      );

    // 6001-MARK-018
    cy.get(rowSelector)
      .first()
      .find('[col-id="settlementAsset"]')
      .should('have.text', product.settlementAsset.symbol);

    // 6001-MARK-020
    cy.get('.ag-pinned-right-cols-container')
      .find('[col-id="market-actions"]')
      .first()
      .find('button svg')
      .should('exist');

    if (Cypress.env('NX_SUCCESSOR_MARKETS')) {
      cy.get(rowSelector)
        .find('[col-id="successorMarketID"]')
        .first()
        .should('have.text', ' - ');
    }
  });

  // test market list for market in terminated state
  it('renders a terminated market', () => {
    cy.get(rowSelector)
      .eq(1)
      .find('[col-id="state"]')
      .should('have.text', MarketStateMapping[terminatedMarket.state]);

    // 6001-MARK-006
    // 6001-MARK-007
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
    cy.mockGQL((req) => {
      aliasGQLQuery(req, 'Asset', assetsResult);
    });

    cy.get(rowSelector)
      .first()
      .find('[col-id="settlementAsset"]')
      .find('button')
      .click();

    // 6001-MARK-019
    cy.get('[data-testid="dialog-title"]').should(
      'have.text',
      `Asset details - ${settlementAsset.symbol}`
    );

    cy.get('[data-testid="dialog-close"]').click();
  });

  it('can open row actions', () => {
    cy.get('.ag-pinned-right-cols-container')
      .find('[col-id="market-actions"]')
      .first()
      .find('button')
      .click();

    const dropdownContent = '[data-testid="market-actions-content"]';
    const dropdownContentItem = '[role="menuitem"]';
    cy.get(dropdownContent)
      .find(dropdownContentItem)
      .eq(0)
      // Cannot click the copy button as it falls back to window.prompt, blocking the test.
      .should('have.text', 'Copy Market ID');

    cy.get(dropdownContent)
      .find(dropdownContentItem)
      .eq(1)
      .find('a')
      .then(($el) => {
        const href = $el.attr('href');
        expect(/\/markets\/0/.test(href || '')).to.equal(true);
      })
      .should('have.text', 'View on Explorer');
  });
});

describe('no closed markets', { tags: '@smoke', testIsolation: true }, () => {
  before(() => {
    cy.mockTradingPage();
    cy.mockSubscription();
    cy.visit('/#/markets/all');
    cy.get('[data-testid="Closed markets"]').click();
  });

  it('can see no markets message', () => {
    // 6001-MARK-034
    cy.getByTestId('tab-closed-markets').should('contain.text', 'No markets');
  });
});
