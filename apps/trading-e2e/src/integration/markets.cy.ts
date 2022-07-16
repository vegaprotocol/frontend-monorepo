import { aliasQuery } from '@vegaprotocol/cypress';
import { MarketTradingMode } from '@vegaprotocol/types';
import { generateMarkets } from '../support/mocks/generate-markets';
import { mockTradingPage } from '../support/trading';

describe('markets table', () => {
  beforeEach(() => {
    cy.mockGQL((req) => {
      aliasQuery(req, 'Markets', generateMarkets());
    });
    cy.visit('/markets');
  });

  it('renders correctly', () => {
    const marketRowHeaderClassname = 'div > span.ag-header-cell-text';
    const marketRowNameColumn = 'tradableInstrument.instrument.code';
    const marketRowSymbolColumn =
      'tradableInstrument.instrument.product.settlementAsset.symbol';
    const marketRowPrices = 'flash-cell';
    const marketRowDescription = 'name';

    cy.wait('@Markets');
    cy.get('.ag-root-wrapper').should('be.visible');

    const expectedMarketHeaders = [
      'Market',
      'Settlement asset',
      'Trading mode',
      'Best bid',
      'Best offer',
      'Mark price',
      'Description',
    ];

    for (let index = 0; index < expectedMarketHeaders.length; index++) {
      cy.get(marketRowHeaderClassname).should(
        'contain.text',
        expectedMarketHeaders[index]
      );
    }

    cy.get(`[col-id='${marketRowNameColumn}']`).each(($marketName) => {
      cy.wrap($marketName).should('not.be.empty');
    });

    cy.get(`[col-id='${marketRowSymbolColumn}']`).each(($marketSymbol) => {
      cy.wrap($marketSymbol).should('not.be.empty');
    });

    cy.getByTestId(marketRowPrices).each(($price) => {
      cy.wrap($price).should('not.be.empty').and('contain.text', '.');
    });

    cy.get(`[col-id='${marketRowDescription}']`).each(($marketDescription) => {
      cy.wrap($marketDescription).should('not.be.empty');
    });
  });

  it('can select an continuously trading market', () => {
    cy.wait('@Markets');
    cy.get('.ag-root-wrapper').should('be.visible');

    cy.mockGQL((req) => {
      mockTradingPage(req, MarketTradingMode.Continuous);
    });

    // click on market
    cy.get('[role="gridcell"][col-id=data]').should('be.visible');

    cy.wait('@Market');
    cy.contains(MarketTradingMode.Continuous);
    cy.url().should('include', '/markets/market-0');

    verifyMarketSummaryDisplayed('Active');
  });

  it('can select a monitoring auction trading market', () => {
    cy.wait('@Markets');
    cy.get('.ag-root-wrapper').should('be.visible');

    cy.mockGQL((req) => {
      mockTradingPage(req, MarketTradingMode.MonitoringAuction);
    });

    // click on market
    cy.get('[role="gridcell"][col-id=data]').should('be.visible');

    cy.wait('@Market');
    cy.contains(MarketTradingMode.MonitoringAuction);
    cy.url().should('include', '/markets/market-1');

    verifyMarketSummaryDisplayed('Suspended');
  });

  function verifyMarketSummaryDisplayed(expectedMarketState: string) {
    const marketSummaryBlock = 'market-summary';
    const percentageValue = 'price-change-percentage';
    const priceChangeValue = 'price-change';
    const tradingVolume = 'trading-volume';
    const tradingMode = 'trading-mode';
    const marketState = 'market-state';

    cy.getByTestId(marketSummaryBlock).within(() => {
      cy.contains('Change (24h)');
      cy.getByTestId(percentageValue).should('not.be.empty');
      cy.getByTestId(priceChangeValue).should('not.be.empty');
      cy.contains('Volume');
      cy.getByTestId(tradingVolume).should('not.be.empty');
      cy.contains('Trading mode');
      cy.getByTestId(tradingMode).should('not.be.empty');
      cy.contains('State');
      cy.getByTestId(marketState).should('have.text', expectedMarketState);
    });
  }
});
