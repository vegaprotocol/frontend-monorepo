import { aliasQuery } from '@vegaprotocol/cypress';
import { MarketState } from '@vegaprotocol/types';
import { generateMarketList } from '../support/mocks/generate-market-list';
import { mockTradingPage } from '../support/trading';

describe('markets table', () => {
  beforeEach(() => {
    cy.mockGQL((req) => {
      aliasQuery(req, 'MarketList', generateMarketList());
    });
    cy.visit('/');
    cy.wait('@MarketList');
  });

  it('renders markets correctly', () => {
    cy.get('[data-testid^="market-link-"]')
      .should('not.be.empty')
      .and('have.attr', 'href');
    cy.getByTestId('price').invoke('text').should('not.be.empty');
    cy.getByTestId('settlement-asset').should('not.be.empty');
    cy.getByTestId('price-change-percentage').should('not.be.empty');
    cy.getByTestId('price-change').should('not.be.empty');
    cy.getByTestId('sparkline-svg').should('be.visible');
  });

  it('renders market list drop down', () => {
    openMarketDropDown();
    cy.getByTestId('price').invoke('text').should('not.be.empty');
    cy.getByTestId('trading-mode').should('not.be.empty');
    cy.getByTestId('taker-fee').should('contain.text', '%');
    cy.getByTestId('market-volume').should('not.be.empty');
    cy.getByTestId('market-name').should('not.be.empty');
  });

  it('Able to select market from dropdown', () => {
    cy.mockGQL((req) => {
      mockTradingPage(req, MarketState.Active);
    });

    openMarketDropDown();
    cy.getByTestId('market-link-market-0').click();

    cy.wait('@Market');
    cy.contains('ACTIVE MARKET');
    cy.url().should('include', '/markets/market-0');
    verifyMarketSummaryDisplayed();
  });

  it.skip('renders correctly - old', () => {
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

  it.skip('can select an active market', () => {
    cy.wait('@Markets');
    cy.get('.ag-root-wrapper').should('be.visible');

    cy.mockGQL((req) => {
      mockTradingPage(req, MarketState.Active);
    });

    // click on market
    cy.get('[role="gridcell"][col-id=data]').should('be.visible');
    cy.get('[role="gridcell"][col-id=name]').contains('ACTIVE MARKET').click();

    cy.wait('@Market');
    cy.contains('ACTIVE MARKET');
    cy.url().should('include', '/markets/market-0');
    verifyMarketSummaryDisplayed();
  });

  function openMarketDropDown() {
    cy.getByTestId('dialog-close').click();
    cy.getByTestId('popover-trigger').click();
    cy.contains('Loading market data...').should('not.exist');
  }

  function verifyMarketSummaryDisplayed() {
    const marketSummaryBlock = 'market-summary';
    const percentageValue = 'price-change-percentage';
    const priceChangeValue = 'price-change';
    const tradingVolume = 'trading-volume';
    const tradingMode = 'trading-mode';

    cy.getByTestId(marketSummaryBlock).within(() => {
      cy.contains('Change (24h)');
      cy.getByTestId(percentageValue).should('not.be.empty');
      cy.getByTestId(priceChangeValue).should('not.be.empty');
      cy.contains('Volume');
      cy.getByTestId(tradingVolume).should('not.be.empty');
      cy.contains('Trading mode');
      cy.getByTestId(tradingMode).should('not.be.empty');
    });
  }
});
